import { Module } from "@nestjs/common";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { AuthModule } from "./features/auth/auth.module";
import { BullModule } from "@nestjs/bullmq";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { ZodValidationExceptionFilter } from "./filters/zod-exception.filter";
import { HttpExceptionFilter } from "./filters/http-exception.filter";
import { ZodValidationPipe } from "nestjs-zod";

@Module({
  imports: [
    BullModule.forRoot({
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
      connection: {
        url: process.env.REDIS_URL!,
      },
    }),
    DrizzleModule,
    AuthModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ZodValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
