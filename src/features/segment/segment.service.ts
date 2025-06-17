import { Injectable } from "@nestjs/common";
import { ISegmentService } from "./interfaces/service";
import { InjectQueue } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "src/worker/event";
import { Queue } from "bullmq";
import { RepositoryService } from "src/repository/repository.service";
import { GenerateImageContextJobData } from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ISegment } from "src/drizzle/schema";
import { PollSegmentsStatusResponse } from "./types";
import { pollUntil } from "src/utils/poll";

@Injectable()
export class SegmentService implements ISegmentService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    private repo: RepositoryService,
  ) {}

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
}
