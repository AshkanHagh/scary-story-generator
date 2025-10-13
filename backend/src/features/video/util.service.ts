import { InjectQueue } from "@nestjs/bullmq";
import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { Queue } from "bullmq";
import Piscina from "piscina";
import { RepositoryService } from "src/repository/repository.service";
import { VideoJobNames, WorkerEvents } from "src/worker/event";
import { S3Service } from "../story/services/s3.service";
import * as path from "path";
import { cpus } from "os";
import {
  CombineSegmentVideosJobData,
  GenerateImageFrameJobData,
  GenerateSegmentVideoJobData,
  TempFilePaths,
} from "src/worker/types";
import * as fs from "fs/promises";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { ISegment } from "src/drizzle/schema";
import { generateSRTFile } from "src/utils/srt-file";
import { STORY_AGENT_SERVICE } from "../llm-agent/constants";
import { IStoryAgentService } from "../llm-agent/interfaces/service";

@Injectable()
export class VideoUtilService implements OnModuleDestroy {
  private piscina: Piscina;

  constructor(
    @InjectQueue(WorkerEvents.Video) private videoQueue: Queue,
    private repo: RepositoryService,
    @Inject(STORY_AGENT_SERVICE) private storyAgent: IStoryAgentService,
    private s3: S3Service,
  ) {
    const workerPath = path.join(__dirname, "workers");
    const filePath = path.join(workerPath, "frame-worker.js");

    this.piscina = new Piscina({
      filename: filePath,
      maxThreads: cpus().length,
    });
  }

  async onModuleDestroy() {
    await this.piscina.destroy();
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

    await this.videoQueue.add(VideoJobNames.COMBINE_VIDEOS, jobData);
  }
}
