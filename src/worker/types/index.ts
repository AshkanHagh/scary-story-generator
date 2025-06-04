import { ISegment } from "src/drizzle/schema";

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

export type GenerateSegmentVoiceJobData = {
  segmentId: string;
  segment: string;
  context: string;
};

export type DownloadSegmentAssetJobData = {
  segment: ISegment;
};

export type GenerateImageFrameJobData = {
  frameIndex: number;
  imagePath: string;
  outputDir: string;
};

export type GenerateSegmentVideoJobData = {
  segmentId: string;
  segmentOrder: number;
  frameRate: number;
  framePath: string;
  audioPath: string;
  outputDir: string;
  frameIndex: number;
  srtPath: string;
  imagePath: string;
};
