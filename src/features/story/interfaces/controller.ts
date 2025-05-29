import { CreateStoryDto } from "../dtos";

export interface IStoryController {
  createStory(userId: string, payload: CreateStoryDto): Promise<{ id: string }>;
}
