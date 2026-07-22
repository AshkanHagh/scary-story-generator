import { Module } from "@nestjs/common";
import { AiModule } from "../ai/ai.module";
import { StorageModule } from "../storage/storage.module";
import { VideoService } from "./video.service";
import { VideoController } from "./video.controller";
import { VideoProcessor } from "./video.processor";

@Module({
  imports: [AiModule, StorageModule],
  providers: [VideoService, VideoProcessor],
  controllers: [VideoController],
})
export class VideoModule {}
