import { Module } from "@nestjs/common";
import { VideoController } from "./video.controller";
import { AuthModule } from "../auth/auth.module";
import { RepositoryModule } from "src/repository/repository.module";
import { BullModule } from "@nestjs/bullmq";
import { WorkerEvents } from "src/worker/event";
import { VideoService } from "./video.service";
import { LlmAgentModule } from "../llm-agent/llm-agent.module";
import { VideoUtilService } from "./util-services/util.service";
import { StoryModule } from "../story/story.module";
import { SegmentModule } from "../segment/segment.module";

@Module({
  imports: [
    AuthModule,
    RepositoryModule,
    LlmAgentModule,
    StoryModule,
    SegmentModule,
    BullModule.registerFlowProducer({
      name: WorkerEvents.Flow,
    }),
  ],
  providers: [VideoService, VideoUtilService],
  controllers: [VideoController],
  exports: [VideoUtilService],
})
export class VideoModule {}
