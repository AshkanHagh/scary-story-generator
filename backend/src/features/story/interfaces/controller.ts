import { CreateStoryDto } from "../dtos";
import { IStory } from "src/drizzle/schema";

export interface IStoryController {
  createStory(userId: string, payload: CreateStoryDto): Promise<IStory>;
  getStory(userId: string, storyId: string): Promise<IStory>;
}
