"use client"

import { motion } from "framer-motion"
import { VideoCard } from "@/app/videos/_components/video-card"
import { VideoSkeleton } from "@/app/videos/_components/video-skeleton"
import type { Video } from "@/app/videos/_types"
import Button from "@/components/ui/button"
import { useEffect, useState } from "react"
import GenerateStoryFormModal from "@/components/generate-story/generate-story-form-modal"
import { Sparkles } from "lucide-react"
import { CANCELLED } from "node:dns/promises"
import { getPendingVideo } from "../_utils"
import useCheckVideosStatus from "../_hooks/use-check-video-status"
import { toast } from "sonner"

interface VideoGridProps {
  initVideos: Video[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export function VideoGrid({ initVideos }: VideoGridProps) {
  const [videos, setVideos] = useState<Video[]>(initVideos)
  const { checkVideoStatus } = useCheckVideosStatus()

  useEffect(() => {
    const handleCheckVideoSuccess = (data: Video) => {
      setVideos((prev) =>
        prev.map((video) => (video.id === data.id ? data : video))
      )
    }
    const pendingVideo = getPendingVideo(videos)
    if (pendingVideo) {
      checkVideoStatus(pendingVideo.id, handleCheckVideoSuccess, () =>
        toast.error("Something went Wrong")
      )
    }
  }, [])
  if (videos.length === 0) {
    return <NoVideos />
  }

  return (
    <motion.div
      key="video-cards-wrapper"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {videos.map((video, index) => (
        <VideoCard key={video.id} video={video} index={index} />
      ))}
    </motion.div>
  )
}

// When User Doesn’t Have Any Videos
const NoVideos = () => {
  const [open, setOpen] = useState<boolean>(false)

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center"
      >
        <p className="mb-2 font-sans text-3xl font-semibold text-foreground">
          No videos yet
        </p>
        <p className="text-muted-foreground text-lg">
          Start creating scary stories to see them here
        </p>
        <Button
          size="lg"
          className="mt-5 flex gap-2"
          onClick={() => setOpen(true)}
        >
          <Sparkles />
          Generate Story
        </Button>
      </motion.div>
      <GenerateStoryFormModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
