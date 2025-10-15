import { Module } from "@nestjs/common";
import { StoryWorker } from "./workers/story.worker";
import { StoryModule } from "src/features/story/story.module";
import { ImageWorker } from "./workers/image.worker";
import { VideoWorker } from "./workers/video.worker";
import { VideoModule } from "src/features/video/video.module";
import { SegmentModule } from "src/features/segment/segment.module";

@Module({
  imports: [StoryModule, VideoModule, SegmentModule],
  providers: [StoryWorker, ImageWorker, VideoWorker],
})
export class WorkerModule {}
