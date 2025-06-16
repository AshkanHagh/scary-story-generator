import { CreateStoryDto } from "../dtos";
import { ISegment, IStory, IVideoRecord } from "src/drizzle/schema";
import { PollSegmentsStatusResponse } from "../types";

export interface IStoryController {
  createStory(userId: string, payload: CreateStoryDto): Promise<IStory>;
  generateSegment(userId: string, storyId: string): Promise<void>;
  generateVideo(userId: string, storyId: string): Promise<void>;
  getStory(userId: string, storyId: string): Promise<IStory>;
  getSegments(userId: string, storyId: string): Promise<ISegment[]>;
  pollSegmentStatus(
    userId: string,
    storyId: string,
  ): Promise<PollSegmentsStatusResponse>;
  pollStoryVideoStatus(userId: string, storyId: string): Promise<IVideoRecord>;
}
