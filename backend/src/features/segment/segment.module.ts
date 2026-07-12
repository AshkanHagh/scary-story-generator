import { Module } from "@nestjs/common";
import { SegmentController } from "./segment.controller";
import { AuthModule } from "../auth/auth.module";
import { SegmentService } from "./segment.service";
import { LlmModule } from "../llm/llm.module";
import { BullModule } from "@nestjs/bullmq";
import { SEGMENT_FLOW_PRODUCER, SEGMENT_QUEUE } from "./constants";
import { AssetsModule } from "../assets/assets.module";

@Module({
  imports: [
    AuthModule,
    LlmModule,
    AssetsModule,
    BullModule.registerQueue({
      name: SEGMENT_QUEUE,
    }),
    BullModule.registerFlowProducer({
      name: SEGMENT_FLOW_PRODUCER,
    }),
  ],
  providers: [SegmentService],
  controllers: [SegmentController],
})
export class SegmentModule {}
