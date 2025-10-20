"use client"
import { motion } from "framer-motion"

const Heading = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="text-center"
    >
      <h1 className="mb-4 mt-10 font-sans text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
        Your Scary Stories
      </h1>
      <p className="text-balance font-sans text-lg text-muted-foreground md:text-xl">
        Watch your AI-generated horror tales come to life
      </p>
    </motion.div>
  )
}
export default Heading
