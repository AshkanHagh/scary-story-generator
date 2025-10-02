import { IStory } from "src/drizzle/schema";
import { CreateStoryDto } from "../dtos";

export interface IStoryService {
  createStory(userId: string, payload: CreateStoryDto): Promise<IStory>;
  getStory(userId: string, storyId: string): Promise<IStory>;
}

export interface IS3Service {
  putObject(id: string, mimetype: string, buffer: Buffer): Promise<string>;
  getObject(id: string): Promise<Buffer>;
  deleteObject(id: string): Promise<void>;
}
