export type GenerateGuidedStoryJobData = {
  userId: string;
  script: string;
  storyId: string;
};

export type GenerateImageContextJobData = {
  storyId: string;
  userId: string;
  script: string;
};

export type GenerateSegmentImageJobData = {
  segmentId: string;
  segment: string;
  context: string;
};

export type RegenrateSegmentImageJobData = {
  segmentId: string;
  prompt: string;
  isVertical: boolean;
};
