import { Processor, WorkerHost } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { StoryAgentService } from "src/features/llm-agent/services/story-agent.service";
import { RepositoryService } from "src/repository/repository.service";
import {
  GenerateImageContextJobData,
  GenerateSegmentImageJobData,
  GenerateSegmentVoiceJobData,
} from "../types";
import { S3Service } from "src/features/story/services/s3.service";
import { v4 as uuid } from "uuid";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { SegmentUtilService } from "src/features/segment/util.service";

@Processor(WorkerEvents.Story, { concurrency: 4 })
export class StoryWorker extends WorkerHost {
  constructor(
    private storyAgent: StoryAgentService,
    private repo: RepositoryService,
    private s3: S3Service,
    private segmentUtilService: SegmentUtilService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      console.log("Processing job:", job.name);

      switch (job.name) {
        case StoryJobNames.GENERATE_IMAGE_CONTEXT as string: {
          const payload = job.data as GenerateImageContextJobData;
          await this.generateImageContext(payload);

          break;
        }
        case StoryJobNames.GENERATE_SEGMENT_IMAGE_REPLICATE as string: {
          const payload = job.data as GenerateSegmentImageJobData;
          await this.generateSegmentImage(payload);

          break;
        }
        case StoryJobNames.GENERATE_SEGMENT_VOICE as string: {
          const payload = job.data as GenerateSegmentVoiceJobData;
          await this.generateSegmentVoice(payload);
        }
      }

      console.log("Job processed successfully:", job.name);
    } catch (error: unknown) {
      console.log("Error processing job:", job.name);
      console.error(error);

      throw new StoryError(StoryErrorType.FailedToGenerateStory, error);
    }
  }

  private async generateImageContext(
    payload: GenerateImageContextJobData,
  ): Promise<void> {
    const context = await this.storyAgent.generateStoryContext(payload.script);

    await this.repo.story().update(payload.storyId, { context });

    const segments = payload.script.split(/\n{2,}/);
    for (let i = 0; i < segments.length; i++) {
      await this.segmentUtilService.createSegmentWithImage(
        payload.userId,
        payload.storyId,
        segments[i],
        i,
        context,
      );
    }
  }

  private async generateSegmentImage(
    payload: GenerateSegmentImageJobData,
  ): Promise<void> {
    const prompt = await this.storyAgent.generateSegmentImagePrompt(
      payload.context,
      payload.segment,
    );

    await this.segmentUtilService.generateSegmentImage(
      payload.storyId,
      payload.segmentId,
      prompt,
    );
  }

  private async generateSegmentVoice(
    payload: GenerateSegmentVoiceJobData,
  ): Promise<void> {
    try {
      const buffer = await this.storyAgent.generateSegmentVoice(
        payload.segment,
      );

      const voiceId = uuid();
      await this.s3.putObject(voiceId, "audio/mpeg", buffer);
      await this.repo.segment().update(payload.segmentId, { voiceId });
    } catch (error: unknown) {
      await this.repo.segment().update(payload.segmentId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StoryError(StoryErrorType.FailedToGenerateSegment, error);
    }
  }
}
