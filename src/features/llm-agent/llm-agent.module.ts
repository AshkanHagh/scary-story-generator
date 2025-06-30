import { Module } from "@nestjs/common";
import { StoryAgentService } from "./services/story-agent.service";
import { ImageAgentService } from "./services/image-agent.service";

@Module({
  providers: [StoryAgentService, ImageAgentService],
  exports: [StoryAgentService, ImageAgentService],
})
export class LlmAgentModule {}
