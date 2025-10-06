"use client"

import { motion } from "framer-motion"

type SegmentsStatusProps = {
  completedCount: number
  totalCount: number
  allSegmentsCompleted: boolean
}

const SegmentsStatus = ({
  completedCount,
  totalCount,
  allSegmentsCompleted
}: SegmentsStatusProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Story Segments
          </h1>
          <p className="text-muted-foreground">
            {allSegmentsCompleted
              ? "All segments completed! Ready to finalize your story."
              : `Generating your story... ${completedCount} of ${totalCount} segments completed`}
          </p>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${(completedCount / totalCount) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  )
}
export default SegmentsStatus
