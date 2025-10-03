"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Ghost, Skull, Moon, Eye, Zap } from "lucide-react"
import { useEffect, useState } from "react"

type BackgroundEffectsProps = {
  children: React.ReactNode
}

const BackgroundEffects = ({ children }: BackgroundEffectsProps) => {
  const [bubbles, setBubbles] = useState([])

  // Avoiding hydration mismatches
  useEffect(() => {
    setBubbles(Array.from({ length: 12 }))
  }, [])

  return (
    <div className="relative z-0 flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
      <motion.div
        className="absolute -z-10 inset-0 opacity-30"
        animate={{
          background: [
            "radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 80%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 50%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)"
          ]
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
      />

      {/* Icons */}
      <FloatingIcons />

      {children}

      {/* Bubbles */}
      {bubbles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute -z-10 rounded-full bg-primary/30 size-1"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -150 - Math.random() * 100, 0],
            x: [0, (Math.random() - 0.5) * 100, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Icons component
const FloatingIcons = () => {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 300], [0, 100])
  const y2 = useTransform(scrollY, [0, 300], [0, -100])

  return (
    <>
      {/* Layer 1 */}
      <motion.div
        className="absolute -z-10 inset-0 opacity-20"
        style={{ y: y1 }}
      >
        <motion.div
          className="absolute -z-10 top-20 left-20"
          animate={{ y: [0, -30, 0], rotate: [0, 360], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Ghost className="h-16 w-16 text-primary" />
        </motion.div>

        <motion.div
          className="absolute -z-10 top-1/4 right-20"
          animate={{ rotate: [0, 180, 360], scale: [1, 1.3, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Eye className="h-20 w-20 text-primary" />
        </motion.div>
      </motion.div>

      {/* Layer 2 */}
      <motion.div
        className="absolute -z-10 inset-0 opacity-20"
        style={{ y: y2 }}
      >
        <motion.div
          className="absolute -z-10 bottom-1/4 left-1/4"
          animate={{ y: [0, 40, 0], rotate: [0, -15, 0], scale: [1, 0.8, 1] }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Skull className="h-24 w-24 text-primary" />
        </motion.div>

        <motion.div
          className="absolute -z-10 top-1/3 right-1/3"
          animate={{ rotate: [0, -360], scale: [1, 1.5, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Moon className="h-20 w-20 text-primary" />
        </motion.div>

        <motion.div
          className="absolute -z-10 bottom-20 right-20"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <Zap className="h-16 w-16 text-primary" />
        </motion.div>
      </motion.div>
    </>
  )
}

export default BackgroundEffects
