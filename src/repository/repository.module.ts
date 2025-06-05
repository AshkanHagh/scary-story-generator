import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { RepositoryService } from "./repository.service";
import { UserRepository } from "./repositories/user";
import { StoryRepository } from "./repositories/story";
import { SegmentRepository } from "./repositories/segment";
import { VideoProcessingStatusRepository } from "./repositories/video-processing-status";

@Module({
  imports: [DrizzleModule],
  providers: [
    RepositoryService,
    UserRepository,
    StoryRepository,
    SegmentRepository,
    VideoProcessingStatusRepository,
  ],
  exports: [RepositoryService],
})
export class RepositoryModule {}
