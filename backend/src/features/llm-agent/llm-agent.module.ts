import { Module } from "@nestjs/common";
import { StoryAgentService } from "./services/story-agent.service";
import { ImageAgentService } from "./services/image-agent.service";
import { STORY_AGENT_SERVICE } from "./constants";
import { ConfigService } from "@nestjs/config";
import { IAiConfig } from "src/configs/ai.config";
import { MockStoryAgentService } from "./services/mocks/mock-story-agent.service";

@Module({
  providers: [
    ImageAgentService,
    {
      provide: STORY_AGENT_SERVICE,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const aiConfig = configService.getOrThrow<IAiConfig>("ai");
        return aiConfig.useMock
          ? new MockStoryAgentService()
          : new StoryAgentService(aiConfig);
      },
    },
  ],
  exports: [STORY_AGENT_SERVICE, ImageAgentService],
})
export class LlmAgentModule {}
