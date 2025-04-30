"use client"
import { FiSearch, FiX } from "react-icons/fi"
import type { SearchFilterProps } from "../types"

const SearchFilter = ({ searchTerm, setSearchTerm, isFilterOpen, setIsFilterOpen }: SearchFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white">Top Performing Altcoins</h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search coins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchFilter
