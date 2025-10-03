import { Injectable } from "@nestjs/common";
import { IStoryAgentService } from "../../interfaces/service";
import { StoryDataset } from "src/datasets";
import fs from "fs/promises";
import path from "node:path";

@Injectable()
export class MockStoryAgentService implements IStoryAgentService {
  constructor() {}

  // eslint-disable-next-line
  async generateSegmentImagePrompt(context: string, segment: string) {
    return StoryDataset.imagePrompt;
  }

  // eslint-disable-next-line
  async generateSegmentVoice(segment: string) {
    return await fs.readFile(
      path.join(__dirname, "../../../../datasets/", StoryDataset.audioPath),
    );
  }

  // eslint-disable-next-line
  async generateStoryContext(script: string) {
    return StoryDataset.storyContext;
  }

  // eslint-disable-next-line
  async getWordTimestamps(audioPath: string) {
    return StoryDataset.wordTimestamps;
  }
}
