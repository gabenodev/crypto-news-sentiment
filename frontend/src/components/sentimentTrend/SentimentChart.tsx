"use client";

import * as React from "react";
import SentimentGauge from "./SentimentGauge";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { fetchSentimentData } from "../../utils/API/sentimentAPI";
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
import type { SentimentChartData } from "../../types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function SentimentChart(): JSX.Element {
  const [sentimentData, setSentimentData] = useState<SentimentChartData>({
    labels: [],
    datasets: [],
  });
  const [timeframe, setTimeframe] = useState<string | number>("30");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadSentimentData = async (limit: string | number) => {
    setIsLoading(true);
    setError(null);
    try {
      const { sentimentScores, sentimentTimestamps } = await fetchSentimentData(
        limit
      );
      setSentimentData({
        labels: sentimentTimestamps,
        datasets: [
          {
            label: "Fear & Greed Index",
            data: sentimentScores,
            fill: true,
            borderColor: "#9ca3af",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            tension: 0.4,
            pointBackgroundColor: (context) => {
              const value = context.dataset.data[context.dataIndex];
              if (value <= 25) return "#ef4444";
              if (value <= 50) return "#f59e0b";
              if (value <= 75) return "#facc15";
              return "#10b981";
            },
            pointBorderColor: "transparent",
            pointRadius: 3,
            pointHoverRadius: 5,
            borderWidth: 2,
          },
        ],
      });
    } catch (error) {
      setError("Failed to load sentiment data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSentimentData(timeframe);
  }, [timeframe]);

  const handleTimeframeChange = (newTimeframe: string | number): void => {
    setTimeframe(newTimeframe);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#6b7280",
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "#1f2937",
        titleColor: "#f3f4f6",
        bodyColor: "#f3f4f6",
        padding: 12,
        borderColor: "#374151",
        borderWidth: 1,
        cornerRadius: 8,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 700,
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            label += context.parsed.y;
            return label;
          },
          footer: (tooltipItems: any[]) => {
            const value = tooltipItems[0].parsed.y;
            let sentiment;
            if (value <= 25) sentiment = "Extreme Fear";
            else if (value <= 50) sentiment = "Fear";
            else if (value <= 75) sentiment = "Neutral";
            else sentiment = "Greed";
            return `Sentiment: ${sentiment}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#9ca3af",
          maxRotation: 45,
          minRotation: 45,
          font: {
            family: "'Inter', sans-serif",
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: "#9ca3af",
          font: {
            family: "'Inter', sans-serif",
          },
        },
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  const timeframes = [
    { value: "7", label: "7D" },
    { value: "30", label: "1M" },
    { value: "90", label: "3M" },
    { value: "365", label: "1Y" },
    { value: "max", label: "All" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Market Sentiment Analysis
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Track the Fear & Greed Index to understand investor emotions and
            potential market trends
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Gauge */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:col-span-1 transition-all duration-200 hover:shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Current Sentiment
              </h2>
            </div>

            {error ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-2 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p>{error}</p>
                <button
                  onClick={() => fetchSentimentData(timeframe)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="h-64 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading sentiment data...
                </p>
              </div>
            ) : (
              <>
                <SentimentGauge
                  value={
                    sentimentData.datasets.length > 0
                      ? sentimentData.datasets[0].data.slice(-1)[0]
                      : 50
                  }
                />
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Extreme Fear
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      0-25
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Fear
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      26-50
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Neutral
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      51-75
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Greed
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      76-100
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Column - Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 lg:col-span-2 transition-all duration-200 hover:shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 md:mb-0">
                Historical Trend
              </h2>
              <div className="inline-flex rounded-lg shadow-sm">
                {timeframes.map((tf) => (
                  <button
                    key={tf.value}
                    onClick={() => handleTimeframeChange(tf.value)}
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                      timeframe === tf.value
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                    } ${tf.value === "7" ? "rounded-l-lg" : ""} ${
                      tf.value === "max" ? "rounded-r-lg" : ""
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>
            </div>

            {error ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-2 text-red-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p>{error}</p>
                <button
                  onClick={() => fetchSentimentData(timeframe)}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : isLoading ? (
              <div className="h-96 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Loading chart data...
                </p>
              </div>
            ) : (
              <div className="h-96">
                <Line data={sentimentData} options={options} />
              </div>
            )}
          </div>
        </div>

        {/* Explanation Section */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-all duration-200 hover:shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Understanding the Fear & Greed Index
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                    clipRule="evenodd"
                  />
                </svg>
                What It Measures
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                The Fear & Greed Index analyzes emotions and sentiments from
                different sources including volatility, market momentum, social
                media, surveys, and more. It ranges from 0 (extreme fear) to 100
                (extreme greed).
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  />
                </svg>
                How To Use It
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Extreme fear can indicate potential buying opportunities, while
                extreme greed may signal the market is due for a correction. Use
                this alongside technical and fundamental analysis for better
                decision making.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SentimentChart;
