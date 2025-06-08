import { Processor, WorkerHost } from "@nestjs/bullmq";
import { VideoJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import {
  CombineSegmentVideosJobData,
  GenerateSegmentVideoJobData,
} from "../types";
import ffmpeg from "fluent-ffmpeg";
import * as path from "path";
import * as fs from "fs/promises";
import { RepositoryService } from "src/repository/repository.service";
import { StoryProcessingService } from "src/features/story/services/story-processing.service";

@Processor(WorkerEvents.Video, { concurrency: 4 })
export class VideoWorker extends WorkerHost {
  constructor(
    private repo: RepositoryService,
    private service: StoryProcessingService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    try {
      console.log("Processing job:", job.name);

      switch (job.name) {
        case VideoJobNames.GENERATE_SEGMENT_VIDEO as string: {
          const payload = job.data as GenerateSegmentVideoJobData;

          try {
            console.log("Generating segment video...");
            await this.createSegmentVideo(payload);

            const videoStatus = await this.repo
              .videoProcessingStatus()
              .updateCompletedSegment(payload.storyId);

            if (videoStatus.completedSegments === videoStatus.totalSegments) {
              await this.service.combineSegmentVideo(
                payload.storyId,
                payload.outputDir,
              );
            }
          } finally {
            await fs.rm(payload.framePath, { recursive: true, force: true });
            await fs.rm(payload.audioPath, { recursive: true, force: true });
            await fs.rm(payload.srtPath, { recursive: true, force: true });
            await fs.rm(payload.imagePath, { recursive: true, force: true });
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
    await fs.writeFile(fileListPath, fileListContent);

    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(fileListPath)
        .inputOptions(["-f concat", "-safe 0"])
        .outputOptions(["-c copy", "-y"])
        .output(payload.outputPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  }

  // NOTE: Currently, in this architecture we don't need to upload the video to S3 and update the database.
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
