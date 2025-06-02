import { ImageGenerationOptions } from "../types";

export interface IStoryAgentService {
  generateGuidedStory(prompt: string): Promise<string>;
  generateStoryContext(script: string): Promise<string>;
  generateSegmentImagePrompt(context: string, segment: string): Promise<string>;
  generateSegmentVoice(segment: string): Promise<Buffer>;
}

export interface IImageAgentService {
  generateImageUsingFlux(options: ImageGenerationOptions): Promise<string>;
}
