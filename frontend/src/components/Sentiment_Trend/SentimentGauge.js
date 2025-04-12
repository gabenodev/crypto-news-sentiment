import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const SentimentGauge = ({ value }) => {
  const getColor = (score) => {
    if (score <= 25) return "#ef4444"; // Red for extreme fear
    if (score <= 50) return "#f59e0b"; // Orange for fear
    if (score <= 75) return "#facc15"; // Yellow for neutral
    return "#10b981"; // Green for greed
  };

  const getSentimentLabel = (score) => {
    if (score <= 25) return "Extreme Fear";
    if (score <= 50) return "Fear";
    if (score <= 75) return "Neutral";
    return "Greed";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-48 h-48 relative">
        <CircularProgressbar
          value={value}
          text={""}
          styles={buildStyles({
            pathColor: getColor(value),
            trailColor: "#e5e7eb",
            strokeLinecap: "round",
            pathTransitionDuration: 0.5,
          })}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {value}
          </span>
          <span className="text-sm font-medium mt-1 text-gray-500 dark:text-gray-400">
            {getSentimentLabel(value)}
          </span>
        </div>
      </div>
      <div className="mt-4 flex justify-between w-full max-w-xs">
        {[0, 25, 50, 75, 100].map((mark) => (
          <span
            key={mark}
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {mark}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SentimentGauge;
