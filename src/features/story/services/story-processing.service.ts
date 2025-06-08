import { Injectable } from "@nestjs/common";
import { RepositoryService } from "src/repository/repository.service";
import { InjectQueue } from "@nestjs/bullmq";
import {
  ImageJobNames,
  StoryJobNames,
  VideoJobNames,
  WorkerEvents,
} from "src/worker/event";
import { FlowJob, FlowProducer, Queue } from "bullmq";
import {
  CombineSegmentVideosJobData,
  GenerateImageFrameJobData,
  GenerateSegmentImageJobData,
  GenerateSegmentVideoJobData,
  GenerateSegmentVoiceJobData,
  RegenrateSegmentImageJobData,
} from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ISegment } from "src/drizzle/schema";
import { StoryAgentService } from "../../llm-agent/services/story-agent.service";
import * as fs from "fs/promises";
import * as path from "path";
import { generateSRTFile } from "../utils";
import { IStoryProcessingService } from "../interfaces/service";

@Injectable()
export class StoryProcessingService implements IStoryProcessingService {
  private flowProducer: FlowProducer;

  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
    @InjectQueue(WorkerEvents.Video) private videoQueue: Queue,
    private repo: RepositoryService,
    private storyAgent: StoryAgentService,
  ) {
    this.flowProducer = new FlowProducer({
      connection: this.imageQueue.opts.connection,
    });
  }

  async createSegmentWithImage(
    // Userid for consuming token from user tokens
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

    await Promise.all([
      this.storyQueue.add(StoryJobNames.GENERATE_SEGMENT_IMAGE_REPLICATE, {
        storyId,
        segmentId: segment.id,
        context,
        segment: text,
      } as GenerateSegmentImageJobData),

      this.storyQueue.add(StoryJobNames.GENERATE_SEGMENT_VOICE, {
        segment: text,
        segmentId: segment.id,
      } as GenerateSegmentVoiceJobData),
    ]);
  }

  async generateSegmentImage(
    storyId: string,
    segmentId: string,
    segment: string,
  ): Promise<void> {
    const story = await this.repo.story().find(storyId);
    // NOTE: always exists
    if (!story) {
      throw new StoryError(StoryErrorType.FailedToGenerateStory);
    }

    const jobData: RegenrateSegmentImageJobData = {
      prompt: segment,
      segmentId: segmentId,
      isVertical: story.isVertical,
    };
    await this.imageQueue.add(ImageJobNames.GENERATE_IMAGE, jobData);
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
    const extraPaddingSeconds = 2;
    const frameCount = Math.ceil(
      (audioDuration + extraPaddingSeconds) * frameRate,
    );

    const frameJobs: FlowJob[] = [];
    for (let i = 0; i < frameCount; i++) {
      const jobData: GenerateImageFrameJobData = {
        frameIndex,
        imagePath,
        outputDir,
      };

      frameJobs.push({
        name: ImageJobNames.GENERATE_IMAGE_FRAME,
        data: jobData,
        queueName: WorkerEvents.Image,
      });

      frameIndex++;
    }

    const jobData: GenerateSegmentVideoJobData = {
      audioPath: voicePath,
      framePath: outputDir,
      frameRate,
      outputDir: videoOutputDir,
      segmentId: segment.id,
      segmentOrder: segment.order,
      frameIndex,
      srtPath: srtPath,
      imagePath,
      storyId: segment.storyId,
    };
    const segmentVideoJob: FlowJob = {
      name: VideoJobNames.GENERATE_SEGMENT_VIDEO,
      data: jobData,
      queueName: WorkerEvents.Video,
      children: frameJobs,
    };

    await this.flowProducer.add({
      name: VideoJobNames.START_WORKFLOW,
      queueName: WorkerEvents.Video,
      children: [segmentVideoJob],
    });
  }

  async combineSegmentVideo(
    storyId: string,
    videosPath: string,
  ): Promise<void> {
    const outputDir = "./tmp/completed_videos";
    const outputPath = path.join(outputDir, `finished_${storyId}.mp4`);

    await fs.mkdir(outputDir, { recursive: true });

    const jobData: CombineSegmentVideosJobData = {
      outputPath,
      videosPath,
    };

    await this.videoQueue.add(VideoJobNames.COMBINE_SEGMENT_VIDEOS, jobData);
  }
}
