import { Module } from "@nestjs/common";
import { StoryService } from "./story.service";
import { StoryController } from "./story.controller";
import { RepositoryModule } from "src/repository/repository.module";
import { BullModule } from "@nestjs/bullmq";
import { WorkerEvents } from "src/worker/event";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    RepositoryModule,
    AuthModule,
    BullModule.registerQueue({
      name: WorkerEvents.Story,
    }),
    BullModule.registerQueue({
      name: WorkerEvents.Image,
    }),
  ],
  providers: [StoryService],
  controllers: [StoryController],
  exports: [StoryService],
})
export class StoryModule {}
