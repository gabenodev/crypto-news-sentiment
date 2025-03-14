import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const SentimentGauge = ({ value }) => {
  // Culorile de la roșu (frică) la verde (lăcomie)
  const getColor = (score) => {
    if (score <= 25) return "#ff4d4d"; // Frică extremă - roșu
    if (score <= 50) return "#ffa500"; // Frică - portocaliu
    if (score <= 75) return "#f0e68c"; // Neutru - galben
    return "#23d996"; // Lăcomie - verde
  };

  return (
    <div className="flex flex-col items-center mt-6">
      <div className="w-48 h-48 relative">
        <CircularProgressbar
          value={value}
          text={""}
          styles={buildStyles({
            textColor: "currentColor", // Folosim `currentColor` pentru a moșteni din `div`
            pathColor: getColor(value),
            trailColor: "#2d2d2d",
            textSize: "24px",
            strokeLinecap: "round",
          })}
        />
        {/* Suprascriem textul direct pentru a avea dark mode support */}
        <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-black dark:text-white">
          {value}
        </div>
      </div>
      <p className="mt-2 text-lg font-semibold text-black dark:text-white">
        Fear & Greed Index
      </p>
    </div>
  );
};

export default SentimentGauge;
