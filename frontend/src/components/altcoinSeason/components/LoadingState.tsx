"use client"
import { motion } from "framer-motion"
import { FaRocket } from "react-icons/fa"
import type { LoadingStateProps } from "../types"

const LoadingState = ({ message = "Analyzing Market Data" }: LoadingStateProps) => {
  return (
    <div className="min-h-screen flex justify-center items-center bg-primary dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-xl max-w-md mx-auto">
        <div className="relative w-24 h-24 mb-6">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: {
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
              scale: {
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              },
            }}
            className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-blue-500 opacity-70 blur-md"
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: [0, 360] }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <FaRocket className="text-white text-4xl" />
          </motion.div>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{message}</h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          We're calculating the Altcoin Season Index by comparing performance against Bitcoin...
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-blue-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          />
        </div>
      </div>
    </div>
  )
}

export default LoadingState
