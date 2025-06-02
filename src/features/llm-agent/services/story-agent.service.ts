import OpenAI from "openai";
import { AiConfig, IAiConfig } from "src/configs/ai.config";
import { StoryError, StoryErrorType } from "src/filter/exception";
import { IStoryAgentService } from "../interfaces/service";
import { Injectable } from "@nestjs/common";
import {
  GenerateSegmentImagePrompt,
  GenerateSegmentImagePromptSchema,
} from "../dtos";
import { zodResponseFormat } from "openai/helpers/zod";

@Injectable()
export class StoryAgentService implements IStoryAgentService {
  private openai: OpenAI;

  constructor(@AiConfig() private config: IAiConfig) {
    this.openai = new OpenAI({
      // baseURL: this.config.openai.endpoint,
      apiKey: this.config.openai.secret,
    });
  }

  async generateGuidedStory(prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
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

      console.log("generate guided story token usage:", response.usage);

      const story = response.choices[0].message.content;
      if (!story) {
        throw new StoryError(StoryErrorType.FailedToGenerateStory);
      }

      return story;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.LlmAgentFailed, error);
    }
  }

  async generateStoryContext(script: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "You're a professional visual scene designer. Based on the segment of a story provided, and an overall visual context, generate a detailed and vivid text-to-image prompt. The output should describe the visual elements of the scene clearly, including characters, setting, emotions, lighting, and overall mood. Use a photorealistic style unless specified otherwise. Keep it concise, but rich in imagery. Do not include any commentary or explanation. Just output the prompt.",
          },
          {
            role: "user",
            content: script,
          },
        ],
      });

      console.log("generate story context token usage:", response.usage);

      const context = response.choices[0].message.content;
      if (!context) {
        throw new StoryError(StoryErrorType.FailedToGenerateStory);
      }

      return context;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.LlmAgentFailed, error);
    }
  }

  async generateSegmentImagePrompt(
    context: string,
    segment: string,
  ): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
            You are a professional prompt engineer specialized in generating vivid, photorealistic prompts for AI image generators like REPLICATE.

            All the image prompts you generate must follow this **overall visual context**:
            ${context}

            Your task is to receive a short segment from a story, and generate a detailed, photorealistic image prompt based on it. The image prompt should:
            - Accurately reflect the meaning and emotion of the story segment
            - Match the tone and atmosphere of the overall visual context
            - Include visual elements like people, actions, setting, mood, lighting, weather, and clothing
            - Be concise (2–5 sentences), rich in sensory and visual details
            - Be written for AI image generation with a photorealistic style

            Only return the final image prompt. No extra explanation or metadata.
            `,
          },
          {
            role: "user",
            content: segment,
          },
        ],
        response_format: zodResponseFormat(
          GenerateSegmentImagePromptSchema,
          "prompt",
        ),
      });

      const promptString = response.choices[0].message.content;
      if (!promptString) {
        throw new StoryError(StoryErrorType.FailedToGenerateStory);
      }

      const prompt = JSON.parse(promptString) as GenerateSegmentImagePrompt;
      return prompt.prompt;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.LlmAgentFailed, error);
    }
  }

  async generateSegmentVoice(segment: string): Promise<Buffer> {
    try {
      const response = await this.openai.audio.speech.create({
        input: segment,
        model: "gpt-4o-mini-tts",
        voice: "onyx",
      });

      return Buffer.from(await response.arrayBuffer());
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.LlmAgentFailed, error);
    }
  }
}
