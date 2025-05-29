import { Processor, WorkerHost } from "@nestjs/bullmq";
import { WorkerEvents } from "../event";
import { Job } from "bullmq";
import { StoryAgentService } from "src/features/llm-agent/services/story-agent.service";
import { RepositoryService } from "src/repository/repository.service";
import { GenerateGuidedStoryJobData } from "../types";

@Processor(WorkerEvents.GENERATE_GUIDED_STORY, { concurrency: 4 })
export class StoryWorker extends WorkerHost {
  constructor(
    private storyAgent: StoryAgentService,
    private repo: RepositoryService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      console.log("Processing job:", job.name);
      const payload = job.data as GenerateGuidedStoryJobData;

      const script = await this.storyAgent.generateGuidedStory(payload.script);

      await this.repo.story().update(payload.storyId, {
        script,
        userId: payload.userId,
      });

      console.log("Job processed successfully:", job.name);
    } catch (error: unknown) {
      console.log("Error processing job:", job.name);
      console.log(error);
    }
  }
}
