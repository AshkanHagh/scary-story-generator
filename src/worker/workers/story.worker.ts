import { Processor, WorkerHost } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { StoryAgentService } from "src/features/llm-agent/services/story-agent.service";
import { RepositoryService } from "src/repository/repository.service";
import {
  GenerateGuidedStoryJobData,
  GenerateImageContextJobData,
  GenerateSegmentImageJobData,
  GenerateSegmentVoiceJobData,
} from "../types";
import { S3Service } from "src/features/story/services/s3.service";
import { v4 as uuid } from "uuid";
import { StoryProcessingService } from "src/features/story/services/story-processing.service";

@Processor(WorkerEvents.Story, { concurrency: 4 })
export class StoryWorker extends WorkerHost {
  constructor(
    private storyAgent: StoryAgentService,
    private repo: RepositoryService,
    private service: StoryProcessingService,
    private s3: S3Service,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      console.log("Processing job:", job.name);

      switch (job.name) {
        case StoryJobNames.GENERATE_GUIDED_STORY as string: {
          const payload = job.data as GenerateGuidedStoryJobData;
          await this.generateGuidedStory(payload);

          break;
        }
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
      console.log(error);
    }
  }

  private async generateGuidedStory(
    payload: GenerateGuidedStoryJobData,
  ): Promise<void> {
    const script = await this.storyAgent.generateGuidedStory(payload.script);

    await this.repo.story().update(payload.storyId, {
      script,
      userId: payload.userId,
    });
  }

  private async generateImageContext(
    payload: GenerateImageContextJobData,
  ): Promise<void> {
    const context = await this.storyAgent.generateStoryContext(payload.script);

    await this.repo.story().update(payload.storyId, { context });

    const segments = payload.script.split(/\n{2,}/);
    for (let i = 0; i < segments.length; i++) {
      await this.service.createSegmentWithImage(
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

    await this.service.generateSegmentImage(payload.segmentId, prompt);
  }

  private async generateSegmentVoice(
    payload: GenerateSegmentVoiceJobData,
  ): Promise<void> {
    const buffer = await this.storyAgent.generateSegmentVoice(payload.segment);

    const voiceId = uuid();
    await this.s3.putObject(voiceId, "audio/mpeg", buffer);
    await this.repo.segment().update(payload.segmentId, { voiceId });
  }
}
