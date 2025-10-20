import { serverApi } from "@/api/serverInstance"
import { Video } from "../_types"

const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await serverApi.get<Video[]>("videos").json()
    return response
  } catch (error) {
    console.log(error)
    throw new Error("Something wrong")
  }
}
export default getVideos
