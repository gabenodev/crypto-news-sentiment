// src/components/SentimentChart.js
import SentimentGauge from "./SentimentGauge";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";
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
import { format } from "date-fns";

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

function SentimentChart() {
  const [sentimentData, setSentimentData] = useState({
    labels: [],
    datasets: [],
  });
  const [timeframe, setTimeframe] = useState("365"); // Default la 7 zile

  const fetchSentimentData = async (limit) => {
    try {
      let url =
        limit === "max"
          ? "https://api.alternative.me/fng/?limit=2000&format=json"
          : `https://api.alternative.me/fng/?limit=${limit}&format=json`;

      const response = await axios.get(url);

      const sentimentScores = response.data.data.map((item) =>
        parseInt(item.value)
      );
      const sentimentTimestamps = response.data.data.map((item) =>
        format(new Date(item.timestamp * 1000), "MMM dd, yyyy")
      );

      setSentimentData({
        labels: sentimentTimestamps.reverse(),
        datasets: [
          {
            label: "Sentiment Trend (Fear & Greed Index)",
            data: sentimentScores.reverse(),
            fill: false,
            borderColor: "#23d996", // Verde pentru linia graficului
            backgroundColor: "#23d996",
            tension: 0.1,
            pointBackgroundColor: "#23d996",
            pointBorderColor: "#23d996",
            pointRadius: 3,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
        ],
      });
    } catch (error) {
      console.error("Error fetching sentiment data:", error);
    }
  };

  useEffect(() => {
    fetchSentimentData(timeframe);
  }, [timeframe]);

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: "Date", color: "#A0AEC0" }, // Culoare text axa X
        ticks: {
          autoSkip: true,
          maxTicksLimit: 10,
          maxRotation: 45,
          color: "#A0AEC0",
        }, // Culoare ticks axa X
        grid: { color: "#2D3748" }, // Culoare grid axa X
      },
      y: {
        title: {
          display: true,
          text: "Fear and Greed Index",
          color: "#A0AEC0",
        }, // Culoare text axa Y
        ticks: { min: 0, max: 100, stepSize: 10, color: "#A0AEC0" }, // Culoare ticks axa Y
        grid: { color: "#2D3748" }, // Culoare grid axa Y
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#A0AEC0", // Culoare text legenda
        },
      },
    },
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Titlu principal */}
      <h2 className="text-3xl font-semibold text-gray-800 dark:text-white">
        Market Sentiment (Fear and Greed Index)
      </h2>

      {/* Dropdown pentru alegerea intervalului de timp */}
      <div className="mt-6">
        <select
          value={timeframe}
          onChange={handleTimeframeChange}
          className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-md appearance-none"
        >
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="365">Last 1 Year</option>
          <option value="max">All Time</option>
        </select>
      </div>

      {/* Graficul Sentimentului (Fear and Greed Index) */}
      <div className="mt-6">
        <Line data={sentimentData} options={options} />
      </div>

      {/* Card pentru SentimentGauge */}
      <div className="mt-8 flex flex-col items-center">
        {sentimentData.datasets.length > 0 && (
          <div className="w-full max-w-lg p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              Fear & Greed Index Today
            </h3>
            <div className="flex flex-col items-center">
              <SentimentGauge
                value={sentimentData.datasets[0].data.slice(-1)[0]}
              />
              <p className="mt-4 text-gray-700 dark:text-gray-300 text-center">
                The current market sentiment is based on multiple factors such
                as volatility, volume, and social media trends.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Explicația graficelor */}
      <div className="mt-12 p-6 rounded-lg shadow-md bg-white dark:bg-gray-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Understanding the Fear & Greed Index
        </h3>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The <strong>Fear & Greed Index</strong> is a crucial sentiment
          indicator that reflects investor emotions in the market. Ranging from{" "}
          <strong>0</strong> (extreme fear) to <strong>100</strong> (extreme
          greed), it helps traders identify potential market reversals.
        </p>

        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
          📈 Sentiment Trend Chart
        </h4>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The line chart above shows historical fluctuations of the Fear & Greed
          Index. By analyzing past trends, traders can gauge whether the market
          sentiment is shifting towards optimism or pessimism.
        </p>

        <h4 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">
          🎯 Fear & Greed Gauge
        </h4>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          The gauge below provides a real-time snapshot of market sentiment. A
          needle pointing toward fear suggests bearishness, while a shift toward
          greed indicates bullish momentum. This tool is best used alongside
          technical and fundamental analysis.
        </p>
      </div>
    </section>
  );
}

export default SentimentChart;
