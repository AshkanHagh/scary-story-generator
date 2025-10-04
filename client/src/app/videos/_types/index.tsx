export interface Video {
  id: string
  status: "completed" | "processing" | "failed"
  url: string
  createdAt: string
  storyId: string
  userId: string
}
