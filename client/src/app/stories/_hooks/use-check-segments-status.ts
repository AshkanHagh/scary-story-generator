import { api } from "@/api/instance"
import { HTTPError, KyRequest, KyResponse, Options } from "ky"
import { SegmentsStatusResponse } from "../_types"

// Callback type definitions
type OnSuccess = (data: SegmentsStatusResponse) => void
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
      const data = await response.json<SegmentsStatusResponse>()

      // If the story is not completed, trigger callback and retry request
      if (!data.isCompleted) {
        onIncomplete?.(data)
        return api(request, options)
      }
    }

    try {
      const response = await api
        .get<SegmentsStatusResponse>(`segments/${id}/status`, {
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
