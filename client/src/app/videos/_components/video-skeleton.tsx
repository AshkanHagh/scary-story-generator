"use client"

import { motion } from "framer-motion"

export function VideoSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="aspect-video overflow-hidden rounded-lg bg-muted">
        <motion.div
          className="h-full w-full bg-gradient-to-r from-muted via-muted-foreground/10 to-muted"
          animate={{
            x: ["-100%", "100%"]
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear"
          }}
        />
      </div>
      <div className="h-4 w-32 rounded bg-muted" />
    </motion.div>
  )
}
