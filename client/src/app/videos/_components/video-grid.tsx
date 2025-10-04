"use client"

import { motion } from "framer-motion"
import { VideoCard } from "@/app/videos/_components/video-card"
import { VideoSkeleton } from "@/app/videos/_components/video-skeleton"
import type { Video } from "@/app/videos/_types"

interface VideoGridProps {
  videos: Video[]
  isLoading: boolean
}

export function VideoGrid({ videos, isLoading }: VideoGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  if (isLoading) {
    return (
      <motion.div
        key="skeleton-wrapper"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        {[...Array(8)].map((_, i) => (
          <VideoSkeleton key={i} />
        ))}
      </motion.div>
    )
  }

  if (videos.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center"
      >
        <p className="mb-2 font-sans text-xl font-semibold text-foreground">
          No videos yet
        </p>
        <p className="text-muted-foreground">
          Start creating scary stories to see them here
        </p>
      </motion.div>
    )
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
