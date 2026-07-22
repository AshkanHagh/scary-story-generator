import { Module } from "@nestjs/common";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./modules/auth/auth.module";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ZodValidationExceptionFilter } from "./filters/zod-exception.filter";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ZodValidationPipe } from "nestjs-zod";
import { SegmentModule } from "./modules/segment/segment.module";
import { StoryModule } from "./modules/story/story.module";
import { LoggerModule } from "nestjs-pino";
import { stdSerializers } from "pino";
import { QueueModule } from "./queue/queue.module";
import { StorageModule } from "./modules/storage/storage.module";
import { AiModule } from "./modules/ai/ai.module";
import { VideoModule } from "./modules/video/video.module";

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        customSuccessMessage: (req, res) =>
          `req_id=${req.id as string} method=${req.method} url=${req.url} status_code=${res.statusCode}`,
        serializers: {
          req: () => undefined,
          res: () => undefined,
          err: stdSerializers.err,
        },
        transport: {
          target: "pino-pretty",
          options: {
            colorize: false,
            ignore: "pid,hostname,context,responseTime",
            translateTime: "HH:MM:ss",
            errorLikeObjectKeys: ["err"],
            errorProps: "*",
            singleLine: true,
          },
        },
      },
      forRoutes: ["*path"],
    }),
    QueueModule,
    DrizzleModule,
    AuthModule,
    StorageModule,
    AiModule,
    SegmentModule,
    StoryModule,
    VideoModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
