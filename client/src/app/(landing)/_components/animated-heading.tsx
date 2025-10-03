"use client"

import { motion, spring } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
}

const letterVariants = {
  hidden: { opacity: 0, y: 50, rotateX: -90 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { type: spring, damping: 12, stiffness: 200 }
  }
}

type AnimatedHeadingProps = {
  title: string
  subtitle: string
  smallText: string
  description: string
}

const AnimatedHeading = ({
  title,
  subtitle,
  smallText,
  description
}: AnimatedHeadingProps) => {
  return (
    <div className="flex flex-col items-center gap-8 px-4 text-center">
      {/* Animated Title */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-wrap justify-center gap-x-4"
      >
        {title.split(" ").map((word, wordIndex) => (
          <div key={wordIndex} className="flex">
            {word.split("").map((letter, letterIndex) => (
              <motion.span
                key={letterIndex}
                variants={letterVariants}
                className="text-5xl font-bold leading-tight text-foreground md:text-7xl lg:text-8xl"
                whileHover={{
                  scale: 1.2,
                  color: "rgb(239, 68, 68)",
                  transition: { duration: 0.2 }
                }}
              >
                {letter}
              </motion.span>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Animated Subtitle */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        transition={{
          duration: 1.2,
          delay: 0.8,
          type: "spring",
          stiffness: 100
        }}
        className="relative"
      >
        <motion.h2
          className="glow-text text-balance text-4xl font-bold text-primary md:text-6xl lg:text-7xl"
          animate={{
            textShadow: [
              "0 0 10px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)",
              "0 0 15px rgba(239, 68, 68, 0.8), 0 0 80px rgba(239, 68, 68, 0.5)",
              "0 0 10px rgba(239, 68, 68, 0.5), 0 0 40px rgba(239, 68, 68, 0.3)"
            ]
          }}
          transition={{
            duration: 3.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        >
          {subtitle.split("").map((letter, index) => (
            <motion.span
              key={index}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.05,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.h2>
      </motion.div>

      {/* Small Text */}
      <motion.div
        initial={{ opacity: 0, rotateX: -180 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{ duration: 1, delay: 1.5, type: "spring" }}
      >
        <motion.p
          className="text-balance text-xl text-muted-foreground md:text-2xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut"
          }}
        >
          {smallText}
        </motion.p>
      </motion.div>

      {/* Description */}
      {description && (
        <motion.p
          className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl"
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.5, delay: 1.8 }}
        >
          {description}
        </motion.p>
      )}
    </div>
  )
}

export default AnimatedHeading
