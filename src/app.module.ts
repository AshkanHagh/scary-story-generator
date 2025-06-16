import { Module } from "@nestjs/common";
import { ConfigModule } from "./configs/config.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./features/auth/auth.module";
import { RepositoryModule } from "./repository/repository.module";
import { StoryModule } from "./features/story/story.module";
import { LlmAgentModule } from "./features/llm-agent/llm-agent.module";
import { BullModule } from "@nestjs/bullmq";
import { ConfigService } from "@nestjs/config";
import { IDbConfig } from "./configs/db.config";
import { WorkerModule } from "./worker/worker.module";

@Module({
  imports: [
    ConfigModule.register(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbConfig = config.get<IDbConfig>("db");
        return {
          connection: {
            host: dbConfig?.redis.host,
            port: dbConfig?.redis.port,
          },
        };
      },
    }),
    DrizzleModule,
    AuthModule,
    RepositoryModule,
    StoryModule,
    LlmAgentModule,
    WorkerModule,
  ],
})
export class AppModule {}
