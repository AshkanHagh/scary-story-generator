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
  GenerateImageFrameJobData,
  GenerateSegmentImageJobData,
  RegenrateSegmentImageJobData,
} from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { S3Service } from "./services/s3.service";
import { ISegment } from "src/drizzle/schema";
import { StoryAgentService } from "../llm-agent/services/story-agent.service";
import * as fs from "fs/promises";

@Injectable()
export class StoryService implements IStoryService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
    private repo: RepositoryService,
    private s3: S3Service,
    private storyAgent: StoryAgentService,
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

    await Promise.all([
      this.storyQueue.add(
        StoryJobNames.GENERATE_SEGMENT_IMAGE_REPLICATE,
        jobData,
      ),
      this.storyQueue.add(StoryJobNames.GENERATE_SEGMENT_VOICE, jobData),
    ]);
  }

  async generateSegmentImage(segmentId: string, prompt: string): Promise<void> {
    const segment = await this.repo.segment().find(segmentId);
    if (!segment) {
      throw new StoryError(StoryErrorType.FailedToGenerateStory);
    }

    const story = await this.repo.story().find(segment.storyId);
    if (!story) {
      throw new StoryError(StoryErrorType.FailedToGenerateStory);
    }

    await this.repo.segment().update(segment.id, { isGenerating: true });

    const isVertical = story.isVertical ?? false;

    const jobData: RegenrateSegmentImageJobData = {
      prompt: prompt,
      segmentId: segment.id,
      isVertical,
    };
    await this.imageQueue.add(ImageJobNames.GENERATE_IMAGE, jobData);
  }

  async generateVideo(userId: string, storyId: string): Promise<void> {
    const story = await this.repo.db().query.StoryTable.findFirst({
      where: (table, funcs) => funcs.eq(table.id, storyId),
      with: {
        segments: {},
      },
      columns: {
        id: true,
        userId: true,
      },
    });

    if (!story) {
      throw new StoryError(StoryErrorType.NotFound);
    }
    if (story.userId !== userId) {
      throw new StoryError(StoryErrorType.HasNoPermission);
    }

    await Promise.all([
      story.segments.map(async (segment) => {
        console.log(`Downloading asset for segment ${segment.id}`);
        const jobData: DownloadSegmentAssetJobData = {
          segment,
        };
        await this.imageQueue.add(
          ImageJobNames.DOWNLOAD_AND_GENERATE_SEGMENT_FRAME,
          jobData,
        );
      }),
    ]);
  }

  async generateSegmentVideoFrame(
    segment: ISegment,
    imagePath: string,
    voicePath: string,
  ): Promise<void> {
    const frameRate = 24;
    const outputDir = `./tmp/frames/segment_${segment.id}`;

    await fs.mkdir(outputDir, { recursive: true });

    const wordTiming = await this.storyAgent.getWordTimestamps(voicePath);
    let frameIndex = 0;

    for (const { word, end, start } of wordTiming) {
      const frameDuration = Math.max(end - start, 0.5);
      const frameCount = Math.max(1, Math.ceil(frameDuration * frameRate));

      for (let i = 0; i < frameCount; i++) {
        const jobData: GenerateImageFrameJobData = {
          text: word,
          frameIndex: frameIndex,
          imagePath,
          voicePath,
          outputDir,
        };
        await this.imageQueue.add(ImageJobNames.GENERATE_IMAGE_FRAME, jobData);

        frameIndex++;
      }
    }
  }
}
