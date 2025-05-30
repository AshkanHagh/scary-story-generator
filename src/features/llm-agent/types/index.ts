export type ImageGenerationOptions = {
  prompt: string;
  num_outputs: number;
  disable_safety_checker: boolean;
  aspect_ratio: string;
  output_format: string;
  output_quality: number;
};
