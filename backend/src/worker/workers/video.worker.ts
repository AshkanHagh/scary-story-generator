import { OnWorkerEvent, Processor, WorkerHost } from "@nestjs/bullmq";
import { VideoJobNames, WorkerEvents } from "../event";
import { Job } from "bullmq";
import {
  CombineVideos,
  GenerateSegmentFrame,
  GenerateSegmentVideo,
} from "../types";
import { VideoUtilService } from "src/features/video/util-services/util.service";
import { Logger } from "@nestjs/common";
import { TmpDirService } from "src/features/video/util-services/tmp-dir.service";

@Processor(WorkerEvents.Video, { concurrency: 4 })
export class VideoWorker extends WorkerHost {
  private logger = new Logger(VideoWorker.name);

  constructor(private videoUtilService: VideoUtilService) {
    super();
  }

  async process(job: Job): Promise<void> {
    switch (job.name) {
      case VideoJobNames.GENERATE_SEGMENT_FRAME as string: {
        const payload = job.data as GenerateSegmentFrame;
        const tmpDirService = new TmpDirService(payload.tmpDirs.dirs);
        await this.videoUtilService.generateSegmentFrames(
          payload.segmentId,
          payload.imagePath,
          payload.audioPath,
          payload.srtPath,
          payload.frameDir,
          tmpDirService,
        );
        break;
      }

      case VideoJobNames.GENERATE_VIDEO as string: {
        const payload = job.data as GenerateSegmentVideo;
        const tmpDirService = new TmpDirService(payload.tmpDirs.dirs);
        await this.videoUtilService.createSegmentVideo(
          payload.videoPath,
          payload.srtPath,
          payload.audioPath,
          payload.segmentId,
          payload.frameDir,
          tmpDirService,
        );
        break;
      }
      case VideoJobNames.COMBINE_VIDEOS as string: {
        const payload = job.data as CombineVideos;
        const tmpDirService = new TmpDirService(payload.tmpDirs.dirs);
        await this.videoUtilService.combineSegmentVideos(
          payload.videoId,
          payload.videoDir,
          payload.videoOutputPath,
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
