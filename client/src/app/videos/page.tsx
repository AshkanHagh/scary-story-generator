"use client"

import { useState, useEffect } from "react"
import { VideoGrid } from "@/app/videos/_components/video-grid"
import { motion } from "framer-motion"
import type { Video } from "@/app/videos/_types"
import Heading from "./_components/heading"

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch - replace with actual API call
    const fetchVideos = async () => {
      try {
        // Mock data for demonstration
        const mockVideos: Video[] = [
          {
            id: "3d8f3e92-0758-4ec4-a65d-20205200fce8",
            status: "completed",
            url: "http://localhost:9000/scary-story-generator/3d8f3e92-0758-4ec4-a65d-20205200fce8",
            createdAt: "2025-10-03T09:43:33.879Z",
            storyId: "ea599ac8-bbb3-42be-aa70-76a30d75fbb9",
            userId: "cc3bfb13-37f4-4b45-8710-dfc5eaffe337"
          },
          {
            id: "4e9g4f03-1869-5fd5-b76e-31316311gdf9",
            status: "processing",
            url: "",
            createdAt: "2025-10-03T10:15:22.123Z",
            storyId: "fb6aabcd-ccc4-53cf-bb81-87b41e86fcc8",
            userId: "cc3bfb13-37f4-4b45-8710-dfc5eaffe337"
          },
          {
            id: "5f0h5g14-2970-6ge6-c87f-42427422heg0",
            status: "completed",
            url: "http://localhost:9000/scary-story-generator/5f0h5g14-2970-6ge6-c87f-42427422heg0",
            createdAt: "2025-10-03T08:30:15.456Z",
            storyId: "gc7bbcde-ddd5-64dg-cc92-98c52f97gdd9",
            userId: "cc3bfb13-37f4-4b45-8710-dfc5eaffe337"
          }
        ]

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setVideos(mockVideos)
      } catch (error) {
        console.error("[v0] Error fetching videos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVideos()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-30% from-bg-background to-glow/20 flex flex-col">
      <Heading />
      <div className="container mx-auto px-4 py-12">
        <VideoGrid videos={videos} isLoading={isLoading} />
      </div>
    </div>
  )
}
