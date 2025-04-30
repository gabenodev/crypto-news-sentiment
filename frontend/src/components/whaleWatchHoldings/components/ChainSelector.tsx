"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { FiGlobe, FiChevronDown, FiCheck } from "react-icons/fi"
import type { ChainSelectorProps } from "../types"

const ChainSelector: React.FC<ChainSelectorProps> = ({
  selectedChain,
  availableChains,
  onChainChange,
  className = "",
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get the currently selected chain
  const selectedChainData = availableChains.find((chain) => chain.id === selectedChain) || availableChains[0]

  // Handle clicks outside of dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle chain selection
  const handleChainChange = (chainId: number) => {
    if (chainId !== selectedChain) {
      onChainChange(chainId)
      setDropdownOpen(false)
    }
  }

  return (
    <div
      className={`bg-gray-50 dark:bg-dark-secondary rounded-lg p-2 mb-3 border border-gray-200 dark:border-gray-700 shadow-inner w-full ${className}`}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-500 dark:text-dark-text-secondary flex items-center">
          <FiGlobe className="mr-2 text-teal-500 dark:text-teal-400" size={14} />
          Blockchain
        </span>
      </div>

      {/* Custom dropdown */}
      <div className="relative mt-2" ref={dropdownRef}>
        {/* Dropdown trigger button */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-md bg-white dark:bg-dark-tertiary border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-dark-text-primary hover:bg-gray-50 dark:hover:bg-dark-tertiary/80 transition-colors"
        >
          <div className="flex items-center">
            <div
              className="flex items-center justify-center w-6 h-6 rounded-full mr-2"
              style={{ backgroundColor: `${selectedChainData.color}20` }}
            >
              <span className="text-sm font-medium" style={{ color: selectedChainData.color }}>
                {selectedChainData.icon}
              </span>
            </div>
            <span className="font-medium">{selectedChainData.name}</span>
          </div>
          <FiChevronDown
            className={`transition-transform duration-200 ${dropdownOpen ? "transform rotate-180" : ""}`}
            size={16}
          />
        </button>

        {/* Dropdown menu */}
        {dropdownOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-tertiary rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 max-h-60 overflow-auto">
            {availableChains.map((chain) => (
              <button
                key={chain.id}
                onClick={() => handleChainChange(chain.id)}
                className={`
                  w-full flex items-center px-3 py-2 text-sm
                  ${
                    selectedChain === chain.id
                      ? "bg-gray-100 dark:bg-dark-secondary text-teal-600 dark:text-teal-400"
                      : "hover:bg-gray-50 dark:hover:bg-dark-secondary/50 text-gray-700 dark:text-dark-text-primary"
                  }
                `}
              >
                <div
                  className="flex items-center justify-center w-6 h-6 rounded-full mr-2"
                  style={{ backgroundColor: `${chain.color}20` }}
                >
                  <span className="text-sm font-medium" style={{ color: chain.color }}>
                    {chain.icon}
                  </span>
                </div>
                <span className="flex-grow text-left">{chain.name}</span>
                {selectedChain === chain.id && <FiCheck className="text-teal-500 dark:text-teal-400" size={16} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChainSelector
