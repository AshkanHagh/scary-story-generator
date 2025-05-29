import { Module } from "@nestjs/common";
import { DrizzleModule } from "src/drizzle/drizzle.module";
import { RepositoryService } from "./repository.service";
import { UserRepository } from "./repositories/user";
import { StoryRepository } from "./repositories/story";

@Module({
  imports: [DrizzleModule],
  providers: [RepositoryService, UserRepository, StoryRepository],
  exports: [RepositoryService],
})
export class RepositoryModule {}
