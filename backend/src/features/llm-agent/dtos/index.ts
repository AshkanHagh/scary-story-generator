import { z } from "zod";

export const GenerateSegmentImagePromptSchema = z.object({
  prompt: z.string(),
});

export type GenerateSegmentImagePrompt = z.infer<
  typeof GenerateSegmentImagePromptSchema
>;
