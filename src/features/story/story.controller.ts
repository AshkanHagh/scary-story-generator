import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IStoryController } from "./interfaces/controller";
import { CreateStoryDto, CreateStorySchema } from "./dtos";
import { StoryService } from "./story.service";
import { User } from "../auth/decorators/user.decorator";
import { ZodValidationPipe } from "src/utils/zod.validation";
import { AnonymousAuthGuard } from "../auth/guards/anonymous-auth.guard";
import { ISegment, IStory } from "src/drizzle/schema";
import { PollSegmentsStatusResponse } from "./types";

@Controller("story")
@UseGuards(AnonymousAuthGuard)
export class StoryController implements IStoryController {
  constructor(private storyService: StoryService) {}

  @Post("/")
  async createStory(
    @User("id") userId: string,
    @Body(new ZodValidationPipe(CreateStorySchema)) payload: CreateStoryDto,
  ): Promise<IStory> {
    const story = await this.storyService.createStory(userId, payload);
    return story;
  }

  @Post("/segment/:story_id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async generateSegment(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<void> {
    await this.storyService.generateSegment(userId, storyId);
    return;
  }

  @Get("/segment/:story_id")
  async getSegments(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<ISegment[]> {
    return this.storyService.getSegments(userId, storyId);
  }

  @Get("/segment/:story_id/poll")
  async pollSegmentStatus(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<PollSegmentsStatusResponse> {
    return this.storyService.pollSegmentStatus(userId, storyId);
  }

  @Post("/video/:story_id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async generateVideo(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<void> {
    await this.storyService.generateVideo(userId, storyId);
    return;
  }

  @Get("/:story_id")
  async getStory(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<IStory> {
    return this.storyService.getStory(userId, storyId);
  }
}
