import {
  Body,
  Controller,
  Get,
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
import { IStory } from "src/drizzle/schema";

@Controller("stories")
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

  @Get("/:story_id")
  async getStory(
    @User("id") userId: string,
    @Param("story_id", new ParseUUIDPipe()) storyId: string,
  ): Promise<IStory> {
    return this.storyService.getStory(userId, storyId);
  }
}
