import Heading from "./_components/heading"
import { Suspense } from "react"
import VideoGridLoading from "./_components/video-grid-loading"
import Videos from "./_components/videos"

export const dynamic = "force-dynamic"

const VideosPage = async () => {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-30% from-bg-background to-glow/20 fixed -z-10 inset-0" />
      <div className="flex flex-col">
        <Heading />
        <div className="container mx-auto px-4 py-12">
          <Suspense fallback={<VideoGridLoading />}>
            <Videos />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default VideosPage
