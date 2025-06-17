import { Module } from "@nestjs/common";
import { SegmentController } from "./segment.controller";
import { AuthModule } from "../auth/auth.module";
import { RepositoryModule } from "src/repository/repository.module";
import { BullModule } from "@nestjs/bullmq";
import { WorkerEvents } from "src/worker/event";
import { SegmentService } from "./segment.service";
import { SegmentUtilService } from "./util.service";

@Module({
  imports: [
    AuthModule,
    RepositoryModule,
    BullModule.registerQueue(
      {
        name: WorkerEvents.Story,
      },
      {
        name: WorkerEvents.Image,
      },
    ),
  ],
  providers: [SegmentService, SegmentUtilService],
  controllers: [SegmentController],
  exports: [SegmentUtilService],
})
export class SegmentModule {}
