export enum WorkerEvents {
  Story = "story",
  Image = "image",
  Video = "video",
}

export enum StoryJobNames {
  GENERATE_STORY_CONTEXT = "story.generate.context",
  GENERATE_SEGMENT_IMAGE = "story.generate.segment.image",
  GENERATE_SEGMENT_VOICE = "story.generate.segment.voice",
}

export enum ImageJobNames {
  GENERATE_IMAGE = "image.generate",
  DOWNLOAD_SEGMENT_ASSETS = "image.download.segment.assets",
}

export enum VideoJobNames {
  GENERATE_SEGMENT_VIDEO = "video.generate.segment",
  COMBINE_VIDEOS = "video.combine",
}
