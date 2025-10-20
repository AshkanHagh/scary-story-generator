import { Video } from "../_types"

export const getPendingVideo = (videos: Video[]): Video | undefined => {
  const pendingVideo: Video | undefined = videos.find(
    (video) => video.status === "pending"
  )
  return pendingVideo
}
