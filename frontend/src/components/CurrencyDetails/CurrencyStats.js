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
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {/* Card Stânga */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 hover:scale-105">
        <div className="flex items-center space-x-4">
          <img
            src={coinData.image.large}
            alt={coinData.name}
            className="h-16 w-16 rounded-full"
          />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">
              {coinData.name} ({coinData.symbol.toUpperCase()})
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Current Price:{" "}
              <span className="font-semibold">
                ${coinData.market_data.current_price.usd.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-gray-600 dark:text-gray-400">
            Market Cap Rank:{" "}
            <span className="font-semibold">#{coinData.market_cap_rank}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Market Cap:{" "}
            <span className="font-semibold">
              ${coinData.market_data.market_cap.usd.toLocaleString()}
            </span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            24h Volume:{" "}
            <span className="font-semibold">
              ${coinData.market_data.total_volume.usd.toLocaleString()}
            </span>
          </p>
        </div>
      </div>

      {/* Card Mijloc */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 hover:scale-105">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">
          All-Time High / Low
        </h2>
        <div className="space-y-2">
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
      </div>

      {/* Card Dreapta */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 hover:scale-105">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">
          24h Statistics
        </h2>
        <div className="space-y-2">
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
              {coinData.market_data.market_cap_change_percentage_24h.toFixed(2)}
              %
            </span>
          </p>
        </div>
      </div>

      {/* Card Supply Metrics */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 hover:scale-105">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">
          Supply Metrics
        </h2>
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            Circulating Supply:{" "}
            <span className="font-semibold">
              {coinData.market_data.circulating_supply.toLocaleString()}
            </span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Total Supply:{" "}
            <span className="font-semibold">
              {coinData.market_data.total_supply.toLocaleString()}
            </span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Max Supply:{" "}
            <span className="font-semibold">
              {coinData.market_data.max_supply?.toLocaleString() || "N/A"}
            </span>
          </p>
        </div>
      </div>

      {/* Card Links */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 hover:scale-105">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">
          Useful Links
        </h2>
        <div className="space-y-2">
          <a
            href={coinData.links.homepage[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Official Website
          </a>
          <a
            href={coinData.links.blockchain_site[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Blockchain Explorer
          </a>
          <a
            href={coinData.links.official_forum_url[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Official Forum
          </a>
          <a
            href={coinData.links.subreddit_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Subreddit
          </a>
        </div>
      </div>
    </div>
  );
}

export default CurrencyStats;
