import { motion } from "framer-motion"

const CompletionAnimations = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 pointer-events-none flex items-center justify-center"
    >
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-green-500 rounded-full"
          initial={{
            x: 0,
            y: 0,
            opacity: 1
          }}
          animate={{
            x: Math.random() * 400 - 200,
            y: Math.random() * 400 - 200,
            opacity: 0
          }}
          transition={{
            duration: 2,
            delay: i * 0.05,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  )
}
export default CompletionAnimations
