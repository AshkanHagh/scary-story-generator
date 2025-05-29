import { Injectable } from "@nestjs/common";
import { IStoryService } from "./interfaces/service";
import { CreateStoryDto } from "./dtos";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import { WorkerEvents } from "src/worker/event";
import { Queue } from "bullmq";
import { GenerateGuidedStoryJobData } from "src/worker/types";

@Injectable()
export class StoryService implements IStoryService {
  constructor(
    @InjectQueue(WorkerEvents.GENERATE_GUIDED_STORY) private storyQueue: Queue,
    private repo: RepositoryService,
  ) {}

  async createStory(userId: string, payload: CreateStoryDto): Promise<string> {
    const story = await this.repo.story().insert({
      title: payload.title,
      script: payload.script,
      userId,
      status: "processing",
    });

    if (payload.usingAi) {
      const script = `
        Generate a 130-word max video script that is five short paragraphs.
        It should include a catchy hook or intro, a clear main learning point, and actionable advice for the viewer to try.
        The topic of the script should match a title called: ${payload.title}
      `;

      const jobData: GenerateGuidedStoryJobData = {
        script: script,
        storyId: story.id,
        userId,
      };
      await this.storyQueue.add("generate.guided.story", jobData);
    }

    return story.id;
  }
}
