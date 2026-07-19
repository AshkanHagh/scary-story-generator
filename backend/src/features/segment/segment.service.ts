import { Injectable } from "@nestjs/common";
import { InjectFlowProducer } from "@nestjs/bullmq";
import { FlowChildJob, FlowProducer } from "bullmq";
import { pollUntil } from "src/utils/poll";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { and, eq } from "drizzle-orm";
import { Segment, SegmentTable, StoryTable } from "src/drizzle/schemas";
import { StoryError, StoryErrorType } from "src/filters/exception";
import { AiService } from "../ai/ai.service";
import { SEGMENT_FLOW_PRODUCER, SEGMENT_QUEUE } from "src/queue/constants";
import { SEGMENT_QUEUES } from "./constants";
import { FastifyRequest } from "fastify";
import { withTrace } from "src/utils/queue-trace";

export type PollSegmentsStatus = {
  segments: Segment[];
  completedCount: number;
  isCompleted: boolean;
};

@Injectable()
export class SegmentService {
  constructor(
    @InjectFlowProducer(SEGMENT_FLOW_PRODUCER)
    private segmentQueue: FlowProducer,
    @InjectDatabase()
    private db: Database,
    private aiService: AiService,
  ) {}

  async generateSegment(req: FastifyRequest, userId: string, storyId: string) {
    const story = await this.db.query.StoryTable.findFirst({
      where: and(eq(StoryTable.id, storyId), eq(StoryTable.userId, userId)),
      with: {
        segments: true,
      },
    });
    if (!story) {
      throw new StoryError(StoryErrorType.NOT_FOUND);
    }
    // FIX: find a better way to stop user from infinitely generate segments
    if (story.segments.length > 0) {
      throw new StoryError(StoryErrorType.REQ_ALREADY_PROCESSED);
    }
    if (!story.context) {
      // lightwight ai req, this can be used as the whole ai providers in app work or not
      const storyContext = await this.aiService.genStoryContext(story.script);
      await this.db
        .update(StoryTable)
        .set({ context: storyContext })
        .where(eq(StoryTable.id, story.id));
    }

    const segmentJobs: FlowChildJob[] = [];
    const segments = story.script.split(/\n{2,}/);
    await this.db.transaction(async (tx) => {
      const promise = segments.map(async (text, index) => {
        const [segment] = await tx
          .insert(SegmentTable)
          .values({
            storyId,
            text: text,
            order: index,
            status: "pending",
          })
          .$returningId();
        segmentJobs.push({
          name: SEGMENT_QUEUES.IMAGE,
          queueName: SEGMENT_QUEUE,
          data: withTrace(req, {
            story,
            segmentId: segment.id,
            text,
          }),
        });
      });
      await Promise.all(promise);
    });

    await this.segmentQueue.addBulk([
      ...segmentJobs,
      {
        name: SEGMENT_QUEUES.FINALIZE,
        queueName: SEGMENT_QUEUE,
        children: [
          {
            name: SEGMENT_QUEUES.SPEACH,
            queueName: SEGMENT_QUEUE,
            data: withTrace(req, {
              storyId,
              script: story.script,
            }),
          },
        ],
      },
    ]);
  }

  async getSegments(userId: string, storyId: string) {
    const story = await this.db.query.StoryTable.findFirst({
      where: and(eq(StoryTable.id, storyId), eq(StoryTable.userId, userId)),
      with: {
        segments: true,
      },
    });
    if (!story) {
      throw new StoryError(StoryErrorType.NOT_FOUND);
    }
    return story.segments;
  }

  // (long polling) hold http connection until a pending segment updates to completed or http timout
  async pollSegmentStatus(
    userId: string,
    storyId: string,
  ): Promise<PollSegmentsStatus> {
    const story = await this.db.query.StoryTable.findFirst({
      where: and(eq(StoryTable.id, storyId), eq(StoryTable.userId, userId)),
      with: {
        segments: {
          where: eq(SegmentTable.status, "completed"),
        },
      },
    });
    if (!story) {
      throw new StoryError(StoryErrorType.NOT_FOUND);
    }

    const initialSegments = story.segments;

    const fetchFn = async () => {
      const segments = await this.db.query.SegmentTable.findMany({
        where: eq(SegmentTable.storyId, storyId),
      });
      const completed = segments.filter(
        (segment) => segment.status === "completed",
      );
      return {
        segments,
        completedCount: completed.length,
        isCompleted: completed.length === segments.length,
      };
    };
    const shouldResolve = (data: PollSegmentsStatus) => {
      return data.completedCount > initialSegments.length || data.isCompleted;
    };
    return await pollUntil(fetchFn, shouldResolve, {
      interval: 1000,
      timeout: 1000 * 30,
    });
  }
}
