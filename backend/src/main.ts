import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { StoryExceptionFilter } from "./filter/exception-filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("/api/v1");
  app.useGlobalFilters(new StoryExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
