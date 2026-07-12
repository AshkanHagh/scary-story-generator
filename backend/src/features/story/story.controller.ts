import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from "@nestjs/common";
import { StoryService } from "./story.service";
import { AnonymousAuthGuard } from "../auth/guards/auth.guard";
import { UserId } from "../auth/decorators/user.decorator";
import { CreateStoryDto } from "./dtos";

@Controller("stories")
@UseGuards(AnonymousAuthGuard)
export class StoryController {
  constructor(private storyService: StoryService) {}

  @Post("")
  async create(@UserId() userId: string, @Body() payload: CreateStoryDto) {
    return await this.storyService.create(userId, payload);
  }

  @Get(":id")
  async get(
    @UserId() userId: string,
    @Param("id", new ParseUUIDPipe()) storyId: string,
  ) {
    return await this.storyService.get(userId, storyId);
  }
}
