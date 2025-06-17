import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IVideoController } from "./interfaces/controller";
import { AnonymousAuthGuard } from "../auth/guards/anonymous-auth.guard";
import { VideoService } from "./video.service";
import { User } from "../auth/decorators/user.decorator";
import { IVideoRecord } from "src/drizzle/schema";

@Controller("/stories/:story_id/videos")
@UseGuards(AnonymousAuthGuard)
export class VideoController implements IVideoController {
  constructor(private videoService: VideoService) {}

  @Post("/:story_id/videos")
  @HttpCode(HttpStatus.NO_CONTENT)
  async generateVideo(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<void> {
    await this.videoService.generateVideo(userId, storyId);
    return;
  }

  @Get("/:story_id/videos/status")
  async pollStoryVideoStatus(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<IVideoRecord> {
    return this.videoService.pollStoryVideoStatus(userId, storyId);
  }

  @Get("/videos")
  userVideos(@User("id") userId: string): Promise<IVideoRecord[]> {
    return this.videoService.userVideos(userId);
  }
}
