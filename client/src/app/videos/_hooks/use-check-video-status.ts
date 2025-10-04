import api from "@/api/instance"
import { Video } from "../_types"
import { HTTPError, KyRequest, KyResponse, Options } from "ky"

// Callback type definitions
type OnSuccess = (data: Video) => void
type OnError = (error: HTTPError | Error) => void

const useCheckVideosStatus = () => {
  const checkVideoStatus = async (
    id: string,
    onSuccess?: OnSuccess,
    onError?: OnError
  ) => {
    // Ky hook that runs after each response
    const afterResponse = async (
      request: KyRequest,
      options: Options,
      response: KyResponse
    ) => {
      const data = await response.json<Video>()
      if (data.status === "pending") {
        return api(request, options)
      }
    }

    try {
      const response = await api
        .get<Video>(`videos/${id}/status`, {
          hooks: {
            afterResponse: [afterResponse]
          }
        })
        .json()

      onSuccess?.(response)
    } catch (e) {
      const error = e as HTTPError | Error
      onError?.(error)
    }
  }

  return { checkVideoStatus }
}

export default useCheckVideosStatus
