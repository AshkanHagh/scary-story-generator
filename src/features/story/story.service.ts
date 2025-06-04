import { Injectable } from "@nestjs/common";
import { IStoryService } from "./interfaces/service";
import { CreateSegmentDto, CreateStoryDto } from "./dtos";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import {
  ImageJobNames,
  StoryJobNames,
  VideoJobNames,
  WorkerEvents,
} from "src/worker/event";
import { Queue } from "bullmq";
import {
  DownloadSegmentAssetJobData,
  GenerateGuidedStoryJobData,
  GenerateImageContextJobData,
  GenerateImageFrameJobData,
  GenerateSegmentImageJobData,
  GenerateSegmentVideoJobData,
  RegenrateSegmentImageJobData,
} from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ISegment } from "src/drizzle/schema";
import { StoryAgentService } from "../llm-agent/services/story-agent.service";
import * as fs from "fs/promises";
import * as path from "path";
import { generateSRTFile } from "./utils";

@Injectable()
export class StoryService implements IStoryService {
  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
    @InjectQueue(WorkerEvents.Video) private videoQueue: Queue,
    private repo: RepositoryService,
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
    const videoOutputDir = "./tmp/videos";
    const srtOutputDir = "./tmp/srt";
    const srtPath = path.join(srtOutputDir, `segment_${segment.id}.srt`);

    await Promise.all([
      fs.mkdir(outputDir, { recursive: true }),
      fs.mkdir(videoOutputDir, { recursive: true }),
      fs.mkdir(srtOutputDir, { recursive: true }),
    ]);

    const wordTiming = await this.storyAgent.getWordTimestamps(voicePath);
    await generateSRTFile(wordTiming, srtPath);

    let frameIndex = 0;
    const audioDuration =
      wordTiming.length > 0 ? wordTiming[wordTiming.length - 1].end : 0;
    const frameCount = Math.ceil(audioDuration * frameRate);

    for (let i = 0; i < frameCount; i++) {
      const jobData: GenerateImageFrameJobData = {
        frameIndex,
        imagePath,
        outputDir,
      };

      await this.imageQueue.add(ImageJobNames.GENERATE_IMAGE_FRAME, jobData);
      frameIndex++;
    }

    const payload: GenerateSegmentVideoJobData = {
      audioPath: voicePath,
      framePath: outputDir,
      frameRate,
      outputDir: videoOutputDir,
      segmentId: segment.id,
      segmentOrder: segment.order,
      frameIndex,
      srtPath: srtPath,
      imagePath,
    };
    await this.videoQueue.add(VideoJobNames.GENERATE_SEGMENT_VIDEO, payload);
  }
}
