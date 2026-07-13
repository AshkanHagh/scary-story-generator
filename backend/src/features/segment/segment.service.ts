import { Injectable } from "@nestjs/common";
import { InjectFlowProducer } from "@nestjs/bullmq";
import { FlowChildJob, FlowProducer } from "bullmq";
import { pollUntil } from "src/utils/poll";
import { SEGMENT_FLOW_PRODUCER, SEGMENT_QUEUE } from "./constants";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { and, eq } from "drizzle-orm";
import { Segment, SegmentTable, StoryTable } from "src/drizzle/schemas";
import { StoryError, StoryErrorType } from "src/filters/exception";
import { QuotaService } from "../llm/quota.service";

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
    private quotaService: QuotaService,
  ) {}

  async generateSegment(userId: string, storyId: string) {
    const story = await this.db.query.StoryTable.findFirst({
      where: and(eq(StoryTable.id, storyId), eq(StoryTable.userId, userId)),
    });
    if (!story) {
      throw new StoryError(StoryErrorType.NOT_FOUND);
    }

    const segments = story.script.split(/\n{2,}/);
    const segmentJobs: FlowChildJob[] = [];
    await this.quotaService.consume({
      stories: 1,
      images: segments.length,
      voiceChars: story.script.length,
    });

    const promise = segments.map(async (text, index) => {
      const [segment] = await this.db
        .insert(SegmentTable)
        .values({
          storyId,
          text: text,
          order: index,
          status: "pending",
        })
        .$returningId();

      segmentJobs.push({
        name: "segment-generate-image",
        queueName: SEGMENT_QUEUE,
        data: {
          storyId,
          segmentId: segment.id,
          text,
        },
      });
    });
    await Promise.all(promise);
    await this.segmentQueue.addBulk([
      ...segmentJobs,
      // using a fake queue to finish audio/context, could just use the last segment job
      {
        name: "last-random-job",
        queueName: "random-queue",
        children: [
          {
            name: "story-generate-audio",
            queueName: "story",
            data: {
              storyId,
              story: story.script,
            },
          },
          {
            name: "story-generate-context",
            queueName: "story",
            data: {
              storyId,
              story: story.script,
            },
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
