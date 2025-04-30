"use client";
import React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "../components/HomePage/HeroSection";
import TopMovers from "../components/HomePage/TopMovers";
import TrendingCoins from "../components/HomePage/TrendingCoins";
import MarketDominance from "../components/HomePage/MarketDominance";
import CryptoTable from "../components/HomePage/CryptoTable";
import NewsHighlights from "../components/HomePage/NewsHighlights";
import SentimentSummary from "../components/HomePage/SentimentSummary";
import useCryptoData from "../hooks/homepage/useCryptoData";

function Homepage(): JSX.Element {
  const { cryptoData, loading, error: cryptoError } = useCryptoData();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-dark-primary dark:to-dark-primary">
      {/* Hero Section */}
      <HeroSection />

      {/* Cards Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">
              Market Insights
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center mb-6">
              Stay informed with real-time data on market trends, top
              performers, and key indicators
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-green-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primul rând: Top Movers și Trending Coins */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              <TopMovers />
              <TrendingCoins />
            </div>

            {/* Al doilea rând: Market Dominance și Sentiment Summary */}
            <div className="md:col-span-1">
              <MarketDominance />
            </div>
          </div>
        </div>
      </section>

      {/* News & Sentiment Section */}
      <section className="py-10 bg-gray-50/50 dark:bg-dark-primary/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center">
              News & Sentiment
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-3xl mx-auto text-center mb-6">
              Latest crypto news and market sentiment analysis to help you make
              informed decisions
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-green-500 mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <NewsHighlights />
            </div>
            <div>
              <SentimentSummary />
            </div>
          </div>
        </div>
      </section>

      {/* Crypto Table Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
              Complete Cryptocurrency Market
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
              Explore our comprehensive list of cryptocurrencies with real-time
              price data, market capitalization, and 24h trading volume. Analyze
              trends, compare performance, and discover new investment
              opportunities.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-400 to-green-500 mx-auto mt-4"></div>
          </motion.div>
        </div>

        <div className="overflow-x-auto">
          <CryptoTable
            cryptoData={cryptoData}
            isLoading={loading}
            error={cryptoError}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Data refreshes every minute. Includes all actively traded
          cryptocurrencies.
        </div>
      </section>
    </div>
  );
}

export default Homepage;
