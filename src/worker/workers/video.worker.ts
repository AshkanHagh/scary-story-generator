import { Processor, WorkerHost } from "@nestjs/bullmq";
import { VideoJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import {
  CombineSegmentVideosJobData,
  GenerateSegmentVideoJobData,
  TempFilePaths,
} from "../types";
import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs/promises";
import * as fsStream from "fs";
import { RepositoryService } from "src/repository/repository.service";
import { StoryProcessingService } from "src/features/story/services/story-processing.service";
import { v4 as uuid } from "uuid";
import { S3Service } from "src/features/story/services/s3.service";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Processor(WorkerEvents.Video, { concurrency: 4 })
export class VideoWorker extends WorkerHost {
  constructor(
    private repo: RepositoryService,
    private service: StoryProcessingService,
    private s3: S3Service,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      console.log("Processing job:", job.name);

      switch (job.name) {
        case VideoJobNames.GENERATE_SEGMENT_VIDEO as string: {
          const payload = job.data as GenerateSegmentVideoJobData;

          console.log("Generating segment video...");
          await this.createSegmentVideo(payload);

          const videoStatus = await this.repo
            .videoProcessingStatus()
            .updateCompletedSegment(payload.storyId);

          if (videoStatus.completedSegments === videoStatus.totalSegments) {
            const tempPaths: TempFilePaths = {
              audioPath: payload.tempPaths.audioPath,
              framePath: payload.tempPaths.framePath,
              srtPath: payload.tempPaths.srtPath,
              imagePath: payload.tempPaths.imagePath,
            };

            await this.service.combineSegmentVideo(
              payload.videoId,
              payload.storyId,
              tempPaths,
            );
          }

          break;
        }
        case VideoJobNames.COMBINE_SEGMENT_VIDEOS as string: {
          const payload = job.data as CombineSegmentVideosJobData;
          await this.combineSegmentVideos(payload);

          break;
        }
      }

      console.log("Job processed successfully:", job.name);
    } catch (error: unknown) {
      console.log("Error processing job:", job.name);
      console.log(error);

      throw new StoryError(StoryErrorType.FailedToGenerateVideo, error);
    }
  }

  private async createSegmentVideo(payload: GenerateSegmentVideoJobData) {
    const videoOutputDir = `./tmp/tmp_videos/${payload.storyId}`;
    await fs.mkdir(videoOutputDir, { recursive: true });

    const videoOrder = String(payload.segmentOrder).padStart(2, "0");
    const outputPath = path.join(
      videoOutputDir,
      `video_${payload.segmentId}_${videoOrder}.mp4`,
    );

    try {
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(path.join(payload.tempPaths.framePath, "frame_%04d.jpeg"))
          .inputOptions([`-framerate ${payload.frameRate}`])
          .input(payload.tempPaths.audioPath)
          .outputOption([
            "-c:v libx264",
            "-pix_fmt yuv420p",
            "-c:a aac",
            "-shortest",
            `-vf subtitles='${payload.tempPaths.srtPath}:force_style=FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1,Shadow=2,Alignment=2,MarginV=20',scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`,
            "-vsync 2",
            "-y",
          ])
          .output(outputPath, { end: true })
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      const fileStream = fsStream.createReadStream(outputPath);

      const videoId = uuid();
      await this.s3.putObject(videoId, "video/mp4", fileStream, true);
      await this.repo.segment().update(payload.segmentId, {
        videoId,
      });
    } catch (error: unknown) {
      await this.repo.segment().update(payload.segmentId, {
        isGenerating: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      await Promise.all([
        fs.rm(outputPath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.framePath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.srtPath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.audioPath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.imagePath, { recursive: true, force: true }),
      ]);
    }
  }

  private async combineSegmentVideos(payload: CombineSegmentVideosJobData) {
    const files = await fs.readdir(payload.videosPath);
    const videoFiles = files.sort((a, b) => {
      const orderA = parseInt(a.match(/(\d{2})\.mp4$/)?.[1] || "0", 10);
      const orderB = parseInt(b.match(/(\d{2})\.mp4$/)?.[1] || "0", 10);

      return orderA - orderB;
    });

    const fileListPath = path.resolve(payload.videosPath, "file_list.txt");
    const fileListContent = videoFiles
      .map((file) => `file '${path.resolve(payload.videosPath, file)}'`)
      .join("\n");

    try {
      await fs.writeFile(fileListPath, fileListContent);

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(fileListPath)
          .inputOptions(["-f concat", "-safe 0"])
          .outputOptions(["-c copy", "-y"])
          .output(payload.outputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      const fileStream = fsStream.createReadStream(payload.outputPath);

      const videoUrl = await this.s3.putObject(
        payload.videoId,
        "video/mp4",
        fileStream,
        true,
      );
      await this.repo.video().update(payload.videoId, {
        status: "completed",
        url: videoUrl,
      });
    } catch (error: unknown) {
      await this.repo.video().update(payload.videoId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      throw new StoryError(StoryErrorType.FailedToGenerateSegment, error);
    } finally {
      await Promise.all([
        fs.rm(payload.outputPath, { recursive: true, force: true }),
        fs.rm(payload.videosPath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.framePath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.srtPath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.audioPath, { recursive: true, force: true }),
        fs.rm(payload.tempPaths.imagePath, { recursive: true, force: true }),
      ]);
    }
  }
}
