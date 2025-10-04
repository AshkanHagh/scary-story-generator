import api from "@/api/instance"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { Video } from "../_types"
import useCheckVideosStatus from "./use-check-video-status"

const useGetVideos = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<Video[]>([])

  const { checkVideoStatus } = useCheckVideosStatus()

  const getVideos = useCallback(async () => {
    setIsLoading(true)

    // Callback for when a pending video becomes completed
    const handleCheckVideoSuccess = (data: Video) => {
      setData((prev) =>
        prev.map((video) => (video.id === data.id ? data : video))
      )
    }

    try {
      const response = await api.get<Video[]>("videos").json()
      setData(response)

      // Check if there is any pending video in the response
      const pendingId = getPendingVideo(response)

      // If a pending video exists, start checking its status periodically
      if (pendingId) {
        checkVideoStatus(pendingId.id, handleCheckVideoSuccess, () =>
          toast.error("Something went Wrong")
        )
      }
    } catch (error) {
      console.log(error)
      toast.error("Something went Wrong")
    } finally {
      setIsLoading(false)
    }
  }, [checkVideoStatus])

  useEffect(() => {
    getVideos()
  }, [])

  return { getVideos, isLoading, data }
}

const getPendingVideo = (videos: Video[]): Video | undefined => {
  const pendingVideo: Video | undefined = videos.find(
    (video) => video.status === "pending"
  )
  return pendingVideo
}

export default useGetVideos
