import {
  Body,
  Controller,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from "@nestjs/common";
import { IStoryController } from "./interfaces/controller";
import {
  CreateSegmentDto,
  CreateSegmentSchema,
  CreateStoryDto,
  CreateStorySchema,
} from "./dtos";
import { StoryService } from "./story.service";
import { User } from "../auth/decorators/user.decorator";
import { ZodValidationPipe } from "src/utils/zod.validation";
import { AnonymousAuthGuard } from "../auth/guards/anonymous-auth.guard";
import { Response } from "express";

@Controller("story")
@UseGuards(AnonymousAuthGuard)
export class StoryController implements IStoryController {
  constructor(private storyService: StoryService) {}

  @Post("/")
  async createStory(
    @User("id") userId: string,
    @Body(new ZodValidationPipe(CreateStorySchema)) payload: CreateStoryDto,
  ): Promise<{ id: string }> {
    const storyId = await this.storyService.createStory(userId, payload);
    return { id: storyId };
  }

  @Post("/segment/:story_id")
  async generateSegment(
    @User("id") userId: string,
    @Param("story_id") storyId: string,
    @Body(new ZodValidationPipe(CreateSegmentSchema)) payload: CreateSegmentDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.storyService.generateSegment(userId, storyId, payload);
    return res.status(HttpStatus.NO_CONTENT).json();
  }

  @Post("/video/:story_id")
  async generateVideo(
    @User("id") userId: string,
    @Param("story_id") storyId: string,
    @Res() res: Response,
  ): Promise<Response> {
    await this.storyService.generateVideo(userId, storyId);

    return res.status(HttpStatus.NO_CONTENT).json();
  }
}
