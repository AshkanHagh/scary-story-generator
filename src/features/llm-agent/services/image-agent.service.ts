import { StoryError, StoryErrorType } from "src/filter/exception";
import { IImageAgentService } from "../interfaces/service";
import { AiConfig, IAiConfig } from "src/configs/ai.config";
import { Injectable } from "@nestjs/common";
import { ImageGenerationOptions } from "../types";
import Replicate from "replicate";

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

      return "https://i.redd.it/i-got-bored-so-i-decided-to-draw-a-random-image-on-the-v0-4ig97vv85vjb1.png?width=1280&format=png&auto=webp&s=7177756d1f393b6e093596d06e1ba539f723264b";
    } catch (error: unknown) {
      throw new StoryError(StoryErrorType.FailedToGenerateImage, error);
    }
  }
}
