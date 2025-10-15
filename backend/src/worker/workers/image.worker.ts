import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { ImageJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import { DownloadAsset } from "../types";
import { VideoUtilService } from "src/features/video/util-services/util.service";
import { Logger } from "@nestjs/common";
import { TmpDirService } from "src/features/video/util-services/tmp-dir.service";

@Processor(WorkerEvents.Image, { concurrency: 4 })
export class ImageWorker extends WorkerHost {
  private logger = new Logger(ImageWorker.name);

  constructor(private videoUtilService: VideoUtilService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case ImageJobNames.DOWNLOAD_ASSETS as string: {
        const payload = job.data as DownloadAsset;
        const tmpDirService = new TmpDirService(payload.tmpDirs.dirs);
        await this.videoUtilService.downloadAssets(
          payload.imageId,
          payload.voiceId,
          payload.imagePath,
          payload.audioPath,
          tmpDirService,
        );
        break;
      }
    }
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    this.logger.log(`Job ${job.name} is active`);
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.name} is completed`);
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job) {
    this.logger.error(`Job ${job.name} failed`);
  }
}
