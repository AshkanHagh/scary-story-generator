import { Module } from "@nestjs/common";
import { LlmAgentModule } from "src/features/llm-agent/llm-agent.module";
import { RepositoryModule } from "src/repository/repository.module";
import { StoryWorker } from "./workers/story.worker";
import { StoryModule } from "src/features/story/story.module";
import { ImageWorker } from "./workers/image.worker";

@Module({
  imports: [RepositoryModule, LlmAgentModule, StoryModule],
  providers: [StoryWorker, ImageWorker],
})
export class WorkerModule {}
