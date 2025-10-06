"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import SegmentCard from "@/app/stories/_components/segment-card"
import { CompleteButton } from "@/app/stories/_components/complete-button"
import { Segment, StorySegmentsResponse } from "../_types"
import CompletionAnimations from "./completion-animation"
import useCheckSegmentsStatus from "../_hooks/use-check-segments-status"
import SegmentsStatus from "./segments-status"
import SegmentsGrid from "./segments-grid"

type SegmentSectionProps = {
  segmentsResponse: StorySegmentsResponse
}

type SegmentsCompletedStatus = {
  totalCount: number
  completedCount: number
}

const SegmentsSection = ({ segmentsResponse }: SegmentSectionProps) => {
  const [segments, setSegments] = useState<Segment[]>(() =>
    sortSegments(segmentsResponse.segments)
  )
  const [allSegmentsCompleted, setAllSegmentsCompleted] = useState(
    segmentsResponse.isCompleted
  )
  const { checkSegmentsStatus } = useCheckSegmentsStatus()
  const { storyId } = useParams()

  useEffect(() => {
    // Mid-polling for check segments status
    checkSegmentsStatus(
      storyId as string,
      (data) => {
        setAllSegmentsCompleted(data.isCompleted)
        setSegments(data.segments)
      },
      (data) => {
        setSegments(data.segments)
      }
    )
  }, [])

  // Sort segments
  function sortSegments(segments: Segment[]) {
    return segments.sort((a, b) => a.order - b.order)
  }

  // Calculate completed count and total count of segments
  const { completedCount, totalCount }: SegmentsCompletedStatus = useMemo(
    () =>
      segments.reduce(
        (acc, segment) => {
          acc.totalCount += 1
          if (segment.status === "completed") {
            acc.completedCount += 1
          }
          return acc
        },
        { totalCount: 0, completedCount: 0 }
      ),
    [segments]
  )

  const isCompleting = completedCount >= totalCount

  return (
    <>
      {/* Background Color */}
      <div className="fixed inset-0 min-h-screen -z-20 bg-gradient-to-br from-30% from-bg-background to-glow/20" />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <SegmentsStatus
          allSegmentsCompleted={allSegmentsCompleted}
          completedCount={completedCount}
          totalCount={totalCount}
        />

        {/* Segments Grid */}
        <main>
          <SegmentsGrid segments={segments} />
        </main>

        {/* Complete Button */}
        {segments.length > 0 && (
          <motion.div className="flex justify-center fixed bottom-0 right-0 left-0 mx-auto py-5">
            <CompleteButton
              isEnabled={allSegmentsCompleted}
              isLoading={isCompleting}
            />
          </motion.div>
        )}

        {/* Completion Animation */}
        <AnimatePresence>
          {allSegmentsCompleted && <CompletionAnimations />}
        </AnimatePresence>
      </div>
    </>
  )
}

export default SegmentsSection
