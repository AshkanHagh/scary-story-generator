import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Logger } from "nestjs-pino";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );

  await app.register(import("@fastify/helmet"));
  await app.register(import("@fastify/csrf-protection"));
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
  });
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
