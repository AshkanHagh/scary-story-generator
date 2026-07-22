import { Module } from "@nestjs/common";
import { SegmentController } from "./segment.controller";
import { SegmentService } from "./segment.service";
import { AiModule } from "../ai/ai.module";
import { StorageModule } from "../storage/storage.module";
import { SegmentProcessor } from "./segment.processor";

@Module({
  imports: [AiModule, StorageModule],
  providers: [SegmentService, SegmentProcessor],
  controllers: [SegmentController],
})
export class SegmentModule {}
