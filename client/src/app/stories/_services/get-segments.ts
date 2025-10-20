import { serverApi } from "@/api/serverInstance"
import { Segment } from "../_types"

const getSegments = async (storyId: string): Promise<Segment[]> => {
  try {
    const response = await serverApi
      .get<Segment[]>(`segments/${storyId}`)
      .json()
    return response
  } catch (error) {
    console.log(error)
    throw new Error("Something wrong")
  }
}
export default getSegments
