import { Response } from "express";
import { CreateSegmentDto, CreateStoryDto } from "../dtos";

export interface IStoryController {
  createStory(userId: string, payload: CreateStoryDto): Promise<{ id: string }>;
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
