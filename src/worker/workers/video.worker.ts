import { Processor, WorkerHost } from "@nestjs/bullmq";
import { VideoJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { GenerateSegmentVideoJobData } from "../types";
import * as ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs/promises";
import { StoryError, StoryErrorType } from "src/filter/exception";

@Processor(WorkerEvents.Video, { concurrency: 4 })
export class VideoWorker extends WorkerHost {
  constructor() {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      console.log("Processing job:", job.name);

      switch (job.name) {
        case VideoJobNames.GENERATE_SEGMENT_VIDEO as string: {
          const payload = job.data as GenerateSegmentVideoJobData;

          try {
            await this.waitForFrames(payload.framePath, payload.frameIndex);
            await this.createSegmentVideo(payload);
          } finally {
            await fs.rm(payload.framePath, { recursive: true, force: true });
            await fs.rm(payload.audioPath, { recursive: true, force: true });
            await fs.rm(payload.srtPath, { recursive: true, force: true });
            await fs.rm(payload.imagePath, { recursive: true, force: true });
          }

          break;
        }
      }

      console.log("Job processed successfully:", job.name);
    } catch (error: unknown) {
      console.log("Error processing job:", job.name);
      console.log(error);
    }
  }

  private async waitForFrames(frameDir: string, frameIndex: number) {
    const startTime = Date.now();
    const timeout = 5 * 60 * 1000;

    while (true) {
      const files = await fs.readdir(frameDir);
      if (files.length === frameIndex) {
        break;
      }
      if (Date.now() - startTime > timeout) {
        throw new StoryError(StoryErrorType.Timeout);
      }

      console.log(`Waiting for frames: ${files.length}/${frameIndex}`);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  private async createSegmentVideo(payload: GenerateSegmentVideoJobData) {
    const outputPath = path.join(
      payload.outputDir,
      `video_${payload.segmentId}_${String(payload.segmentOrder).padStart(2, "0")}.mp4`,
    );

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(path.join(payload.framePath, "frame_%04d.jpeg"))
        .inputOptions([`-framerate ${payload.frameRate}`])
        .input(payload.audioPath)
        .outputOption([
          "-c:v libx264",
          "-pix_fmt yuv420p",
          "-c:a aac",
          "-shortest",
          `-vf subtitles='${payload.srtPath}:force_style=FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1,Shadow=2,Alignment=2,MarginV=20',scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`,
          "-vsync 2",
          "-y",
        ])
        .output(outputPath, { end: true })
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  }

  // NOTE: Currently, in this articheter we dont need to upload the video to S3 and update the database.
  // Uncomment the following lines to upload the video to S3 and update the database

  // private async createSegmentVideo(payload: GenerateSegmentVideoJobData) {
  //   const passThrough = new PassThrough();
  //   const outputPath = path.join(
  //     payload.outputDir,
  //     `video_${payload.segmentId}_${String(payload.segmentOrder).padStart(2, "0")}.mp4`,
  //   );
  //   const chunks: Buffer[] = [];

  //   passThrough.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  //   const videoBuffer: Promise<Buffer> = new Promise((resolve, reject) => {
  //     ffmpeg()
  //       .input(path.join(payload.framePath, "frame_%04d.jpeg"))
  //       // .inputFPS(payload.frameRate)
  //       .inputOptions([`-framerate ${payload.frameRate}`])
  //       .input(payload.audioPath)
  //       .outputOption([
  //         "-c:v libx264",
  //         "-pix_fmt yuv420p",
  //         "-c:a aac",
  //         "-shortest",
  //         `-vf subtitles='${payload.srtPath}:force_style=FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1,Shadow=2,Alignment=2,MarginV=20',scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`,
  //         "-vsync 2",
  //         "-y",
  //       ])
  //       .output(outputPath, { end: true })
  //       .on("end", () => {
  //         const buffer = Buffer.concat(chunks);
  //         resolve(buffer);
  //       })
  //       .on("error", reject)
  //       .run();
  //   });

  // const videoId = uuid();
  // await this.s3.putObject(videoId, "video/mp4", await videoBuffer);
  // await this.repo.segment().update(payload.segmentId, {
  //   videoId,
  // });
  // }
}
