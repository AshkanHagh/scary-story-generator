import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const CreateStorySchema = z.object({
  title: z.string().min(1).max(128),
  script: z.string().max(10_000),
});

export class CreateStoryDto extends createZodDto(CreateStorySchema) {}
