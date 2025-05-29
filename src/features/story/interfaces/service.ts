import { CreateStoryDto } from "../dtos";

export interface IStoryService {
  createStory(userId: string, payload: CreateStoryDto): Promise<string>;
}
