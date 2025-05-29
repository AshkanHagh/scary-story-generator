import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { IStoryController } from "./interfaces/controller";
import { CreateStoryDto, CreateStorySchema } from "./dtos";
import { StoryService } from "./story.service";
import { User } from "../auth/decorators/user.decorator";
import { ZodValidationPipe } from "src/utils/zod.validation";
import { AnonymousAuthGuard } from "../auth/guards/anonymous-auth.guard";

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
}
