"use client"

import { motion } from "framer-motion"
import { VideoSkeleton } from "./video-skeleton"

const VideoGridLoading = () => {
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

export default VideoGridLoading
