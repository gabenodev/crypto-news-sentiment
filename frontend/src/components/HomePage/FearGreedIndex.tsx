"use client";

import * as React from "react";
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
    if (num <= 25) return "text-teal-400"; // Extreme Fear
    if (num <= 45) return "text-teal-400"; // Fear
    if (num <= 55) return "text-gray-500"; // Neutral
    if (num <= 75) return "text-green-500"; // Greed
    return "text-green-500"; // Extreme Greed
  };

  const getBarColor = (value: string | undefined): string => {
    if (!value) return "bg-gray-400";
    const num = Number.parseInt(value);
    if (num <= 25) return "bg-teal-400"; // Extreme Fear
    if (num <= 45) return "bg-teal-400"; // Fear
    if (num <= 55) return "bg-gray-400"; // Neutral
    if (num <= 75) return "bg-green-500"; // Greed
    return "bg-green-500"; // Extreme Greed
  };

  const getIndexLabel = (value: string | undefined): string => {
    if (!value) return "Unknown";
    const num = Number.parseInt(value);
    if (num <= 25) return "Extrem Fear";
    if (num <= 45) return "Fear";
    if (num <= 55) return "Neutral";
    if (num <= 75) return "Greed";
    return "Extrem Greed";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg h-full">
          <div className="relative w-full bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm h-full">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                  Fear & Greed Index
                </span>
              </h3>
              {fearGreedIndex?.timestamp && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {new Date(
                    fearGreedIndex.timestamp * 1000
                  ).toLocaleDateString()}
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
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col py-2">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`text-3xl font-bold ${getIndexColor(
                      fearGreedIndex?.value
                    )}`}
                  >
                    {fearGreedIndex?.value}
                  </div>
                  <div
                    className={`text-xl font-semibold ${getIndexColor(
                      fearGreedIndex?.value
                    )}`}
                  >
                    {getIndexLabel(fearGreedIndex?.value)}
                  </div>
                </div>

                <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
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
                      className={`h-full ${getBarColor(fearGreedIndex?.value)}`}
                      style={{ width: `${fearGreedIndex?.value || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Extrem Fear</span>
                    <span>Extrem Greed</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default FearGreedIndexCard;
