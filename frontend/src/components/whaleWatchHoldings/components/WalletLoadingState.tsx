"use client"

import type React from "react"
import { motion } from "framer-motion"
import { FiDatabase, FiDollarSign, FiPieChart } from "react-icons/fi"

interface WalletLoadingStateProps {
  message?: string
  status?: string
}

const WalletLoadingState: React.FC<WalletLoadingStateProps> = ({
  message = "Loading Wallet Data",
  status = "Fetching blockchain data...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl bg-white dark:bg-gray-800 shadow-xl max-w-md mx-auto">
      <div className="relative w-24 h-24 mb-6">
        {/* Background glow effect */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 to-green-500 opacity-70 blur-md"
        />

        {/* Rotating icons */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <FiDatabase className="text-white text-xl absolute" style={{ transform: "translateY(-30px)" }} />
          </motion.div>

          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
            animate={{ rotate: -360 }}
            transition={{
              duration: 12,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <FiDollarSign className="text-white text-xl absolute" style={{ transform: "translate(26px, 15px)" }} />
          </motion.div>

          <motion.div
            className="absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{
              duration: 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <FiPieChart className="text-white text-xl absolute" style={{ transform: "translate(-26px, 15px)" }} />
          </motion.div>
        </div>

        {/* Center wallet icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-green-500 rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white w-6 h-6"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M16 10h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4" />
              <circle cx="16" cy="14" r="2" />
            </svg>
          </div>
        </motion.div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{message}</h2>
      <p className="text-gray-600 dark:text-gray-300 text-center mb-4">{status}</p>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-teal-400 to-green-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      {/* Loading dots */}
      <div className="flex space-x-2 mt-2">
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
          className="w-2 h-2 rounded-full bg-teal-500"
        />
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
          className="w-2 h-2 rounded-full bg-teal-500"
        />
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.6 }}
          className="w-2 h-2 rounded-full bg-teal-500"
        />
      </div>
    </div>
  )
}

export default WalletLoadingState
