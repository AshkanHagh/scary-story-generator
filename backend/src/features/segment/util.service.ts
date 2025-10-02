import { Injectable } from "@nestjs/common";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import { ImageJobNames, StoryJobNames, WorkerEvents } from "src/worker/event";
import { Queue } from "bullmq";
import {
  GenerateSegmentImageJobData,
  GenerateSegmentVoiceJobData,
  RegenrateSegmentImageJobData,
} from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Injectable()
export class SegmentUtilService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
    private repo: RepositoryService,
  ) {}

  async createSegmentWithImage(
    // Userid for consuming token from user tokens
    userId: string,
    storyId: string,
    text: string,
    order: number,
    context: string,
  ): Promise<void> {
    const segment = await this.repo.segment().insert({
      storyId,
      text,
      order,
      status: "pending",
    });

    await Promise.all([
      this.storyQueue.add(StoryJobNames.GENERATE_SEGMENT_IMAGE_REPLICATE, {
        storyId,
        segmentId: segment.id,
        context,
        segment: text,
      } as GenerateSegmentImageJobData),

      this.storyQueue.add(StoryJobNames.GENERATE_SEGMENT_VOICE, {
        segment: text,
        segmentId: segment.id,
      } as GenerateSegmentVoiceJobData),
    ]);
  }

  async generateSegmentImage(
    storyId: string,
    segmentId: string,
    segment: string,
  ): Promise<void> {
    const story = await this.repo.story().find(storyId);
    // NOTE: always exists
    if (!story) {
      throw new StoryError(StoryErrorType.FailedToGenerateStory);
    }

    const jobData: RegenrateSegmentImageJobData = {
      prompt: segment,
      segmentId: segmentId,
    };
    await this.imageQueue.add(ImageJobNames.GENERATE_IMAGE, jobData);
  }
}
