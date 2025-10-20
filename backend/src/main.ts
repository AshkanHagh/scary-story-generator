import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { StoryExceptionFilter } from "./filter/exception-filter";
import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("/api/v1");
  app.useGlobalFilters(new StoryExceptionFilter());
  app.enableCors(<CorsOptions>{
    origin: process.env.CORS_ORIGIN || "*",
  });

  await app.listen(process.env.PORT ?? 3000, "0.0.0.0");
}
bootstrap();
