import { IImageAgentService } from "../interfaces/service";
import { AiConfig, IAiConfig } from "src/configs/ai.config";
import { Injectable } from "@nestjs/common";
import { ImageGenerationOptions } from "../types";
import Replicate from "replicate";

@Injectable()
export class ImageAgentService implements IImageAgentService {
  private replicate: Replicate;

  constructor(@AiConfig() private config: IAiConfig) {
    this.replicate = new Replicate({
      auth: this.config.replicate.secret,
    });
  }

  async generateImageUsingFlux(
    options: ImageGenerationOptions,
  ): Promise<string> {
    const response = await this.replicate.run(
      "black-forest-labs/flux-schnell",
      {
        input: options,
      },
    );
    return response[0] as string;
  }
}
