import { Module } from "@nestjs/common";
import { StoryService } from "./story.service";
import { StoryController } from "./story.controller";
import { RepositoryModule } from "src/repository/repository.module";
import { AuthModule } from "../auth/auth.module";
import { S3Service } from "./services/s3.service";

@Module({
  imports: [RepositoryModule, AuthModule],
  providers: [StoryService, S3Service],
  controllers: [StoryController],
  exports: [S3Service],
})
export class StoryModule {}
