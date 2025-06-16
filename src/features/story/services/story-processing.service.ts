import { Injectable, OnModuleDestroy } from "@nestjs/common";
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
  CombineSegmentVideosJobData,
  GenerateImageFrameJobData,
  GenerateSegmentImageJobData,
  GenerateSegmentVideoJobData,
  GenerateSegmentVoiceJobData,
  RegenrateSegmentImageJobData,
  TempFilePaths,
} from "src/worker/types";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ISegment } from "src/drizzle/schema";
import { StoryAgentService } from "../../llm-agent/services/story-agent.service";
import * as fs from "fs/promises";
import * as path from "path";
import { generateSRTFile } from "../utils";
import { IStoryProcessingService } from "../interfaces/service";
import { S3Service } from "./s3.service";
import Piscina from "piscina";
import { cpus } from "os";

@Injectable()
export class StoryProcessingService
  implements IStoryProcessingService, OnModuleDestroy
{
  private piscina: Piscina;

  constructor(
    @InjectQueue(WorkerEvents.Story) private storyQueue: Queue,
    @InjectQueue(WorkerEvents.Image) private imageQueue: Queue,
    @InjectQueue(WorkerEvents.Video) private videoQueue: Queue,
    private repo: RepositoryService,
    private storyAgent: StoryAgentService,
    private s3: S3Service,
  ) {
    this.piscina = new Piscina({
      filename: path.join(__dirname, "frame-worker.js"),
      maxThreads: cpus().length,
      minThreads: 1,
    });
  }

  async onModuleDestroy() {
    await this.piscina.destroy();
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
      status: "pending",
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
    };
    await this.imageQueue.add(ImageJobNames.GENERATE_IMAGE, jobData);
  }

  async generateSegmentVideoFrame(
    videoId: string,
    segment: ISegment,
    imagePath: string,
    voicePath: string,
  ): Promise<void> {
    const frameRate = 24;
    const outputDir = `./tmp/frames/segment_${segment.id}`;
    const srtOutputDir = "./tmp/srt";
    const srtPath = path.join(srtOutputDir, `segment_${segment.id}.srt`);

    await Promise.all([
      fs.mkdir(outputDir, { recursive: true }),
      fs.mkdir(srtOutputDir, { recursive: true }),
    ]);

    const wordTiming = await this.storyAgent.getWordTimestamps(voicePath);
    await generateSRTFile(wordTiming, srtPath);

    const audioDuration = wordTiming[wordTiming.length - 1].end;
    const extraPaddingSeconds = 2;
    const frameCount = Math.ceil(
      (audioDuration + extraPaddingSeconds) * frameRate,
    );

    const framePromises = [];
    for (let i = 0; i < frameCount; i++) {
      const jobData: GenerateImageFrameJobData = {
        frameIndex: i,
        imagePath,
        outputDir,
      };

      // @ts-expect-error any value
      framePromises.push(this.piscina.run(jobData));
    }

    const results = await Promise.allSettled(framePromises);
    const errors = results.filter((result) => result.status === "rejected");

    // TODO: write errors in file
    if (errors.length > 0) {
      const error = new Error(
        `generate segment ${segment.id} failed: ${errors[0].reason}`,
      );
      throw new StoryError(StoryErrorType.FailedToGenerateVideo, error);
    }

    const jobData: GenerateSegmentVideoJobData = {
      tempPaths: {
        srtPath: srtPath,
        imagePath,
        framePath: outputDir,
        audioPath: voicePath,
      },
      frameRate,
      segmentId: segment.id,
      segmentOrder: segment.order,
      storyId: segment.storyId,
      videoId,
    };
    await this.videoQueue.add(VideoJobNames.GENERATE_SEGMENT_VIDEO, jobData);
  }

  async combineSegmentVideo(
    videoId: string,
    storyId: string,
    tempPaths: TempFilePaths,
  ): Promise<void> {
    const videosPath = `./tmp/videos/${storyId}`;
    const outputDir = "./tmp/finalized";
    const outputPath = path.join(outputDir, `finished_${storyId}.mp4`);

    await Promise.all([
      fs.mkdir(videosPath, { recursive: true }),
      fs.mkdir(outputDir, { recursive: true }),
    ]);

    const videoSegments = await this.repo.story().findWithSegments(storyId);

    // download and add segment video to tmp disk
    await Promise.all(
      videoSegments!.segments.map(async (segment) => {
        const segmentVideo = await this.s3.getObject(segment.videoId!);

        const videoOrder = String(segment.order).padStart(2, "0");
        const outputPath = path.join(
          videosPath,
          `segment_video_${segment.id}_${videoOrder}.mp4`,
        );
        await fs.writeFile(outputPath, segmentVideo);
      }),
    );

    const jobData: CombineSegmentVideosJobData = {
      videoId,
      outputPath,
      videosPath,
      tempPaths,
    };

    await this.videoQueue.add(VideoJobNames.COMBINE_SEGMENT_VIDEOS, jobData);
  }
}
