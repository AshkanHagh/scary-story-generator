import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.register(import("@fastify/helmet"));
  await app.register(import("@fastify/csrf-protection"));
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
  });
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
