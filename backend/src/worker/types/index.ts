import { ISegment } from "src/drizzle/schema";

export type GenerateGuidedStoryJobData = {
  userId: string;
  script: string;
  storyId: string;
};

export type GenerateStoryCtx = {
  step: "initial" | "final";
  storyId: string;
  script: string;
};

export type GenerateSegmentImage = {
  storyId: string;
  segmentId: string;
  segment: string;
};

export type RegenrateSegmentImageJobData = {
  segmentId: string;
  prompt: string;
};

export type GenerateSegmentAudio = {
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
