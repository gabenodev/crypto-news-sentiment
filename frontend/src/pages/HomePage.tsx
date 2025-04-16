import * as React from "react";
import TopMovers from "@components/HomePage/TopMovers";
import TrendingCoins from "@components/HomePage/TrendingCoins";
import CryptoTable from "@components/HomePage/CryptoTable";
import MarketDominance from "@components/HomePage/MarketDominance";
import useCryptoData from "@hooks/homepage/useCryptoData";
import FearGreedIndex from "@components/HomePage/FearGreedIndex";

function Homepage(): JSX.Element {
  const { cryptoData, loading, error: cryptoError } = useCryptoData();

  return (
    <>
      <div className="max-w-7xl mx-auto px-3">
        {/* First row - 3 cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TopMovers />
          <TrendingCoins />

          {/* Right column - compact group */}
          <div className="flex flex-col">
            <MarketDominance />
            <div className="mt-5">
              <FearGreedIndex />
            </div>
          </div>
        </div>
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
      </div>
    </>
  );
}

export default Homepage;
