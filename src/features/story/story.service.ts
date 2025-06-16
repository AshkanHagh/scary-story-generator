import { Injectable } from "@nestjs/common";
import { IStoryService } from "./interfaces/service";
import { CreateStoryDto } from "./dtos";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import { ImageJobNames, StoryJobNames, WorkerEvents } from "src/worker/event";
import { Queue } from "bullmq";
import {
  DownloadSegmentAssetJobData,
  GenerateImageContextJobData,
} from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ISegment, IStory, IVideoRecord } from "src/drizzle/schema";
import { PollSegmentsStatusResponse } from "./types";
import { pollUntil } from "./utils";

@Injectable()
export class StoryService implements IStoryService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
    private repo: RepositoryService,
  ) {}

  async createStory(userId: string, payload: CreateStoryDto): Promise<IStory> {
    const story = await this.repo.story().insert({
      title: payload.title,
      script: payload.script,
      userId,
    });

    return story;
  }

  // TODO: add check for story already have segment or not
  async generateSegment(userId: string, storyId: string): Promise<void> {
    // Throws error if story does not exist
    const story = await this.repo.story().userHasAccess(storyId, userId);

    const jobData: GenerateImageContextJobData = {
      script: story.script,
      storyId,
      userId,
    };
    await this.storyQueue.add(StoryJobNames.GENERATE_IMAGE_CONTEXT, jobData);
  }

  async generateVideo(userId: string, storyId: string): Promise<void> {
    const story = await this.repo.story().findWithSegments(storyId);
    if (!story) {
      throw new StoryError(StoryErrorType.NotFound);
    }

    if (story.userId !== userId) {
      throw new StoryError(StoryErrorType.HasNoPermission);
    }

    story.segments.forEach((segment) => {
      if (segment.status === "pending") {
        throw new StoryError(StoryErrorType.NotCompleted);
      }
    });

    await this.repo.videoProcessingStatus().insert({
      storyId: story.id,
      totalSegments: story.segments.length,
      completedSegments: 0,
    });

    const video = await this.repo.video().insert({
      status: "pending",
      storyId: story.id,
      userId,
    });

    await Promise.all([
      story.segments.map((segment) => {
        const jobData: DownloadSegmentAssetJobData = {
          videoId: video.id,
          segment,
        };
        return this.imageQueue.add(
          ImageJobNames.DOWNLOAD_AND_GENERATE_SEGMENT_FRAME,
          jobData,
        );
      }),
    ]);
  }

  async getStory(userId: string, storyId: string): Promise<IStory> {
    const story = await this.repo.story().userHasAccess(storyId, userId);
    return story;
  }

  async getSegments(userId: string, storyId: string): Promise<ISegment[]> {
    await this.repo.story().userHasAccess(storyId, userId);
    const story = await this.repo.story().findWithSegments(storyId);
    if (!story) {
      throw new StoryError(StoryErrorType.NotFound, "Story not found");
    }

    return story.segments;
  }

  async pollSegmentStatus(
    userId: string,
    storyId: string,
  ): Promise<PollSegmentsStatusResponse> {
    await this.repo.story().userHasAccess(storyId, userId);

    const pollInterval = 1000 * 1;
    const maxWaitTime = 1000 * 30;

    const fetchFn = async (): Promise<PollSegmentsStatusResponse> => {
      const story = await this.repo.story().findWithSegments(storyId);
      if (!story) {
        throw new StoryError(StoryErrorType.NotFound, "Story not found");
      }

      const completedSegments = story.segments.filter(
        (s) => s.status === "completed",
      );
      const isCompleted = completedSegments.length === story.segments.length;

      return {
        isCompleted,
        segments: story.segments,
      };
    };

    const shouldResolve = (data: PollSegmentsStatusResponse) => {
      const hasChanges = data.segments.some((s) => s.status !== "pending");
      return hasChanges || data.isCompleted;
    };

    return await pollUntil(fetchFn, shouldResolve, {
      pollInterval,
      maxWaitTime,
    });
  }

  async pollStoryVideoStatus(
    userId: string,
    storyId: string,
  ): Promise<IVideoRecord> {
    const pollInterval = 1000 * 1;

    const fetchFn = async () => {
      const video = await this.repo.video().findByStoryId(storyId);
      await this.repo.video().userHasAccess(video.id, userId);

      const videoRecord: IVideoRecord = {
        id: video.id,
        status: video.status,
        url: video.url,
        createdAt: video.createdAt,
        storyId: video.storyId,
        userId: video.userId,
      };
      return videoRecord;
    };

    const shouldResolve = (video: IVideoRecord) => {
      const hasChange = video.status !== "pending";
      return hasChange;
    };

    return await pollUntil(fetchFn, shouldResolve, {
      pollInterval,
    });
  }
}
