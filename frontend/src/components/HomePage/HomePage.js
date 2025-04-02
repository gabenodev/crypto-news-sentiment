import React from "react";
import CryptoTable from "./CryptoTable";
import TrendingCoins from "./TrendingCoins";
import useCryptoData from "../hooks/useCryptoData";
import useTrendingCoins from "../hooks/useTrendingCoins";

function Homepage() {
  const { cryptoData, loading: loadingCrypto } = useCryptoData();
  const { trendingCoins, loading: loadingTrending } = useTrendingCoins();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4">
        <TrendingCoins trendingCoins={trendingCoins} />
      </div>

      <div className="mt-16">
        <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            Complete Cryptocurrency Market
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-4xl mx-auto">
            Explore our comprehensive list of 1000+ cryptocurrencies with
            real-time price data, market capitalization, and 24h trading volume.
            Analyze trends, compare performance, and discover new investment
            opportunities across the entire crypto market.
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-teal-400 to-green-500 mx-auto mt-4"></div>
        </div>

        <div className="overflow-x-auto">
          <CryptoTable cryptoData={cryptoData} />
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
          Data refreshes every minute. Includes all actively traded
          cryptocurrencies.
        </div>
      </div>
    </>
  );
}

export default Homepage;
