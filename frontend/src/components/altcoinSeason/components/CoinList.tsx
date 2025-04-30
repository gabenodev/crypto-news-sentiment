"use client"
import { FiChevronUp, FiChevronDown, FiSearch } from "react-icons/fi"
import type { CoinListProps } from "../types"

const getRowClasses = (index: number, isSelected: boolean) => {
  let baseColor = index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-700/30"

  if (isSelected) {
    baseColor = "bg-teal-50 dark:bg-teal-900/30"
  }

  return `
    grid grid-cols-2 md:grid-cols-5 gap-4 p-4 items-center
    border-l-4 ${isSelected ? "border-teal-500" : "border-transparent"}
    ${baseColor}
    hover:!bg-teal-50/50 dark:hover:!bg-teal-900/20
    transition-colors
  `
}

const CoinList = ({
  filteredAndSortedCoins,
  selectedCoin,
  setSelectedCoin,
  handleSort,
  sortConfig,
  formatMarketCap,
}: CoinListProps) => {
  return (
    <>
      <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-t-lg font-medium text-gray-600 dark:text-gray-300 text-sm">
        <div
          className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          onClick={() => handleSort("rank")}
        >
          Rank
          {sortConfig.key === "rank" &&
            (sortConfig.direction === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
        </div>
        <div
          className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          onClick={() => handleSort("name")}
        >
          Coin
          {sortConfig.key === "name" &&
            (sortConfig.direction === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
        </div>
        <div
          className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          onClick={() => handleSort("priceChange")}
        >
          24h Change
          {sortConfig.key === "priceChange" &&
            (sortConfig.direction === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
        </div>
        <div
          className="flex items-center cursor-pointer hover:text-teal-500 dark:hover:text-teal-400 transition-colors"
          onClick={() => handleSort("marketCap")}
        >
          Market Cap
          {sortConfig.key === "marketCap" &&
            (sortConfig.direction === "asc" ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />)}
        </div>
        <div className="text-right">Action</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-b-lg overflow-hidden">
        {filteredAndSortedCoins.length > 0 ? (
          filteredAndSortedCoins.map((coin, index) => (
            <div key={coin.id} className={getRowClasses(index, selectedCoin?.id === coin.id)}>
              <div className="text-gray-800 dark:text-gray-200 font-medium">#{coin.rank}</div>
              <div className="flex items-center space-x-3 col-span-2 md:col-span-1">
                <img src={coin.image || "/placeholder.svg"} alt={coin.name} className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{coin.name}</div>
                  <div className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                    {coin.symbol.toUpperCase()}
                  </div>
                </div>
              </div>
              <div
                className={`font-medium ${
                  coin.priceChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                }`}
              >
                {coin.priceChange >= 0 ? "+" : ""}
                {coin.priceChange.toFixed(2)}%
              </div>
              <div className="hidden md:block text-gray-700 dark:text-gray-300">{formatMarketCap(coin.marketCap)}</div>
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedCoin(coin)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    selectedCoin?.id === coin.id
                      ? "bg-teal-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-teal-100 dark:hover:bg-teal-900/30"
                  } transition-colors`}
                >
                  {selectedCoin?.id === coin.id ? "Selected" : "View Chart"}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No coins found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              No coins match your search criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </>
  )
}

export default CoinList
