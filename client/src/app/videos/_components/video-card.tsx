"use client"

import type React from "react"

import { useState } from "react"
import { motion, spring, useAnimationControls } from "framer-motion"
import { Play, Loader2 } from "lucide-react"
import { VideoPlayerModal } from "@/app/videos/_components/video-player-modal"
import type { Video } from "@/app/videos/_types"

interface VideoCardProps {
  video: Video
  index: number
}

export function VideoCard({ video, index }: VideoCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isCompleted = video.status === "completed"
  const playIconControl = useAnimationControls()

  const cardVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: spring,
        stiffness: 100,
        damping: 15
      }
    }
  }

  const handleClick = () => {
    if (isCompleted) {
      setIsModalOpen(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isCompleted && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault()
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <motion.div
        variants={cardVariants}
        whileHover={isCompleted ? { scale: 1.05, y: -8 } : {}}
        onHoverStart={() => playIconControl.start({ scale: 1 })}
        onHoverEnd={() => playIconControl.start({ scale: 0.8 })}
        whileTap={isCompleted ? { scale: 0.98 } : {}}
        className="group relative"
      >
        <div
          role={isCompleted ? "button" : "article"}
          tabIndex={isCompleted ? 0 : -1}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-label={
            isCompleted
              ? `Play video ${video.id}`
              : `Video ${video.id} is processing`
          }
          className={`relative aspect-video overflow-hidden rounded-lg bg-card shadow-lg transition-shadow duration-300 ${
            isCompleted ? "cursor-pointer hover:shadow-2xl" : "cursor-default"
          }`}
        >
          {/* Thumbnail/Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50">
            {!isCompleted && (
              <div className="flex h-full w-full items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear"
                  }}
                >
                  <Loader2 className="h-12 w-12 text-muted-foreground" />
                </motion.div>
              </div>
            )}
          </div>

          {/* Overlay */}
          {isCompleted && (
            <motion.div className="absolute inset-0 flex items-center justify-center transition-opacity">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={playIconControl}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex size-16 items-center justify-center rounded-full bg-primary shadow-lg"
              >
                <Play className="size-8 fill-primary-foreground text-primary-foreground" />
              </motion.div>
            </motion.div>
          )}

          {/* Status Badge */}
          {!isCompleted && (
            <div className="absolute right-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground shadow-md">
              Processing...
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="mt-3 px-1">
          <p className="text-sm text-muted-foreground">
            {new Date(video.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>
        </div>
      </motion.div>

      {isCompleted && (
        <VideoPlayerModal
          url={video.url}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
