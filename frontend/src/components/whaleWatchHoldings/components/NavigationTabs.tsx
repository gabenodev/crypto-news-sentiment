"use client"

import type React from "react"
import { FiHome, FiPieChart, FiActivity } from "react-icons/fi"
import type { NavigationTabsProps } from "../types"

const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, setActiveTab, className = "" }) => {
  return (
    <nav className={`${className}`}>
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${
              activeTab === "overview"
                ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500 dark:border-teal-400"
                : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
            }`}
          >
            <FiHome
              className={`mr-2 ${activeTab === "overview" ? "text-teal-600 dark:text-teal-400" : ""}`}
              size={16}
            />
            Overview
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("holdings")}
            className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${
              activeTab === "holdings"
                ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500 dark:border-teal-400"
                : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
            }`}
          >
            <FiPieChart
              className={`mr-2 ${activeTab === "holdings" ? "text-teal-600 dark:text-teal-400" : ""}`}
              size={16}
            />
            Holdings
          </button>
        </li>
        <li>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`w-full flex items-center px-3 py-2 rounded-lg transition-all ${
              activeTab === "transactions"
                ? "bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300 border-l-2 border-teal-500 dark:border-teal-400"
                : "text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-tertiary hover:text-gray-900 dark:hover:text-dark-text-primary"
            }`}
          >
            <FiActivity
              className={`mr-2 ${activeTab === "transactions" ? "text-teal-600 dark:text-teal-400" : ""}`}
              size={16}
            />
            Transactions
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default NavigationTabs
