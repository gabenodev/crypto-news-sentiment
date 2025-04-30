"use client"
import { useState } from "react"
import { Link } from "react-router-dom"
import { ClipLoader } from "react-spinners"
import { motion, AnimatePresence } from "framer-motion"
import useTopMovers from "../../hooks/homepage/useTopMovers"
import type { Cryptocurrency } from "../../types"

function TopMovers(): JSX.Element {
  const { topMovers, topLosers, loading } = useTopMovers()
  const [showTopMovers, setShowTopMovers] = useState<boolean>(true)

  const formatPrice = (price: number | undefined): string => {
    if (!price) return "Loading..."
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: price < 1 ? 6 : 2,
      maximumFractionDigits: price < 1 ? 8 : 2,
    }).format(price)
  }

  const toggleView = (): void => {
    setShowTopMovers(!showTopMovers)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <div className="relative w-full h-full bg-white/95 dark:bg-dark-secondary/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold flex items-center">
            <span className="mr-2">
              {showTopMovers ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-emerald-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-rose-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              {showTopMovers ? "Top Gainers" : "Top Losers"}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-1">(24h)</span>
          </h3>

          <button
            onClick={toggleView}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label={showTopMovers ? "Show losers" : "Show gainers"}
          >
            {showTopMovers ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            )}
          </button>
        </div>

        <div className="flex-1 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <ClipLoader color="#10b981" size={40} />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={showTopMovers ? "gainers" : "losers"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-7"
              >
                {(showTopMovers ? topMovers : topLosers).map((coin: Cryptocurrency, index: number) => {
                  if (!coin) return null
                  return (
                    <motion.div
                      key={coin.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{
                        backgroundColor: "rgba(16, 185, 129, 0.05)",
                      }}
                    >
                      <Link
                        to={`/currencies/${coin.id}`}
                        className={`flex items-center justify-between p-2 rounded-xl border ${
                          coin.price_change_percentage_24h >= 0
                            ? "bg-emerald-50/70 hover:bg-emerald-100/50 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-700/30"
                            : "bg-rose-50/70 hover:bg-rose-100/50 dark:bg-rose-900/10 dark:hover:bg-rose-900/20 border-rose-200/50 dark:border-rose-700/30"
                        } transition-colors group`}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="relative flex-shrink-0 mr-2">
                            <img
                              src={coin.image || "/placeholder.svg"}
                              alt={coin.name}
                              className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg"
                              }}
                            />
                          </div>
                          <div className="min-w-0 flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-dark-text-primary group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate text-base">
                              {coin.name}
                            </span>
                            <span className="text-sm text-teal-500 dark:text-teal-400 font-medium">
                              {coin.symbol.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 text-right min-w-[90px]">
                          <span className="block font-semibold text-gray-800 dark:text-gray-100 text-base">
                            {formatPrice(coin.current_price)}
                          </span>
                          <span
                            className={`block text-sm font-medium ${
                              coin.price_change_percentage_24h >= 0 ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {coin.price_change_percentage_24h >= 0 ? "+" : ""}
                            {coin.price_change_percentage_24h.toFixed(2)}%
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default TopMovers
