"use client"

import { VideoGrid } from "@/app/videos/_components/video-grid"
import Heading from "./_components/heading"
import useGetVideos from "./_hooks/use-get-videos"

const VideosPage = () => {
  const { data, isLoading } = useGetVideos()

  return (
    <div className="min-h-screen bg-gradient-to-br from-30% from-bg-background to-glow/20 flex flex-col">
      <Heading />
      <div className="container mx-auto px-4 py-12">
        <VideoGrid videos={data} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default VideosPage
