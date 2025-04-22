"use client";
import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchSentimentData } from "../../utils/API/sentimentAPI";

const SentimentSummary = () => {
  const [sentimentValue, setSentimentValue] = useState<number>(50);
  const [sentimentLabel, setSentimentLabel] = useState<string>("Neutral");
  const [sentimentColor, setSentimentColor] = useState<string>("#facc15"); // Yellow
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sentimentHistory, setSentimentHistory] = useState<number[]>([]);

  useEffect(() => {
    const getSentimentData = async () => {
      try {
        setLoading(true);
        const { sentimentScores } = await fetchSentimentData(7); // Last 7 days

        if (sentimentScores && sentimentScores.length > 0) {
          const currentSentiment = sentimentScores[sentimentScores.length - 1];
          setSentimentValue(currentSentiment);
          setSentimentHistory(sentimentScores);

          // Set label and color based on sentiment value
          if (currentSentiment <= 25) {
            setSentimentLabel("Extreme Fear");
            setSentimentColor("#ef4444"); // Red
          } else if (currentSentiment <= 45) {
            setSentimentLabel("Fear");
            setSentimentColor("#f59e0b"); // Amber
          } else if (currentSentiment <= 55) {
            setSentimentLabel("Neutral");
            setSentimentColor("#facc15"); // Yellow
          } else if (currentSentiment <= 75) {
            setSentimentLabel("Greed");
            setSentimentColor("#10b981"); // Emerald
          } else {
            setSentimentLabel("Extreme Greed");
            setSentimentColor("#10b981"); // Emerald
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
        setError("Failed to load sentiment data");
        setLoading(false);
      }
    };

    getSentimentData();
  }, []);

  // Fallback data in case of error
  if (error && sentimentHistory.length === 0) {
    setSentimentHistory([25, 30, 45, 52, 58, 62, 55]);
    setSentimentValue(55);
    setSentimentLabel("Neutral");
    setSentimentColor("#facc15");
  }

  return (
    <div className="bg-white/95 dark:bg-dark-secondary/95 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 p-5 h-full">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-xl font-bold">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
            Market Sentiment
          </span>
        </h3>
        <a
          href="/sentiment-trend"
          className="text-sm font-medium text-teal-500 hover:text-teal-600 dark:text-teal-400 dark:hover:text-teal-300"
        >
          Full analysis
        </a>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[300px]">
          <div className="w-16 h-16 border-4 border-t-teal-500 border-teal-200 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Loading sentiment data...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Sentiment Gauge */}
          <div className="relative w-48 h-48 mb-4">
            <svg viewBox="0 0 100 50" className="w-full">
              {/* Background arc */}
              <path
                d="M5,50 A45,45 0 0,1 95,50"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Colored arc based on sentiment value */}
              <path
                d={`M5,50 A45,45 0 0,1 ${5 + (sentimentValue / 100) * 90},${
                  50 - Math.sin((sentimentValue / 100) * Math.PI) * 45
                }`}
                fill="none"
                stroke={sentimentColor}
                strokeWidth="10"
                strokeLinecap="round"
              />

              {/* Needle */}
              <line
                x1="50"
                y1="50"
                x2={
                  50 +
                  Math.cos((sentimentValue / 100) * Math.PI - Math.PI / 2) * 35
                }
                y2={
                  50 +
                  Math.sin((sentimentValue / 100) * Math.PI - Math.PI / 2) * 35
                }
                stroke="#374151"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Center circle */}
              <circle cx="50" cy="50" r="5" fill="#374151" />
            </svg>

            {/* Value and label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {sentimentValue}
              </span>
              <span
                className="text-sm font-medium mt-1"
                style={{ color: sentimentColor }}
              >
                {sentimentLabel}
              </span>
            </div>
          </div>

          {/* 7-day trend */}
          <div className="w-full mt-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              7-Day Trend
            </h4>
            <div className="flex items-end justify-between h-20 gap-1">
              {sentimentHistory.map((value, index) => {
                // Determine color based on value
                let barColor;
                if (value <= 25) barColor = "#ef4444";
                else if (value <= 45) barColor = "#f59e0b";
                else if (value <= 55) barColor = "#facc15";
                else if (value <= 75) barColor = "#10b981";
                else barColor = "#10b981";

                return (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / 100) * 100}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex-1 rounded-t"
                    style={{ backgroundColor: barColor }}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                7 days ago
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Today
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Extreme Fear (0-25)
              </span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Fear (26-45)
              </span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Neutral (46-55)
              </span>
            </div>
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Greed (56-100)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentSummary;
