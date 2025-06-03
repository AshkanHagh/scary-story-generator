export enum WorkerEvents {
  Story = "story",
  Image = "image",
}

export enum StoryJobNames {
  GENERATE_GUIDED_STORY = "generate.guided.story",
  GENERATE_IMAGE_CONTEXT = "generate.image.context",
  GENERATE_SEGMENT_IMAGE_REPLICATE = "generate.segment.image.replicate",
  GENERATE_SEGMENT_VOICE = "generate.segment.voice",
}

export enum ImageJobNames {
  GENERATE_IMAGE = "generate.image",
  DOWNLOAD_AND_GENERATE_SEGMENT_FRAME = "download.segment.image.audio.frame.audio",
  GENERATE_IMAGE_FRAME = "generate.image.frame",
}
