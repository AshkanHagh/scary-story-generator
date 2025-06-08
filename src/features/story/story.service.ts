import { Injectable } from "@nestjs/common";
import { IStoryService } from "./interfaces/service";
import { CreateSegmentDto, CreateStoryDto } from "./dtos";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import { ImageJobNames, StoryJobNames, WorkerEvents } from "src/worker/event";
import { Queue } from "bullmq";
import {
  DownloadSegmentAssetJobData,
  GenerateGuidedStoryJobData,
  GenerateImageContextJobData,
} from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Injectable()
export class StoryService implements IStoryService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
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
    // Throws error if story does not exist
    const story = await this.repo.story().userHasAccess(storyId, userId);
    if (story.status !== "completed") {
      throw new StoryError(StoryErrorType.NotCompleted);
    }

    await this.repo.story().update(storyId, { isVertical: payload.isVertical });

    const jobData: GenerateImageContextJobData = {
      script: story.script,
      storyId,
      userId,
    };
    await this.storyQueue.add(StoryJobNames.GENERATE_IMAGE_CONTEXT, jobData);
  }

  async generateVideo(userId: string, storyId: string): Promise<void> {
    const story = await this.repo.story().findWithSegments(storyId);

    if (!story) {
      throw new StoryError(StoryErrorType.NotFound);
    }
    if (story.userId !== userId) {
      throw new StoryError(StoryErrorType.HasNoPermission);
    }

    await this.repo.videoProcessingStatus().insert({
      storyId: story.id,
      totalSegments: story.segments.length,
      completedSegments: 0,
    });

    await Promise.all([
      story.segments.map((segment) => {
        const jobData: DownloadSegmentAssetJobData = {
          segment,
        };
        return this.imageQueue.add(
          ImageJobNames.DOWNLOAD_AND_GENERATE_SEGMENT_FRAME,
          jobData,
        );
      }),
    ]);
  }
}
