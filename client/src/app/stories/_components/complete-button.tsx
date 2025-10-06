"use client"

import { motion } from "framer-motion"
import { Check, Sparkles } from "lucide-react"
import Button from "@/components/ui/button"
import { useParams } from "next/navigation"

interface CompleteButtonProps {
  isEnabled: boolean
  isLoading?: boolean
}

export const CompleteButton = ({
  isEnabled,
  isLoading = false
}: CompleteButtonProps) => {
  const { storyId } = useParams()
  const handleClick = async () => {
    console.log(storyId)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: isEnabled ? 1 : 0.5,
        scale: isEnabled ? 1 : 0.95
      }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Button
        onClick={handleClick}
        disabled={!isEnabled || isLoading}
        size="lg"
        className="relative text-primary-foreground hover:bg-primary/100 font-semibold px-8 py-6 text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/5"
        aria-label="Complete story"
      >
        {isLoading ? (
          <motion.div
            className="size-5 border-2 border-white border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear"
            }}
          />
        ) : (
          <>
            <Check className="mr-2" size={20} />
            Complete Story
            {isEnabled && (
              <motion.span
                className="ml-2"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Sparkles size={16} />
              </motion.span>
            )}
          </>
        )}
      </Button>
    </motion.div>
  )
}

export default CompleteButton
