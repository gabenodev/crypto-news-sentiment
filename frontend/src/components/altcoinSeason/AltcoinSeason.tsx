"use client";
import * as React from "react";
import { useState } from "react";
import AltcoinChart from "./AltcoinChart";
import type { CoinData, SortConfigType } from "./types";
import useAltcoinSeasonData from "./hooks/useAltcoinSeasonData";
import useFilteredCoins from "./hooks/useFilteredCoins";
import { formatMarketCap } from "./utils/formatters";
import { FaChartLine } from "react-icons/fa";

// Component imports
import StatusCard from "./components/StatusCard";
import MetricsCards from "./components/MetricsCards";
import SearchFilter from "./components/SearchFilter";
import CoinList from "./components/CoinList";
import LoadingState from "./components/LoadingState";

const AltcoinSeason = () => {
  // State management
  const [selectedCoin, setSelectedCoin] = useState<CoinData | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfigType>({
    key: "priceChange",
    direction: "desc",
  });
  const [showEnhancedInfo, setShowEnhancedInfo] = useState<boolean>(false);
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // Custom hooks
  const {
    loading,
    outperformingCount,
    totalAltcoins,
    percentage,
    outperformingCoins,
    bitcoinData,
    enhancedIndex,
    seasonStatus,
    enhancedStatus,
  } = useAltcoinSeasonData();

  const filteredAndSortedCoins = useFilteredCoins({
    outperformingCoins,
    searchTerm,
    sortConfig,
  });

  const handleSort = (key: "priceChange" | "marketCap" | "name" | "rank") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-gray-50 dark:bg-gray-900 p-4 lg:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-green-500">
            Altcoin Season Index
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-lg">
            Track whether we're in an Altcoin Season or Bitcoin Season based on
            market performance
          </p>
        </div>

        {/* Main Content Area */}
        <div
          className={`flex flex-col ${selectedCoin ? "lg:flex-row" : ""} gap-8`}
        >
          {/* Left Card */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200/50 dark:border-gray-700/50 ${
              selectedCoin ? "lg:min-w-[500px] lg:w-[55%]" : "w-full"
            }`}
          >
            {/* Status Card */}
            <StatusCard
              seasonStatus={seasonStatus}
              enhancedIndex={enhancedIndex}
              showEnhancedInfo={showEnhancedInfo}
              setShowEnhancedInfo={setShowEnhancedInfo}
            />

            <div className="p-6">
              {/* Metrics Cards */}
              <div className="mb-8">
                <MetricsCards
                  outperformingCount={outperformingCount}
                  totalAltcoins={totalAltcoins}
                  percentage={percentage}
                  enhancedStatus={enhancedStatus}
                  enhancedIndex={enhancedIndex}
                  bitcoinData={bitcoinData}
                />
              </div>

              {outperformingCoins.length > 0 && (
                <div className="mt-8">
                  {/* Search and Filter */}
                  <SearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    isFilterOpen={isFilterOpen}
                    setIsFilterOpen={setIsFilterOpen}
                  />

                  {/* Coin List */}
                  <CoinList
                    filteredAndSortedCoins={filteredAndSortedCoins}
                    selectedCoin={selectedCoin}
                    setSelectedCoin={setSelectedCoin}
                    handleSort={handleSort}
                    sortConfig={sortConfig}
                    formatMarketCap={formatMarketCap}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Chart Card */}
          {selectedCoin ? (
            <div className="lg:flex-1 min-w-0">
              <div className="sticky top-20 h-[calc(100vh-32px)] overflow-y-auto">
                <AltcoinChart
                  coin={selectedCoin}
                  onClose={() => setSelectedCoin(null)}
                />
              </div>
            </div>
          ) : (
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50 h-full">
              <div className="flex flex-col items-center justify-center h-full text-center py-10">
                <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
                  <FaChartLine className="text-teal-500 text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  Select a Coin
                </h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-xs">
                  Click on any coin from the list to view its detailed price
                  chart and performance metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AltcoinSeason;
