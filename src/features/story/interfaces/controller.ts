import { CreateStoryDto } from "../dtos";
import { IStory } from "src/drizzle/schema";

export interface IStoryController {
  createStory(userId: string, payload: CreateStoryDto): Promise<IStory>;
  generateSegment(userId: string, storyId: string): Promise<void>;
  generateVideo(userId: string, storyId: string): Promise<void>;
  getStory(userId: string, storyId: string): Promise<IStory>;
}
