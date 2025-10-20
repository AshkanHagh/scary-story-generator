import { api } from "@/api/instance"
import { HTTPError } from "ky"
import { useState } from "react"
import { toast } from "sonner"

type OnSuccess = () => void
type OnError = (error: HTTPError | Error) => void

const useCreateVideo = () => {
  const [isLoading, setIsLoading] = useState(false)

  const createVideo = async (
    storyId: string,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setIsLoading(true)
    try {
      await api.post<null>(`videos/${storyId}`).json()
      onSuccess?.()
    } catch (e) {
      const error = e as HTTPError | Error
      onError?.(error)
      toast.error("Failed to create video")
      return error
    } finally {
      setIsLoading(false)
    }
  }

  return { createVideo, isLoading }
}

export default useCreateVideo
