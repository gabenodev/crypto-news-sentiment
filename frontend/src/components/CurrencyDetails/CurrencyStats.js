import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function CurrencyStats() {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/coin-data?coinId=${coinId}`
        );
        const data = await response.json();
        setCoinData(data);
      } catch (error) {
        console.error("Error fetching coin data:", error);
      }
    }
    fetchData();
  }, [coinId]);

  if (!coinData) {
    return (
      <div className="text-center text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4">
      {/* Card Stânga */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 w-80 flex flex-col items-center">
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
            {coinData.name} ({coinData.symbol.toUpperCase()})
          </h2>
          <img
            src={coinData.image.large}
            alt={coinData.name}
            className="h-10 w-10 rounded-full"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Current Price:{" "}
          <span className="font-semibold">
            ${coinData.market_data.current_price.usd.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Market Cap Rank:{" "}
          <span className="font-semibold">#{coinData.market_cap_rank}</span>
        </p>
      </div>

      {/* Card Mijloc */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 w-80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
          All-Time High / Low
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          All-Time High:{" "}
          <span className="font-semibold">
            ${coinData.market_data.ath.usd.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          All-Time High Change:{" "}
          <span className="font-semibold">
            {coinData.market_data.ath_change_percentage.usd.toFixed(2)}%
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          All-Time High Date:{" "}
          <span className="font-semibold">
            {new Date(coinData.market_data.ath_date.usd).toLocaleDateString()}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          All-Time Low:{" "}
          <span className="font-semibold">
            ${coinData.market_data.atl.usd.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          All-Time Low Change:{" "}
          <span className="font-semibold">
            {coinData.market_data.atl_change_percentage.usd.toFixed(2)}%
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          All-Time Low Date:{" "}
          <span className="font-semibold">
            {new Date(coinData.market_data.atl_date.usd).toLocaleDateString()}
          </span>
        </p>
      </div>

      {/* Card Dreapta */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 w-80">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
          24h Statistics
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          High 24h:{" "}
          <span className="font-semibold">
            ${coinData.market_data.high_24h.usd.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Low 24h:{" "}
          <span className="font-semibold">
            ${coinData.market_data.low_24h.usd.toLocaleString()}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Price Change 24h:{" "}
          <span className="font-semibold">
            ${coinData.market_data.price_change_24h.toFixed(2)}
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Price Change % 24h:{" "}
          <span
            className={`font-semibold ${
              coinData.market_data.price_change_percentage_24h >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {coinData.market_data.price_change_percentage_24h.toFixed(2)}%
          </span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Market Cap Change % 24h:{" "}
          <span
            className={`font-semibold ${
              coinData.market_data.market_cap_change_percentage_24h >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {coinData.market_data.market_cap_change_percentage_24h.toFixed(2)}%
          </span>
        </p>
      </div>
    </div>
  );
}

export default CurrencyStats;
