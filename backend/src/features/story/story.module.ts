import { Module } from "@nestjs/common";
import { StoryService } from "./story.service";
import { StoryController } from "./story.controller";
import { BullModule } from "@nestjs/bullmq";
import { StoryWorker } from "./story.processor";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "story",
    }),
  ],
  providers: [StoryService, StoryWorker],
  controllers: [StoryController],
})
export class StoryModule {}
