import { Module } from "@nestjs/common";
import { LlmAgentModule } from "src/features/llm-agent/llm-agent.module";
import { RepositoryModule } from "src/repository/repository.module";
import { StoryWorker } from "./workers/story.worker";
import { StoryModule } from "src/features/story/story.module";
import { ImageWorker } from "./workers/image.worker";
import { VideoWorker } from "./workers/video.worker";
import { VideoModule } from "src/features/video/video.module";
import { SegmentModule } from "src/features/segment/segment.module";

@Module({
  imports: [
    RepositoryModule,
    LlmAgentModule,
    StoryModule,
    VideoModule,
    SegmentModule,
  ],
  providers: [StoryWorker, ImageWorker, VideoWorker],
})
export class WorkerModule {}
