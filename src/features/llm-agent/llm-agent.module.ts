import { Module } from "@nestjs/common";
import { StoryAgentService } from "./services/story-agent.service";
import { ConfigModule } from "src/configs/config.module";

@Module({
  imports: [ConfigModule],
  providers: [StoryAgentService],
  exports: [StoryAgentService],
})
export class LlmAgentModule {}
