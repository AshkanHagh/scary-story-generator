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

export type DownloadAsset = {
  imageId: string;
  voiceId: string;
  imagePath: string;
  audioPath: string;
  tmpDirs: { dirs: string[] };
};

export type GenerateSegmentFrame = {
  segmentId: string;
  imagePath: string;
  audioPath: string;
  srtPath: string;
  frameDir: string;
  tmpDirs: { dirs: string[] };
};

export type GenerateFrameWorker = {
  frameIndex: number;
  imagePath: string;
  outputDir: string;
};

export type GenerateSegmentVideo = {
  videoPath: string;
  srtPath: string;
  audioPath: string;
  segmentId: string;
  frameDir: string;
  tmpDirs: { dirs: string[] };
};

export type CombineVideos = {
  videoId: string;
  videoDir: string;
  videoOutputPath: string;
  tmpDirs: { dirs: string[] };
};

export type TempFilePaths = {
  framePath: string;
  audioPath: string;
  srtPath: string;
  imagePath: string;
};
