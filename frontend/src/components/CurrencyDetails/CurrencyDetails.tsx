"use client";
import React from "react";
import { useParams } from "react-router-dom";
import CurrencyStats from "./CurrencyStats";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiBarChart2,
  FiDollarSign,
  FiInfo,
} from "react-icons/fi";

function CurrencyDetails(): JSX.Element {
  const { coinId } = useParams<{ coinId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://sentimentxv2-project.vercel.app/api/coin-data?coinId=${coinId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching coin data:", error);
        setError(
          "There was an error fetching the coin data. Please try again."
        );
        setLoading(false);
      }
    }

    fetchData();
  }, [coinId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary p-6 flex justify-center items-center">
        <div className="max-w-md w-full">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-t-teal-500 border-b-teal-500 border-l-transparent border-r-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Loading cryptocurrency data
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
              Fetching the latest information for {coinId}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-primary p-6 flex justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-dark-secondary rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FiAlertCircle className="text-red-500 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-dark-text-primary mb-2">
              Error Loading Data
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-dark-primary min-h-screen">
      {/* Header with navigation */}

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation tabs */}
        <div className="mb-6 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 min-w-max">
            <button
              onClick={() => setActiveSection("overview")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "overview"
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                  : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <FiInfo className="mr-2" />
                Overview
              </div>
            </button>
            <button
              onClick={() => setActiveSection("markets")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "markets"
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                  : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <FiBarChart2 className="mr-2" />
                Markets
              </div>
            </button>
            <button
              onClick={() => setActiveSection("fundamentals")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === "fundamentals"
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                  : "bg-white text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center">
                <FiDollarSign className="mr-2" />
                Fundamentals
              </div>
            </button>
          </div>
        </div>

        {/* Currency stats section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CurrencyStats activeSection={activeSection} coinId={coinId || ""} />
        </motion.div>
      </div>
    </div>
  );
}

export default CurrencyDetails;
