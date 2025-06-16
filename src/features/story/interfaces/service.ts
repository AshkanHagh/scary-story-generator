import { ISegment, IStory } from "src/drizzle/schema";
import { CreateStoryDto } from "../dtos";
import { TempFilePaths } from "src/worker/types";

export interface IStoryService {
  createStory(userId: string, payload: CreateStoryDto): Promise<IStory>;
  generateSegment(userId: string, storyId: string): Promise<void>;
  generateVideo(userId: string, storyId: string): Promise<void>;
}

export interface IS3Service {
  putObject(id: string, mimetype: string, buffer: Buffer): Promise<string>;
  getObject(id: string): Promise<Buffer>;
  deleteObject(id: string): Promise<void>;
}

export interface IStoryProcessingService {
  createSegmentWithImage(
    userId: string,
    storyId: string,
    text: string,
    order: number,
    context: string,
  ): Promise<void>;

  generateSegmentImage(
    storyId: string,
    segmentId: string,
    segment: string,
  ): Promise<void>;

  generateSegmentVideoFrame(
    videoId: string,
    segment: ISegment,
    imagePath: string,
    voicePath: string,
  ): Promise<void>;
  combineSegmentVideo(
    videoId: string,
    storyId: string,
    tempPaths: TempFilePaths,
  ): Promise<void>;
}
