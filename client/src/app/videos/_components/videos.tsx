import { VideoGrid } from "./video-grid"
import getVideos from "../_services/get-videos"

const Videos = async () => {
  const response = await getVideos()
  return <VideoGrid initVideos={response} />
}

export default Videos
