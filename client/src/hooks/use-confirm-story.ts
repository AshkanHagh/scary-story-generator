import { api } from "@/api/instance"
import { HTTPError } from "ky"
import { useState } from "react"
import { toast } from "sonner"

type OnSuccess = () => void
type OnError = (error: HTTPError | Error) => void

const useConfirmStory = () => {
  const [isLoading, setIsLoading] = useState(false)

  const confirmStory = async (
    storyId: string,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setIsLoading(true)
    try {
      await api.post<null>(`segments/${storyId}`).json()
      onSuccess?.()
    } catch (e) {
      const error = e as HTTPError | Error
      onError?.(error)
      toast.error("failed to confirm")
      return error
    } finally {
      setIsLoading(false)
    }
  }

  return { confirmStory, isLoading }
}

export default useConfirmStory
