import { Processor, WorkerHost } from "@nestjs/bullmq";
import { WorkerEvents } from "../event";
import { Job } from "bullmq";
import { RegenrateSegmentImageJobData } from "../types";
import { RepositoryService } from "src/repository/repository.service";
import { ImageAgentService } from "src/features/llm-agent/services/image-agent.service";
import { AiConfig, IAiConfig } from "src/configs/ai.config";
import * as sharp from "sharp";
import { S3Service } from "src/features/story/services/s3.service";
import { v4 as uuid } from "uuid";

@Processor(WorkerEvents.Image, { concurrency: 20 })
export class ImageWorker extends WorkerHost {
  constructor(
    @AiConfig() private config: IAiConfig,
    private repo: RepositoryService,
    private imageAgent: ImageAgentService,
    private s3Service: S3Service,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    console.log("Processing job:", job.name);

    const payload = job.data as RegenrateSegmentImageJobData;

    const isVertical = payload.isVertical;
    const width = isVertical ? 1080 : 1920;
    const height = isVertical ? 1920 : 1080;
    const SCALE_WIDTH = 540;
    const SCALE_HEIGHT = 960;

    try {
      let output: string;

      if (this.config.replicate.model === "flux") {
        output = await this.imageAgent.generateImageUsingFlux({
          prompt: payload.prompt,
          num_outputs: 1,
          disable_safety_checker: false,
          aspect_ratio: isVertical ? "9:16" : "16:9",
          output_format: "jpg",
          output_quality: 90,
        });
      } else {
        // TODO: use another replicate model
        output =
          "http://localhost:9000/scary-story-generator/thumb-1920-1337024.png";
      }

      const response = await fetch(output);
      const imageBuffer = Buffer.from(await response.arrayBuffer());

      const originalImage = await sharp(imageBuffer)
        .webp({ quality: 90 })
        .toBuffer();

      const previewImage = await sharp(imageBuffer)
        .resize({
          width: isVertical ? SCALE_WIDTH : SCALE_HEIGHT,
          height: isVertical ? SCALE_HEIGHT : SCALE_WIDTH,
          fit: "inside",
        })
        .jpeg({ quality: 90 })
        .toBuffer();

      const [originalImageUrl, previewImageUrl] = await Promise.all([
        this.s3Service.putObject(uuid(), "image/webp", originalImage),
        this.s3Service.putObject(uuid(), "image/webp", previewImage),
      ]);

      await this.repo.segment().update(payload.segmentId, {
        isGenerating: false,
        prompt: payload.prompt,
        imageUrl: originalImageUrl,
        previewImageUrl: previewImageUrl,
      });

      console.log("Job processed successfully:", job.name);
    } catch (error: unknown) {
      await this.repo.segment().update(payload.segmentId, {
        isGenerating: false,
      });

      console.log("Error processing job:", job.name);
      console.log(error);
    }
  }
}
