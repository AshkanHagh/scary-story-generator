import { TranscriptionWord } from "openai/resources/audio/transcriptions";
import { ImageGenerationOptions } from "../types";

export interface IStoryAgentService {
  generateStoryContext(script: string): Promise<string>;
  generateSegmentImagePrompt(context: string, segment: string): Promise<string>;
  generateSegmentVoice(segment: string): Promise<Buffer>;
  getWordTimestamps(
    audioPath: string,
    text: string,
  ): Promise<TranscriptionWord[]>;
}

export interface IImageAgentService {
  generateImageUsingFlux(options: ImageGenerationOptions): Promise<string>;
}
