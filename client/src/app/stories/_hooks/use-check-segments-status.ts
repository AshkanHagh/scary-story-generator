import api from "@/api/instance"
import { HTTPError, KyRequest, KyResponse, Options } from "ky"
import { StorySegmentsResponse } from "../_types"

// Callback type definitions
type OnSuccess = (data: StorySegmentsResponse) => void
type OnError = (error: HTTPError | Error) => void

const useCheckSegmentsStatus = () => {
  const checkSegmentsStatus = async (
    id: string,
    onInitialSuccess?: OnSuccess,
    onIncomplete?: OnSuccess,
    onError?: OnError
  ) => {
    // Ky hook that runs after each response
    const afterResponse = async (
      request: KyRequest,
      options: Options,
      response: KyResponse
    ) => {
      const data = await response.json<StorySegmentsResponse>()

      // If the story is not completed, trigger callback and retry request
      if (!data.isCompleted) {
        onIncomplete?.(data)
        return api(request, options)
      }
    }

    try {
      const response = await api
        .get<StorySegmentsResponse>(`segments/${id}/status`, {
          hooks: {
            afterResponse: [afterResponse]
          },
          retry: { limit: 3 }
        })
        .json()

      onInitialSuccess?.(response)
    } catch (e) {
      const error = e as HTTPError | Error
      onError?.(error)
    }
  }

  return { checkSegmentsStatus }
}

export default useCheckSegmentsStatus
