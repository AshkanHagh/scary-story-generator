import { z } from "zod";

export const CreateStorySchema = z.object({
  title: z.string().min(1).max(128),
  script: z.string().max(10_000),
});

export type CreateStoryDto = z.infer<typeof CreateStorySchema>;
