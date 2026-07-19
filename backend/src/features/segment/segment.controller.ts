import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SegmentService } from "./segment.service";
import { AnonymousAuthGuard } from "../auth/guards/auth.guard";
import { UserId } from "../auth/decorators/user.decorator";
import { FastifyRequest } from "fastify";

@Controller("segments")
@UseGuards(AnonymousAuthGuard)
export class SegmentController {
  constructor(private segmentService: SegmentService) {}

  @Post(":story_id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async generateSegment(
    @Req() req: FastifyRequest,
    @UserId() userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ) {
    await this.segmentService.generateSegment(req, userId, storyId);
    return;
  }

  @Get(":story_id")
  async getSegments(
    @UserId() userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ) {
    return await this.segmentService.getSegments(userId, storyId);
  }

  @Get(":story_id/status")
  async pollSegmentStatus(
    @UserId() userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ) {
    return await this.segmentService.pollSegmentStatus(userId, storyId);
  }
}
