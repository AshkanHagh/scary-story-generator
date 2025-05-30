import { z } from "zod";

export const CreateStorySchema = z.object({
  title: z.string().min(1).max(128),
  script: z.string().max(10_000),
  usingAi: z.boolean().default(false),
});

export type CreateStoryDto = z.infer<typeof CreateStorySchema>;

export const CreateSegmentSchema = z.object({
  isVertical: z.boolean(),
});

export type CreateSegmentDto = z.infer<typeof CreateSegmentSchema>;
