"use client";

import React from "react";
import { FiSearch, FiX } from "react-icons/fi";
import type { FilterBarProps } from "../types";

const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  setFilter,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
      {/* Filter buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-tertiary dark:text-dark-text-secondary dark:hover:bg-dark-tertiary/70"
          }`}
        >
          All Transactions
        </button>
        <button
          onClick={() => setFilter("incoming")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "incoming"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-tertiary dark:text-dark-text-secondary dark:hover:bg-dark-tertiary/70"
          }`}
        >
          Incoming
        </button>
        <button
          onClick={() => setFilter("outgoing")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "outgoing"
              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-tertiary dark:text-dark-text-secondary dark:hover:bg-dark-tertiary/70"
          }`}
        >
          Outgoing
        </button>
      </div>

      {/* Search input */}
      <div className="relative w-full md:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400 dark:text-dark-text-secondary" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search transactions..."
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-dark-tertiary rounded-lg bg-white dark:bg-dark-tertiary text-gray-900 dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-5 w-5 text-gray-400 dark:text-dark-text-secondary hover:text-gray-500 dark:hover:text-dark-text-primary" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
