import { StoryError, StoryErrorType } from "src/filter/exception";
import { IImageAgentService } from "../interfaces/service";
import { AiConfig, IAiConfig } from "src/configs/ai.config";
import { Injectable } from "@nestjs/common";
import { ImageGenerationOptions } from "../types";

@Injectable()
export class ImageAgentService implements IImageAgentService {
  // private replicate: Replicate;

  constructor(@AiConfig() private config: IAiConfig) {
    // this.replicate = new Replicate({
    //   auth: config.replicate.secret,
    // });
  }

  // NOTE: currently i dont have any replicate credit so i just use random image urls
  async generateImageUsingFlux(
    options: ImageGenerationOptions,
  ): Promise<string> {
    try {
      // const response = await this.replicate.run(
      //   "black-forest-labs/flux-schnell",
      //   {
      //     input: options,
      //   },
      // );
      // return response[0] as string;

      return "http://localhost:9000/scary-story-generator/thumb-1920-1337024.png";
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.FailedToGenerateImage, error);
    }
  }
}
