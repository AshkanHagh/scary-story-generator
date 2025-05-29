import { Module } from "@nestjs/common";
import { LlmAgentModule } from "src/features/llm-agent/llm-agent.module";
import { RepositoryModule } from "src/repository/repository.module";
import { StoryWorker } from "./workers/story.worker";

@Module({
  imports: [RepositoryModule, LlmAgentModule],
  providers: [StoryWorker],
})
export class WorkerModule {}
