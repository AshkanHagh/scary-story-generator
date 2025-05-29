import OpenAI from "openai";
import { AiConfig, IAiConfig } from "src/configs/ai.config";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { IStoryAgentService } from "../interfaces/service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class StoryAgentService implements IStoryAgentService {
  constructor(@AiConfig() private config: IAiConfig) {}

  async generateGuidedStory(prompt: string): Promise<string> {
    const openai = new OpenAI({
      baseURL: this.config.openai.endpoint,
      apiKey: this.config.openai.secret,
    });

    try {
      const response = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini",
        temperature: 0.8,
        messages: [
          {
            role: "system",
            content:
              "You are a professional writer tasked with creating a short story for a voice over based on a given description. The story should be a story that is 10,000 characters max length. DO NOT TITLE ANY SEGMENT. JUST RETURN THE TEXT OF THE ENTIRE STORY.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const story = response.choices[0].message.content;
      if (!story) {
        throw new StoryError(StoryErrorType.FailedToGenerateStory);
      }

      return story;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.LlmAgentFailed, error);
    }
  }
}
