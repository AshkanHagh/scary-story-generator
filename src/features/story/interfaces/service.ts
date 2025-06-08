import { ISegment } from "src/drizzle/schema";
import { CreateSegmentDto, CreateStoryDto } from "../dtos";

export interface IStoryService {
  createStory(userId: string, payload: CreateStoryDto): Promise<string>;
  generateSegment(
    userId: string,
    storyId: string,
    payload: CreateSegmentDto,
  ): Promise<void>;
  generateVideo(userId: string, storyId: string): Promise<void>;
}

export interface IS3Service {
  putObject(id: string, mimetype: string, buffer: Buffer): Promise<string>;
  getObject(id: string): Promise<Buffer>;
}

export interface IStoryProcessingService {
  createSegmentWithImage(
    userId: string,
    storyId: string,
    text: string,
    order: number,
    context: string,
  ): Promise<void>;

  generateSegmentImage(segmentId: string, prompt: string): Promise<void>;
  generateSegmentVideoFrame(
    segment: ISegment,
    imagePath: string,
    voicePath: string,
  ): Promise<void>;
  combineSegmentVideo(storyId: string, videosPath: string): Promise<void>;
}
