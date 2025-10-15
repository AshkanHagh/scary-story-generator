export enum WorkerEvents {
  Story = "story",
  Image = "image",
  Video = "video",
  Flow = "flow",
}

export enum StoryJobNames {
  GENERATE_STORY_CONTEXT = "story.generate.context",
  GENERATE_SEGMENT_IMAGE = "story.generate.segment.image",
  GENERATE_SEGMENT_VOICE = "story.generate.segment.voice",
}

export enum ImageJobNames {
  DOWNLOAD_ASSETS = "image.download.assets",
}

export enum VideoJobNames {
  GENERATE_VIDEO = "video.generate.video",
  COMBINE_VIDEOS = "video.combine.videos",
  GENERATE_SEGMENT_FRAME = "video.generate.segment.frame",
}
