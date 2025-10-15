import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import Piscina from "piscina";
import { RepositoryService } from "src/repository/repository.service";
import { S3Service } from "../../story/services/s3.service";
import * as path from "path";
import { cpus } from "os";
import { GenerateFrameWorker } from "src/worker/types";
import * as fs from "fs/promises";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { generateSRTFile } from "src/utils/srt-file";
import { STORY_AGENT_SERVICE } from "../../llm-agent/constants";
import { IStoryAgentService } from "../../llm-agent/interfaces/service";
import { VIDEO_FRAME_RATE } from "../constants";
import { TmpDirService } from "./tmp-dir.service";
import ffmpeg from "fluent-ffmpeg";
import * as fsStream from "fs";

@Injectable()
export class VideoUtilService implements OnModuleDestroy {
  private piscina: Piscina;

  constructor(
    @Inject(STORY_AGENT_SERVICE) private storyAgent: IStoryAgentService,
    private repo: RepositoryService,
    private s3: S3Service,
  ) {
    const workerPath = path.join(__dirname, "..", "workers");
    const filePath = path.join(workerPath, "frame-worker.js");

    this.piscina = new Piscina({
      filename: filePath,
      maxThreads: cpus().length,
    });
  }

  async generateSegmentFrames(
    segmentId: string,
    imagePath: string,
    audioPath: string,
    srtPath: string,
    frameDir: string,
    tmpDirService: TmpDirService,
  ) {
    try {
      const wordTiming = await this.storyAgent.getWordTimestamps(audioPath);
      await generateSRTFile(wordTiming, srtPath);

      const audioDuration = wordTiming[wordTiming.length - 1].end;
      const extraPaddingSeconds = 2;
      const frameCount = Math.ceil(
        (audioDuration + extraPaddingSeconds) * VIDEO_FRAME_RATE,
      );

      const framePromises = [];
      for (let i = 0; i < frameCount; i++) {
        const jobData: GenerateFrameWorker = {
          frameIndex: i,
          imagePath,
          outputDir: frameDir,
        };

        // @ts-expect-error any value
        framePromises.push(this.piscina.run(jobData));
      }

      const results = await Promise.allSettled(framePromises);
      const errors = results.filter((result) => result.status === "rejected");
      // TODO: write errors in file
      if (errors.length > 0) {
        throw new Error(
          `generate segment ${segmentId} failed: ${errors[0].reason}`,
        );
      }
    } catch (error) {
      await tmpDirService.cleanup();
      throw new StoryError(StoryErrorType.VideoGenerationFailed, error);
    }
  }

  // downloads image/audio and write them into tmp dir on disk
  async downloadAssets(
    imageId: string,
    voiceId: string,
    imagePath: string,
    audioPath: string,
    tmpDirService: TmpDirService,
  ) {
    try {
      const [imageBuf, voiceBuf] = await Promise.all([
        this.s3.getObject(imageId),
        this.s3.getObject(voiceId),
      ]);

      await Promise.all([
        fs.writeFile(imagePath, imageBuf),
        fs.writeFile(audioPath, voiceBuf),
      ]);
    } catch (error) {
      console.log(error);
      await tmpDirService.cleanup();
      throw new StoryError(StoryErrorType.AssetsDownloadFailed, error);
    }
  }

  async createSegmentVideo(
    videoPath: string,
    srtPath: string,
    audioPath: string,
    segmentId: string,
    frameDir: string,
    tmpDirService: TmpDirService,
  ) {
    try {
      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(path.join(frameDir, "frame_%04d.jpeg"))
          .inputOptions([`-framerate ${VIDEO_FRAME_RATE}`])
          .input(audioPath)
          .outputOption([
            "-c:v libx264",
            "-pix_fmt yuv420p",
            "-c:a aac",
            "-shortest",
            `-vf subtitles='${srtPath}:force_style=FontName=Arial,FontSize=24,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,BorderStyle=1,Outline=1,Shadow=2,Alignment=2,MarginV=20',scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2`,
            "-vsync 2",
            "-y",
          ])
          .output(videoPath, { end: true })
          .on("end", resolve)
          .on("error", reject)
          .run();
      });
    } catch (error: unknown) {
      await tmpDirService.cleanup();
      await this.repo.segment().update(segmentId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });

      throw new StoryError(StoryErrorType.VideoGenerationFailed, error);
    }
  }

  async combineSegmentVideos(
    videoId: string,
    videoDir: string,
    videoOutputPath: string,
    tmpDirService: TmpDirService,
  ) {
    try {
      const files = await fs.readdir(videoDir);
      const videoFiles = files.sort((a, b) => {
        const orderA = parseInt(a.match(/(\d{2})\.mp4$/)?.[1] || "0", 10);
        const orderB = parseInt(b.match(/(\d{2})\.mp4$/)?.[1] || "0", 10);

        return orderA - orderB;
      });

      const fileListPath = path.resolve(videoDir, "file_list.txt");
      const fileListContent = videoFiles
        .map((file) => `file '${path.resolve(videoDir, file)}'`)
        .join("\n");

      await fs.writeFile(fileListPath, fileListContent);

      await new Promise((resolve, reject) => {
        ffmpeg()
          .input(fileListPath)
          .inputOptions(["-f concat", "-safe 0"])
          .outputOptions(["-c copy", "-y"])
          .output(videoOutputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      const fileStream = fsStream.createReadStream(videoOutputPath);
      const videoUrl = await this.s3.putObject(
        videoId,
        "video/mp4",
        fileStream,
        true,
      );
      await this.repo.video().update(videoId, {
        status: "completed",
        url: videoUrl,
      });
    } catch (error) {
      await this.repo.video().update(videoId, {
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      await tmpDirService.cleanup();

      throw new StoryError(StoryErrorType.VideoGenerationFailed, error);
    } finally {
      await tmpDirService.cleanup();
    }
  }

  async onModuleDestroy() {
    await this.piscina.destroy();
  }
}
