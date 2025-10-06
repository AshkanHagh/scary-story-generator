export type Segment = {
  id: string
  storyId: string
  order: number
  text: string
  imageUrl: string
  status: "completed" | "pending" | "failed"
  createdAt: string
  updatedAt: string
}

export type StorySegmentsResponse = {
  isCompleted: boolean
  segments: Segment[]
}
