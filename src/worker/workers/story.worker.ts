import { Processor, WorkerHost } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { StoryAgentService } from "src/features/llm-agent/services/story-agent.service";
import { RepositoryService } from "src/repository/repository.service";
import {
  GenerateGuidedStoryJobData,
  GenerateImageContextJobData,
  GenerateSegmentImageJobData,
} from "../types";
import { StoryService } from "src/features/story/story.service";

@Processor(WorkerEvents.Story, { concurrency: 4 })
export class StoryWorker extends WorkerHost {
  constructor(
    private storyAgent: StoryAgentService,
    private repo: RepositoryService,
    private storyService: StoryService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      switch (job.name) {
        case StoryJobNames.GENERATE_GUIDED_STORY as string: {
          console.log("Processing job:", job.name);

          const payload = job.data as GenerateGuidedStoryJobData;
          await this.generateGuidedStory(payload);

          console.log("Job processed successfully:", job.name);
          break;
        }
        case StoryJobNames.GENERATE_IMAGE_CONTEXT as string: {
          console.log("Processing job:", job.name);

          const payload = job.data as GenerateImageContextJobData;
          await this.generateImageContext(payload);

          console.log("Job processed successfully:", job.name);

          break;
        }
        case StoryJobNames.GENERATE_SEGMENT_IMAGE_REPLICATE as string: {
          console.log("Processing job:", job.name);

          const payload = job.data as GenerateSegmentImageJobData;
          await this.generateSegmentImage(payload);

          console.log("Job processed successfully:", job.name);

          break;
        }
      }
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
      await this.storyService.createSegmentWithImage(
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

    await this.storyService.generateSegmentImage(payload.segmentId, prompt);
  }
}
