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
import { ISegmentController } from "./interfaces/controller";
import { SegmentService } from "./segment.service";
import { AnonymousAuthGuard } from "../auth/guards/anonymous-auth.guard";
import { User } from "../auth/decorators/user.decorator";
import { ISegment } from "src/drizzle/schema";
import { PollSegmentsStatusResponse } from "./types";

@Controller("/stories/:story_id/segments")
@UseGuards(AnonymousAuthGuard)
export class SegmentController implements ISegmentController {
  constructor(private segmentService: SegmentService) {}

  @Post("/")
  @HttpCode(HttpStatus.NO_CONTENT)
  async generateSegment(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<void> {
    await this.segmentService.generateSegment(userId, storyId);
    return;
  }

  @Get("/:story_id/segments")
  async getSegments(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<ISegment[]> {
    return this.segmentService.getSegments(userId, storyId);
  }

  @Get("/:story_id/segments/status")
  async pollSegmentStatus(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<PollSegmentsStatusResponse> {
    return this.segmentService.pollSegmentStatus(userId, storyId);
  }
}
