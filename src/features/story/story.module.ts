import { Module } from "@nestjs/common";
import { StoryService } from "./story.service";
import { StoryController } from "./story.controller";
import { RepositoryModule } from "src/repository/repository.module";
import { BullModule } from "@nestjs/bullmq";
import { WorkerEvents } from "src/worker/event";
import { AuthModule } from "../auth/auth.module";
import { S3Service } from "./services/s3.service";
import { LlmAgentModule } from "../llm-agent/llm-agent.module";
import { StoryProcessingService } from "./services/story-processing.service";

@Module({
  imports: [
    RepositoryModule,
    AuthModule,
    LlmAgentModule,
    BullModule.registerQueue({
      name: WorkerEvents.Story,
    }),
    BullModule.registerQueue({
      name: WorkerEvents.Image,
    }),
    BullModule.registerQueue({
      name: WorkerEvents.Video,
    }),
  ],
  providers: [StoryService, S3Service, StoryProcessingService],
  controllers: [StoryController],
  exports: [S3Service, StoryProcessingService],
})
export class StoryModule {}
