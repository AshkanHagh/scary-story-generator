import { InjectFlowProducer } from "@nestjs/bullmq";
import { FlowProducer } from "bullmq";
import { Injectable } from "@nestjs/common";
import { FLOW_PRODUCER, VIDEO_QUEUE } from "src/queue/constants";
import { InjectDatabase } from "src/drizzle/constants";
import { Database } from "src/drizzle/types";
import { and, eq } from "drizzle-orm";
import { StoryTable, Video, VideoTable } from "src/drizzle/schemas";
import { StoryError, StoryErrorType } from "src/filters/exception";
import { VIDEO_QUEUES } from "./constants";
import { withTrace } from "src/utils/queue-trace";
import { FastifyRequest } from "fastify";
import { pollUntil } from "src/utils/poll";

@Injectable()
export class VideoService {
  constructor(
    @InjectFlowProducer(FLOW_PRODUCER) private flowProducer: FlowProducer,
    @InjectDatabase() private db: Database,
  ) {}

  async generateVideo(req: FastifyRequest, userId: string, storyId: string) {
    const story = await this.db.query.StoryTable.findFirst({
      where: and(
        eq(StoryTable.id, storyId),
        eq(StoryTable.userId, userId),
        eq(StoryTable.step, "segment"),
      ),
      with: { segments: true },
    });
    if (!story) {
      throw new StoryError(StoryErrorType.NOT_FOUND);
    }
    const [{ id: videoId }] = await this.db
      .insert(VideoTable)
      .values({
        status: "pending",
        storyId,
        userId,
      })
      .$returningId();

    const genSegmentVideoJob = story.segments.map((segment) => ({
      name: VIDEO_QUEUES.VIDEO,
      queueName: VIDEO_QUEUE,
      data: withTrace(req, {
        storyId,
        segmentId: segment.id,
      }),
    }));
    await this.flowProducer.add({
      name: VIDEO_QUEUES.FINALIZE,
      queueName: VIDEO_QUEUE,
      data: withTrace(req, {
        storyId,
        videoId,
      }),
      opts: { failParentOnFailure: true },
      children: [
        {
          name: VIDEO_QUEUES.VIDEO_CONCAT,
          queueName: VIDEO_QUEUE,
          data: withTrace(req, {
            storyId,
            videoId,
          }),
          opts: { failParentOnFailure: true },
          children: genSegmentVideoJob,
        },
      ],
    });
    return videoId;
  }

  async pollStoryVideoStatus(userId: string, videoId: string) {
    const fetchFn = async () => {
      const video = await this.db.query.VideoTable.findFirst({
        where: and(eq(VideoTable.id, videoId), eq(VideoTable.userId, userId)),
      });
      if (!video) {
        throw new StoryError(StoryErrorType.NOT_FOUND);
      }
      return video;
    };
    const shouldResolve = (video: Video) => {
      return video.status !== "pending";
    };
    return await pollUntil(fetchFn, shouldResolve, {
      interval: 1000,
      timeout: 1000 * 30,
    });
  }

  async userVideos(userId: string) {
    return await this.db.query.VideoTable.findMany({
      where: eq(VideoTable.userId, userId),
    });
  }
}
