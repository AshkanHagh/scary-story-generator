import { Module } from "@nestjs/common";
import { StoryService } from "./story.service";
import { StoryController } from "./story.controller";
import { BullModule } from "@nestjs/bullmq";
import { StoryWorker } from "./story.processor";
import { AssetsModule } from "../assets/assets.module";
import { LlmModule } from "../llm/llm.module";

@Module({
  imports: [
    AssetsModule,
    LlmModule,
    BullModule.registerQueue({
      name: "story",
    }),
  ],
  providers: [StoryService, StoryWorker],
  controllers: [StoryController],
})
export class StoryModule {}
