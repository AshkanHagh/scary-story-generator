import { Processor, WorkerHost } from "@nestjs/bullmq";
import { ImageJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { DownloadSegmentAssetJobData } from "../types";
import { RepositoryService } from "src/repository/repository.service";
import { ImageAgentService } from "src/features/llm-agent/services/image-agent.service";
import { S3Service } from "src/features/story/services/s3.service";
import { StoryError, StoryErrorType } from "src/filter/exception";
import * as fs from "fs/promises";
import { VideoUtilService } from "src/features/video/util.service";

@Processor(WorkerEvents.Image, { concurrency: 4 })
export class ImageWorker extends WorkerHost {
  constructor(
    private repo: RepositoryService,
    private imageAgent: ImageAgentService,
    private s3: S3Service,
    private videoUtilService: VideoUtilService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    console.log("Processing job:", job.name);

    try {
      switch (job.name) {
        case ImageJobNames.DOWNLOAD_SEGMENT_ASSETS as string: {
          const payload = job.data as DownloadSegmentAssetJobData;

          const { imagePath, voicePath } = await this.downloadImageAndVoice(
            payload.segment.imageId!,
            payload.segment.voiceId!,
          );

          try {
            await this.videoUtilService.generateSegmentVideoFrame(
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
      }

      console.log("Job processed successfully:", job.name);
    } catch (error: unknown) {
      console.log("Error processing job:", job.name);
      console.error(error);

      throw new StoryError(StoryErrorType.FailedToGenerateImage, error);
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
}
