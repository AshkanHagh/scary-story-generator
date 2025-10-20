"use client"

import Button from "@/components/ui/button"
import { motion } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"

const StorySegmentsError = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-card border border-destructive/30 rounded-lg p-6 text-center space-y-4"
      >
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-semibold text-foreground">
          Error Loading Videos
        </h2>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="mr-2" size={16} />
          Try Again
        </Button>
      </motion.div>
    </div>
  )
}
export default StorySegmentsError
