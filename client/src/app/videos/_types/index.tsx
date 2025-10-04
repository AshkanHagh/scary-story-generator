export type VideoStatus = "completed" | "pending"

export type Video = {
  id: string
  status: VideoStatus
  url: string
  createdAt: string
  storyId: string
  userId: string
}
