"use client"

import { motion, AnimatePresence } from "framer-motion"
import useAuth from "@/hooks/use-auth"
import AuthLoading from "../loading/auth-loading"

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading } = useAuth()

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <AuthLoading />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default AuthLayout
