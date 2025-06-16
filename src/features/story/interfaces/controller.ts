import { Response } from "express";
import { CreateSegmentDto, CreateStoryDto } from "../dtos";
import { IStory } from "src/drizzle/schema";

export interface IStoryController {
  createStory(userId: string, payload: CreateStoryDto): Promise<IStory>;
  generateSegment(
    userId: string,
    storyId: string,
    payload: CreateSegmentDto,
    res: Response,
  ): Promise<Response>;
  generateVideo(
    userId: string,
    storyId: string,
    res: Response,
  ): Promise<Response>;
}
