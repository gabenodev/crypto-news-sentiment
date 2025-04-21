"use client";

import { FiHelpCircle } from "react-icons/fi";
import type { StatusCardProps } from "../types";
import * as React from "react";

const StatusCard = ({
  seasonStatus,
  enhancedIndex,
  showEnhancedInfo,
  setShowEnhancedInfo,
}: StatusCardProps) => {
  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center">
          <div
            className={`w-12 h-12 rounded-full ${seasonStatus.bgColor} flex items-center justify-center mr-4 shadow-lg`}
          >
            {seasonStatus.icon}
          </div>
          <div>
            <div className="flex items-center">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                Altcoin Season Index
              </h2>
              <button
                onClick={() => setShowEnhancedInfo(!showEnhancedInfo)}
                className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FiHelpCircle size={16} />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {seasonStatus.description}
            </p>
            {seasonStatus.additionalText && (
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-2">
                {seasonStatus.additionalText}
              </p>
            )}
          </div>
        </div>
      </div>

      {showEnhancedInfo && (
        <div className="mt-4 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
          <h3 className="font-bold text-purple-800 dark:text-purple-300 mb-2">
            Altcoin Season Index Explained
          </h3>
          <p className="text-purple-700 dark:text-purple-200 mb-2">
            This index combines multiple market factors to provide a
            comprehensive view of the current market cycle:
          </p>
          <ul className="list-disc list-inside text-purple-700 dark:text-purple-200 space-y-1">
            <li>
              <strong>Altcoin Performance (60%):</strong> Percentage of top
              altcoins outperforming Bitcoin
            </li>
            <li>
              <strong>Bitcoin Dominance (35%):</strong> Lower Bitcoin dominance
              indicates more capital flowing to altcoins
            </li>
            <li>
              <strong>Market Momentum (5%):</strong> General market trend
              direction
            </li>
          </ul>
          <p className="text-purple-700 dark:text-purple-200 mt-2">
            The index ranges from 0-100, with values above 75 indicating Altcoin
            Season and below 25 indicating Bitcoin Season.
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusCard;
