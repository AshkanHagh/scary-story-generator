import { CreateSegmentDto, CreateStoryDto } from "../dtos";

export interface IStoryService {
  createStory(userId: string, payload: CreateStoryDto): Promise<string>;
  generateSegment(
    userId: string,
    storyId: string,
    payload: CreateSegmentDto,
  ): Promise<void>;

  createSegmentWithImage(
    userId: string,
    storyId: string,
    text: string,
    order: number,
    context: string,
  ): Promise<void>;

  generateSegmentImage(segmentId: string, prompt: string): Promise<void>;
}

export interface IS3Service {
  putObject(id: string, mimetype: string, buffer: Buffer): Promise<string>;
}
