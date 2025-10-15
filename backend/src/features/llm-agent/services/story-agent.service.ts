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
import * as fs from "fs";
import { TranscriptionWord } from "openai/resources/audio/transcriptions";

@Injectable()
export class StoryAgentService implements IStoryAgentService {
  private openai: OpenAI;

  constructor(@AiConfig() private config: IAiConfig) {
    this.openai = new OpenAI({
      apiKey: this.config.openai.secret,
    });
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

      return response.choices[0].message.content || "";
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.ContextGenerationFailed, error);
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

      console.log("generate segment image prompt token usage:", response.usage);

      const promptString = response.choices[0].message.content!;
      const prompt = JSON.parse(promptString) as GenerateSegmentImagePrompt;
      return prompt.prompt;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.ContextGenerationFailed, error);
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
      throw new StoryError(StoryErrorType.ContextGenerationFailed, error);
    }
  }

  async getWordTimestamps(audioPath: string): Promise<TranscriptionWord[]> {
    try {
      const response = await this.openai.audio.transcriptions.create({
        model: "whisper-1",
        file: fs.createReadStream(audioPath),
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
        temperature: 0,
      });

      return response.words!;
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.ContextGenerationFailed, error);
    }
  }
}
