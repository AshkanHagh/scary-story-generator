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
  storyId: string;
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
};

export type DownloadSegmentAssetJobData = {
  videoId: string;
  segment: ISegment;
};

export type GenerateImageFrameJobData = {
  frameIndex: number;
  imagePath: string;
  outputDir: string;
};

export type GenerateSegmentVideoJobData = {
  segmentId: string;
  storyId: string;
  segmentOrder: number;
  frameRate: number;
  frameIndex: number;
  videoId: string;
  tempPaths: TempFilePaths;
};

export type CombineSegmentVideosJobData = {
  videoId: string;
  videosPath: string;
  outputPath: string;
  tempPaths: TempFilePaths;
};

export type TempFilePaths = {
  framePath: string;
  audioPath: string;
  srtPath: string;
  imagePath: string;
};
