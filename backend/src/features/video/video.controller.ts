import {
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { VideoService } from "./video.service";
import { AnonymousAuthGuard } from "../auth/guards/auth.guard";
import { UserId } from "../auth/decorators/user.decorator";
import { FastifyRequest } from "fastify";

@Controller("/videos")
@UseGuards(AnonymousAuthGuard)
export class VideoController {
  constructor(private videoService: VideoService) {}

  @Post("/:story_id")
  async generateVideo(
    @Req() req: FastifyRequest,
    @UserId() userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ) {
    const videoId = await this.videoService.generateVideo(req, userId, storyId);
    return { id: videoId };
  }

  // @Get("/:video_id/status")
  // async pollStoryVideoStatus(
  //   @User("id") userId: string,
  //   @Param("video_id", new ParseUUIDPipe()) storyId: string,
  // ): Promise<IVideoRecord> {
  //   return await this.videoService.pollStoryVideoStatus(userId, storyId);
  // }

  // @Get("/")
  // async userVideos(@User("id") userId: string): Promise<IVideoRecord[]> {
  //   console.log(await this.videoService.userVideos(userId));
  //   return await this.videoService.userVideos(userId);
  // }
}
