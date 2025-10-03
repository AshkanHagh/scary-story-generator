"use client"

import { motion } from "framer-motion"
import { Bone } from "lucide-react"
import { useRouter } from "next/navigation"

const AnimatedButton = () => {
  const router = useRouter()

  const handleClick = () => {
    router.push("/chat")
  }
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.8,
        delay: 2.2,
        type: "spring",
        stiffness: 200
      }}
    >
      <motion.div
        className="rounded-lg"
        animate={{
          boxShadow: [
            "0 0 10px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)",
            "0 0 15px rgba(239, 68, 68, 0.8), 0 0 80px rgba(239, 68, 68, 0.5)",
            "0 0 10px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)"
          ],
          transition: { duration: 1, repeat: Number.POSITIVE_INFINITY }
        }}
      >
        <button
          onClick={handleClick}
          className="bg-primary px-10 py-4 text-xl font-bold text-glow transition-colors hover:bg-primary/90 rounded-lg cursor-pointer flex items-center gap-3 shadow-xl tracking-wider"
        >
          <motion.div
            animate={{ rotate: [0, 5, 0] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1
            }}
          >
            <Bone className="size-6 text-glow" />
          </motion.div>
          <span>Start Free</span>
        </button>
      </motion.div>
    </motion.div>
  )
}
export default AnimatedButton
