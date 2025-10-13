import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { SegmentUtilService } from "src/features/segment/util.service";
import { Inject, Logger } from "@nestjs/common";
import { STORY_AGENT_SERVICE } from "src/features/llm-agent/constants";
import { IStoryAgentService } from "src/features/llm-agent/interfaces/service";
import {
  GenerateSegmentAudio,
  GenerateSegmentImage,
  GenerateStoryCtx,
} from "../types";

@Processor(WorkerEvents.Story, { concurrency: 4 })
export class StoryWorker extends WorkerHost {
  private logger = new Logger(StoryWorker.name);

  constructor(
    @Inject(STORY_AGENT_SERVICE) private storyAgent: IStoryAgentService,
    private segmentUtilService: SegmentUtilService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      switch (job.name) {
        // TODO: make generate segment children of story context
        case StoryJobNames.GENERATE_STORY_CONTEXT as string: {
          const payload = job.data as GenerateStoryCtx;

          await this.segmentUtilService.generateStoryContext(
            payload.storyId,
            payload.script,
          );
          // child process of generate story context
          await this.segmentUtilService.generateSegmentsAndJobs(
            job.id!,
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
        }
      }
    } catch (error) {
      this.logger.error(
        `Error processing job ${job.name}: ${JSON.stringify(error)}`,
      );
      throw error;
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
