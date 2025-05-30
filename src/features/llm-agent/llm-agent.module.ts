import { Module } from "@nestjs/common";
import { StoryAgentService } from "./services/story-agent.service";
import { ConfigModule } from "src/configs/config.module";
import { ImageAgentService } from "./services/image-agent.service";

@Module({
  imports: [ConfigModule],
  providers: [StoryAgentService, ImageAgentService],
  exports: [StoryAgentService, ImageAgentService],
})
export class LlmAgentModule {}
