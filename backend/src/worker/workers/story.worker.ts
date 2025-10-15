import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { SegmentUtilService } from "src/features/segment/util.service";
import { Logger } from "@nestjs/common";
import {
  GenerateSegmentAudio,
  GenerateSegmentImage,
  GenerateStoryCtx,
} from "../types";

@Processor(WorkerEvents.Story, { concurrency: 4 })
export class StoryWorker extends WorkerHost {
  private logger = new Logger(StoryWorker.name);

  constructor(private segmentUtilService: SegmentUtilService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case StoryJobNames.GENERATE_STORY_CONTEXT as string: {
        const payload = job.data as GenerateStoryCtx;

        await this.segmentUtilService.generateStoryContext(
          payload.storyId,
          payload.script,
        );
        // starts generate audio/image jobs
        await this.segmentUtilService.generateSegmentsAndJobs(
          payload.storyId,
          payload.script,
        );
        break;
      }
      case StoryJobNames.GENERATE_SEGMENT_IMAGE as string: {
        const payload = job.data as GenerateSegmentImage;
        await this.segmentUtilService.generateSegmentImage(
          payload.storyId,
          payload.segmentId,
          payload.segment,
        );
        break;
      }
      case StoryJobNames.GENERATE_SEGMENT_VOICE as string: {
        const payload = job.data as GenerateSegmentAudio;
        await this.segmentUtilService.generateSegmentVoice(
          payload.segmentId,
          payload.segment,
        );
        break;
      }
    }
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    this.logger.log(`Job ${job.name} is active`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.name} is completed`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job) {
    this.logger.error(`Job ${job.name} failed`);
  }
}
