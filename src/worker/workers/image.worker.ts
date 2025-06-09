import { Processor, WorkerHost } from "@nestjs/bullmq";
import { ImageJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import {
  DownloadSegmentAssetJobData,
  GenerateImageFrameJobData,
  RegenrateSegmentImageJobData,
} from "../types";
import { RepositoryService } from "src/repository/repository.service";
import { ImageAgentService } from "src/features/llm-agent/services/image-agent.service";
import sharp from "sharp";
import { S3Service } from "src/features/story/services/s3.service";
import { v4 as uuid } from "uuid";
import { StoryError, StoryErrorType } from "src/filter/exception";
import * as fs from "fs/promises";
import * as path from "path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import { StoryProcessingService } from "src/features/story/services/story-processing.service";

@Processor(WorkerEvents.Image, { concurrency: 4 })
export class ImageWorker extends WorkerHost {
  constructor(
    private repo: RepositoryService,
    private imageAgent: ImageAgentService,
    private s3: S3Service,
    private service: StoryProcessingService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    console.log("Processing job:", job.name);

    try {
      switch (job.name) {
        case ImageJobNames.GENERATE_IMAGE as string: {
          const payload = job.data as RegenrateSegmentImageJobData;
          await this.generateSegmentImage(payload);

          break;
        }
        case ImageJobNames.DOWNLOAD_AND_GENERATE_SEGMENT_FRAME as string: {
          const payload = job.data as DownloadSegmentAssetJobData;

          const { imagePath, voicePath } = await this.downloadImageAndVoice(
            payload.segment.imageId!,
            payload.segment.voiceId!,
          );

          try {
            await this.service.generateSegmentVideoFrame(
              payload.videoId,
              payload.segment,
              imagePath,
              voicePath,
            );
          } catch (error) {
            await Promise.all([
              fs.rm(imagePath, { recursive: true, force: true }),
              fs.rm(voicePath, { recursive: true, force: true }),
            ]);

            throw error;
          }

          break;
        }
        case ImageJobNames.GENERATE_IMAGE_FRAME as string: {
          const payload = job.data as GenerateImageFrameJobData;
          await this.generateImageFrame(payload);

          break;
        }
      }

      console.log("Job processed successfully:", job.name);
    } catch (error: unknown) {
      console.log("Error processing job:", job.name);
      console.error(error);

      throw new StoryError(StoryErrorType.FailedToGenerateImage, error);
    }
  }

  private async generateSegmentImage(payload: RegenrateSegmentImageJobData) {
    try {
      let output: string;

      if (process.env.NODE_ENV === "production") {
        output = await this.imageAgent.generateImageUsingFlux({
          prompt: payload.prompt,
          num_outputs: 1,
          disable_safety_checker: false,
          aspect_ratio: "16:9",
          output_format: "jpg",
          output_quality: 90,
        });
      } else {
        output =
          "http://localhost:9000/scary-story-generator/thumb-1920-1337024.png";
      }

      const response = await fetch(output);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      const originalImage = await sharp(imageBuffer)
        .webp({ quality: 90 })
        .toBuffer();

      const imageId = uuid();
      await Promise.all([
        this.s3.putObject(imageId, "image/webp", originalImage),
      ]);

      await this.repo.segment().update(payload.segmentId, {
        isGenerating: false,
        prompt: payload.prompt,
        imageId,
      });
    } catch (error: unknown) {
      await this.repo.segment().update(payload.segmentId, {
        isGenerating: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new StoryError(StoryErrorType.FailedToGenerateSegment, error);
    }
  }

  private async downloadImageAndVoice(
    imageId: string,
    voiceId: string,
  ): Promise<{
    imagePath: string;
    voicePath: string;
  }> {
    const [imageBuffer, voiceBuffer] = await Promise.all([
      this.s3.getObject(imageId),
      this.s3.getObject(voiceId),
    ]);

    await fs.mkdir(`./tmp/assets`, { recursive: true });

    const imagePath = `./tmp/assets/${imageId}.jpeg`;
    const voicePath = `./tmp/assets/${voiceId}.mp3`;
    await Promise.all([
      fs.writeFile(imagePath, imageBuffer),
      fs.writeFile(voicePath, voiceBuffer),
    ]);

    return {
      imagePath,
      voicePath,
    };
  }

  async generateImageFrame(payload: GenerateImageFrameJobData) {
    const canvasWidth = 1920;
    const canvasHeight = 1080;
    const zoomStep = 0.0003;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    const image = await loadImage(payload.imagePath);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const zoom = 1 + zoomStep * payload.frameIndex;
    const imgAspect = image.width / image.height;
    const canvasAspect = canvasWidth / canvasHeight;
    let drawWidth: number, drawHeight: number;

    if (imgAspect > canvasAspect) {
      drawWidth = canvasWidth * zoom;
      drawHeight = drawWidth / imgAspect;
    } else {
      drawHeight = canvasHeight * zoom;
      drawWidth = drawHeight * imgAspect;
    }

    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    const framePath = path.join(
      payload.outputDir,
      `frame_${String(payload.frameIndex).padStart(4, "0")}.jpeg`,
    );

    const buffer = await canvas.encode("jpeg", 80);
    await fs.writeFile(framePath, buffer);
  }
}
