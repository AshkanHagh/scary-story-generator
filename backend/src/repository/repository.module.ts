import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { RepositoryService } from "./repository.service";
import { UserRepository } from "./repositories/user";
import { StoryRepository } from "./repositories/story";
import { SegmentRepository } from "./repositories/segment";
import { VideoRepository } from "./repositories/video";

@Module({
  imports: [DrizzleModule],
  providers: [
    RepositoryService,
    UserRepository,
    StoryRepository,
    SegmentRepository,
    VideoRepository,
  ],
  exports: [RepositoryService],
})
export class RepositoryModule {}
