import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { Injectable, Logger } from "@nestjs/common";
import { Pollinations } from "@pollinations/sdk";
import { AssemblyAI } from "assemblyai";
import pRetry from "p-retry";
import { StoryError, StoryErrorType } from "src/filters/exception";

@Injectable()
export class AiService {
  private logger = new Logger(AiService.name);
  private client: Pollinations;
  private ttsClient: ElevenLabsClient;
  private subClient: AssemblyAI;

  constructor() {
    this.client = new Pollinations({
      apiKey: process.env.POLLINATIONS_API_KEY,
      maxRetries: 3,
    });
    this.ttsClient = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    this.subClient = new AssemblyAI({
      apiKey: process.env.ASSEMBLY_AI_TOKEN!,
    });
  }

  async genSegmentImage(prompt: string) {
    try {
      return await this.client.image(prompt, {
        model: "flux",
        width: 1536,
        height: 864,
        private: true,
        nofeed: true,
        nologo: true,
        guidanceScale: 7,
      });
    } catch (error) {
      throw new StoryError(StoryErrorType.AI_REQ_FAILED, error);
    }
  }

  async genSegmentImagePrompt(storyContext: string, segment: string) {
    try {
      return await this.client.text(segment, {
        systemPrompt: `
          You are a professional prompt engineer specialized in generating vivid, photorealistic prompts for AI image generators like REPLICATE.

          All the image prompts you generate must follow this **overall visual context**:
            ${storyContext}

          Your task is to receive a short segment from a story, and generate a detailed, photorealistic image prompt based on it. The image prompt should:
            - Accurately reflect the meaning and emotion of the story segment
            - Match the tone and atmosphere of the overall visual context
            - Include visual elements like people, actions, setting, mood, lighting, weather, and clothing
            - Be concise (2–5 sentences), rich in sensory and visual details
            - Be written for AI image generation with a photorealistic style

          Only return the final image prompt. No extra explanation or metadata.
        `,
        private: true,
        model: "nova-fast",
      });
    } catch (error) {
      throw new StoryError(StoryErrorType.AI_REQ_FAILED, error);
    }
  }

  async genStoryContext(story: string) {
    try {
      return await pRetry(
        async () => {
          return await this.client.text(story, {
            systemPrompt:
              "You're a professional visual scene designer. Based on the segment of a story provided, and an overall visual context, generate a detailed and vivid text-to-image prompt. The output should describe the visual elements of the scene clearly, including characters, setting, emotions, lighting, and overall mood. Use a photorealistic style unless specified otherwise. Keep it concise, but rich in imagery. Do not include any commentary or explanation. Just output the prompt.",
            private: true,
            model: "nova-fast",
          });
        },
        {
          retries: 3,
          onFailedAttempt: (err) =>
            this.logger.warn(`Gen Context attempt ${err.attemptNumber} failed`),
        },
      );
    } catch (error) {
      throw new StoryError(StoryErrorType.AI_REQ_FAILED, error);
    }
  }

  async genSpeach(story: string) {
    try {
      const speach = await this.ttsClient.textToSpeech.convert(
        process.env.ELEVENLABS_VOICE_ID!,
        {
          text: story,
        },
      );
      const speachBuff = Buffer.from(await new Response(speach).arrayBuffer());
      const transcript = await this.subClient.transcripts.transcribe({
        audio: speachBuff,
        speech_models: ["universal-2"],
      });
      const subtitleSrt = await this.subClient.transcripts.subtitles(
        transcript.id,
        "srt",
      );

      return {
        speach: {
          buffer: speachBuff,
          contentType: "audio/mpeg",
        },
        subtitle: {
          text: subtitleSrt,
          contentType: "application/x-subrip",
        },
      };
    } catch (error) {
      throw new StoryError(StoryErrorType.AI_REQ_FAILED, error);
    }
  }
}
