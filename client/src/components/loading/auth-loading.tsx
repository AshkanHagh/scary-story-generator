import { motion } from "framer-motion"

const AuthLoading = () => {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
    >
      {/* Glow Circle Animation */}
      <div className="relative flex items-center justify-center">
        {[...Array(3)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute block h-10 w-10 rounded-full bg-primary/70 blur-md"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: "auto"
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.8, 0.3, 0.8],
              rotate: [0, 360]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              delay: i * 0.25,
              ease: "easeInOut"
            }}
          />
        ))}
        <motion.div
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: "linear"
          }}
        >
          <motion.div
            className="h-3 w-3 rounded-full bg-background"
            animate={{
              scale: [1, 0.7, 1],
              opacity: [1, 0.5, 1]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}
export default AuthLoading
