// src/components/SentimentChart.js
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Înregistrăm componentele Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const sentimentData = {
  labels: ["1h", "4h", "12h", "24h", "7d"], // Etichete pentru intervalele de timp
  datasets: [
    {
      label: "Sentiment Trend",
      data: [70, 65, 60, 55, 50], // Exemplu de valori de sentiment (poți să le actualizezi cu date reale)
      fill: false,
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
    },
  ],
};

function SentimentChart() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-semibold text-gray-800">Market Sentiment</h2>
      <div className="mt-6">
        <Line data={sentimentData} />
      </div>
    </section>
  );
}
s;
asdasexport default SentimentChart;
