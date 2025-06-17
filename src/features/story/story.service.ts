import { Injectable } from "@nestjs/common";
import { IStoryService } from "./interfaces/service";
import { CreateStoryDto } from "./dtos";
import { RepositoryService } from "src/repository/repository.service";
import { IStory } from "src/drizzle/schema";

@Injectable()
export class StoryService implements IStoryService {
  constructor(private repo: RepositoryService) {}

  async createStory(userId: string, payload: CreateStoryDto): Promise<IStory> {
    const story = await this.repo.story().insert({
      title: payload.title,
      script: payload.script,
      userId,
    });

    return story;
  }

  async getStory(userId: string, storyId: string): Promise<IStory> {
    const story = await this.repo.story().userHasAccess(storyId, userId);
    return story;
  }
}
