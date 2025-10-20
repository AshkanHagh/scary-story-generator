import { api } from "@/api/instance"
import { GenerateStoryResponse } from "@/types/story"
import { HTTPError } from "ky"
import { useState } from "react"
import { toast } from "sonner"

type GenerateStoryBody = {
  title: string
  script: string
}
type OnSuccess = (data: GenerateStoryResponse) => void
type OnError = (error: HTTPError | Error) => void

const useGenerateStory = () => {
  const [isLoading, setIsLoading] = useState(false)

  const generateStory = async (
    body: GenerateStoryBody,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    setIsLoading(true)
    try {
      const response = await api
        .post<GenerateStoryResponse>("stories", { body: JSON.stringify(body) })
        .json()
      onSuccess?.(response)
      return response
    } catch (e) {
      const error = e as HTTPError | Error
      onError?.(error)
      toast.error("Generate Your story failed")
      return error
    } finally {
      setIsLoading(false)
    }
  }

  return { generateStory, isLoading }
}

export default useGenerateStory
