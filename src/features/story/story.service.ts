import { Injectable } from "@nestjs/common";
import { IStoryService } from "./interfaces/service";
import { CreateSegmentDto, CreateStoryDto } from "./dtos";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import { StoryJobNames, WorkerEvents } from "src/worker/event";
import { Queue } from "bullmq";
import {
  GenerateGuidedStoryJobData,
  GenerateImageContextJobData,
  GenerateSegmentImageJobData,
} from "src/worker/types";

@Injectable()
export class StoryService implements IStoryService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
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
      await this.storyQueue.add(StoryJobNames.GENERATE_GUIDED_STORY, jobData);
    }

    return story.id;
  }

  async generateSegment(
    userId: string,
    storyId: string,
    payload: CreateSegmentDto,
  ): Promise<void> {
    const story = await this.repo.story().userHasAccess(storyId, userId);
    await this.repo.story().update(storyId, { isVertical: payload.isVertical });

    const jobData: GenerateImageContextJobData = {
      script: story.script,
      storyId,
      userId,
    };
    await this.storyQueue.add(StoryJobNames.GENERATE_IMAGE_CONTEXT, jobData);
  }

  async createSegmentWithImage(
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
      isGenerating: true,
    });

    const jobData: GenerateSegmentImageJobData = {
      segmentId: segment.id,
      context,
      segment: text,
    };
    await this.storyQueue.add(
      StoryJobNames.GENERATE_SEGMENT_IMAGE_REPLICATE,
      jobData,
    );
  }
}
