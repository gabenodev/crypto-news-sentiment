"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
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
        const { sentimentScores } = await fetchSentimentData(7);

        if (sentimentScores && sentimentScores.length > 0) {
          const currentSentiment = sentimentScores[sentimentScores.length - 1];
          setSentimentValue(currentSentiment);
          setSentimentHistory(sentimentScores);

          if (currentSentiment <= 25) {
            setSentimentLabel("Extreme Fear");
            setSentimentColor("#ef4444");
          } else if (currentSentiment <= 45) {
            setSentimentLabel("Fear");
            setSentimentColor("#f59e0b");
          } else if (currentSentiment <= 55) {
            setSentimentLabel("Neutral");
            setSentimentColor("#facc15");
          } else if (currentSentiment <= 75) {
            setSentimentLabel("Greed");
            setSentimentColor("#10b981");
          } else {
            setSentimentLabel("Extreme Greed");
            setSentimentColor("#10b981");
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

  useEffect(() => {
    if (error && sentimentHistory.length === 0) {
      setSentimentHistory([25, 30, 45, 52, 58, 62, 55]);
      setSentimentValue(55);
      setSentimentLabel("Neutral");
      setSentimentColor("#facc15");
    }
  }, [error, sentimentHistory]);

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
          <div className="w-40 h-40 mb-2">
            <CircularProgressbar
              value={sentimentValue}
              maxValue={100}
              text={`${sentimentValue}`}
              styles={buildStyles({
                pathColor: sentimentColor,
                trailColor: "#e5e7eb",
                textColor: sentimentColor,
                textSize: "24px",
                strokeLinecap: "round",
              })}
            />
          </div>
          <span
            className="text-sm font-medium mt-1"
            style={{ color: sentimentColor }}
          >
            {sentimentLabel}
          </span>

          <div className="w-full mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              7-Day Trend
            </h4>
            <div className="flex items-end justify-between h-20 gap-1">
              {sentimentHistory.map((value, index) => {
                let barColor = "#10b981";
                if (value <= 25) barColor = "#ef4444";
                else if (value <= 45) barColor = "#f59e0b";
                else if (value <= 55) barColor = "#facc15";

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
