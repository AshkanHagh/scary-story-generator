"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import type { Segment } from "@/app/stories/_types"

interface SegmentCardProps {
  segment: Segment
  index: number
}

const SegmentCard = ({ segment, index }: SegmentCardProps) => {
  const getStatusColor = (status: Segment["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusText = (status: Segment["status"]) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "pending":
        return "Processing..."
      case "failed":
        return "Error"
      default:
        return "Unknown"
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-card border border-border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
      role="article"
      aria-label={`Segment ${segment.order}`}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-video bg-muted">
        {segment.status === "pending" ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear"
              }}
              aria-label="Loading"
            />
          </div>
        ) : segment.imageUrl ? (
          <Image
            src={segment.imageUrl}
            alt={`Segment ${segment.order} illustration`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            No image available
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header with Order and Status */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold tracking-wider text-foreground">
            Segment {segment.order}
          </h3>
          <span
            className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(segment.status)}`}
            role="status"
            aria-live="polite"
          >
            {getStatusText(segment.status)}
          </span>
        </div>

        {/* Story Text */}
        {segment.text && (
          <p className="text-sm text-foreground/80 leading-relaxed tracking-wide">
            {segment.text}
          </p>
        )}
      </div>
    </motion.article>
  )
}

export default SegmentCard
