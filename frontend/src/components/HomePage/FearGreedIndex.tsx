"use client";
import React from "react";
import { useEffect, useState } from "react";

import axios from "axios";
import { motion } from "framer-motion";
import ClipLoader from "react-spinners/ClipLoader";
import type { FearGreedIndexData } from "../../types";

const FearGreedIndexCard: React.FC = () => {
  const [fearGreedIndex, setFearGreedIndex] =
    useState<FearGreedIndexData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFearGreedIndex = async (): Promise<void> => {
    try {
      const response = await axios.get(
        "https://api.alternative.me/fng/?limit=1&format=json"
      );
      setFearGreedIndex(response.data.data[0]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching Fear & Greed Index:", error);
      setError("Failed to fetch Fear & Greed Index");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFearGreedIndex();
  }, []);

  const getIndexColor = (value: string | undefined): string => {
    if (!value) return "text-gray-500";
    const num = Number.parseInt(value);
    if (num <= 25) return "text-red-500"; // Extreme Fear
    if (num <= 45) return "text-orange-500"; // Fear
    if (num <= 55) return "text-yellow-500"; // Neutral
    if (num <= 75) return "text-teal-500"; // Greed
    return "text-green-500"; // Extreme Greed
  };

  const getBarColor = (value: string | undefined): string => {
    if (!value) return "bg-gray-400";
    const num = Number.parseInt(value);
    if (num <= 25) return "bg-red-500"; // Extreme Fear
    if (num <= 45) return "bg-orange-500"; // Fear
    if (num <= 55) return "bg-yellow-500"; // Neutral
    if (num <= 75) return "bg-teal-500"; // Greed
    return "bg-green-500"; // Extreme Greed
  };

  const getGradientColor = (value: string | undefined): string => {
    if (!value) return "from-gray-400 to-gray-500";
    const num = Number.parseInt(value);
    if (num <= 25) return "from-red-500 to-red-600"; // Extreme Fear
    if (num <= 45) return "from-orange-500 to-orange-600"; // Fear
    if (num <= 55) return "from-yellow-500 to-yellow-600"; // Neutral
    if (num <= 75) return "from-teal-500 to-teal-600"; // Greed
    return "from-green-500 to-green-600"; // Extreme Greed
  };

  const getIndexLabel = (value: string | undefined): string => {
    if (!value) return "Unknown";
    const num = Number.parseInt(value);
    if (num <= 25) return "Extreme Fear";
    if (num <= 45) return "Fear";
    if (num <= 55) return "Neutral";
    if (num <= 75) return "Greed";
    return "Extreme Greed";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="relative w-full bg-white/95 dark:bg-dark-secondary/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-xl font-bold flex items-center">
            <span className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-yellow-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              Fear & Greed Index
            </span>
          </h3>
          {fearGreedIndex?.timestamp && (
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {new Date(fearGreedIndex.timestamp * 1000).toLocaleDateString()}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <ClipLoader color="#10b981" size={40} />
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <p className="text-red-500 mb-2">{error}</p>
              <button
                onClick={fetchFearGreedIndex}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg hover:from-teal-600 hover:to-green-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col py-2">
            {/* Gauge visualization */}
            <div className="relative h-32 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  {/* Background arc */}
                  <path
                    d="M20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="12"
                    className="dark:stroke-gray-700"
                  />

                  {/* Colored arc based on value */}
                  <path
                    d="M20 90 A 80 80 0 0 1 180 90"
                    fill="none"
                    stroke={getBarColor(fearGreedIndex?.value)}
                    strokeWidth="12"
                    strokeDasharray="251"
                    strokeDashoffset={`${
                      251 -
                      (Number.parseInt(fearGreedIndex?.value || "0") / 100) *
                        251
                    }`}
                    className="transition-all duration-1000 ease-out"
                  />

                  {/* Needle */}
                  <g
                    transform={`rotate(${
                      (Number.parseInt(fearGreedIndex?.value || "0") / 100) *
                        180 -
                      90
                    }, 100, 90)`}
                  >
                    <line
                      x1="100"
                      y1="90"
                      x2="100"
                      y2="30"
                      stroke="#374151"
                      strokeWidth="2"
                      className="dark:stroke-white"
                    />
                    <circle
                      cx="100"
                      cy="90"
                      r="5"
                      fill={getBarColor(fearGreedIndex?.value)}
                    />
                  </g>

                  {/* Value text */}
                  <text
                    x="100"
                    y="70"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill={getIndexColor(fearGreedIndex?.value)}
                  >
                    {fearGreedIndex?.value}
                  </text>
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-center mb-4">
              <div
                className={`text-xl font-bold ${getIndexColor(
                  fearGreedIndex?.value
                )}`}
              >
                {getIndexLabel(fearGreedIndex?.value)}
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
              {fearGreedIndex?.value_classification}
            </div>

            <div className="w-full">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getGradientColor(
                    fearGreedIndex?.value
                  )}`}
                  style={{
                    width: `${fearGreedIndex?.value || 0}%`,
                    transition: "width 1s ease-out",
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Extreme Fear</span>
                <span>Extreme Greed</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FearGreedIndexCard;
