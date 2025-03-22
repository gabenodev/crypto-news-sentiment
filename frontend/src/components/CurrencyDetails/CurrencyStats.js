import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaLink, FaReddit, FaComments } from "react-icons/fa"; // Importăm iconițe
import { CgWebsite } from "react-icons/cg";
import { ClipLoader } from "react-spinners"; // Importăm un loader pentru animație

function CurrencyStats() {
  const { coinId } = useParams();
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(true); // Setăm loading la true la început
  const [error, setError] = useState(null); // Variabilă pentru erori

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true); // Setăm loading pe true înainte de fetch
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/coin-data?coinId=${coinId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setCoinData(data);
        setLoading(false); // Oprire loading după ce datele sunt încărcate
      } catch (error) {
        console.error("Error fetching coin data:", error);
        setError(
          "There was an error fetching the coin data. Please try again."
        );
        setLoading(false); // Oprire loading în caz de eroare
      }
    }

    fetchData();
  }, [coinId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <ClipLoader size={50} color="#23d996" />
        <p className="text-center text-gray-700 dark:text-gray-300 ml-4">
          Loading...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 dark:text-red-300">
        <p>{error}</p>
      </div>
    );
  }

  // Extragem datele relevante
  const currentPrice = coinData.market_data.current_price.usd;
  const athPrice = coinData.market_data.ath.usd;
  const atlPrice = coinData.market_data.atl.usd;
  const high24h = coinData.market_data.high_24h.usd;
  const low24h = coinData.market_data.low_24h.usd;
  const athChangePercentage = coinData.market_data.ath_change_percentage.usd;
  const atlChangePercentage = coinData.market_data.atl_change_percentage.usd;
  const athDate = new Date(
    coinData.market_data.ath_date.usd
  ).toLocaleDateString();
  const atlDate = new Date(
    coinData.market_data.atl_date.usd
  ).toLocaleDateString();

  // Calculăm poziția prețului curent pe progress bar
  const progress = ((currentPrice - atlPrice) / (athPrice - atlPrice)) * 100;

  return (
    <div className="flex flex-wrap justify-center gap-6 p-6">
      {/* Card Stânga */}
      <div className="bg-gray-100 dark:bg-gray-900 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 shadow-[0_0_15px_#ffffff80] dark:shadow-[0_0_15px_#ffffff33] border border-white/40 dark:border-white/20 animate__animated animate__fadeIn">
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
          </div>
        </div>
        <div className="mt-4">
          {/* Prețul */}
          <p className="text-4xl font-semibold text-gray-900 dark:text-gray-200 text-left">
            ${currentPrice.toLocaleString()}
          </p>
          {/* Detaliile suplimentare */}
          <div className="mt-4 space-y-2 text-left">
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
      </div>

      {/* Card Price Position */}
      <div className="bg-gray-100 dark:bg-gray-900 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 shadow-[0_0_15px_#ffffff80] dark:shadow-[0_0_15px_#ffffff33] border border-white/40 dark:border-white/20 animate__animated animate__fadeIn">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">
          Price Position
        </h2>
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className="absolute h-2 bg-blue-500 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
            <div
              className="absolute h-2 bg-orange-500 rounded-full"
              style={{ width: `${100 - progress}%`, left: `${progress}%` }}
            ></div>
            <div
              className="absolute w-4 h-4 bg-white border-2 border-gray-500 rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${progress}%`, top: "50%" }}
            ></div>
          </div>

          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-blue-500">
              ATL: ${atlPrice.toLocaleString()}
            </span>
            <span>Current: ${currentPrice.toLocaleString()}</span>
            <span className="font-semibold text-orange-500">
              ATH: ${athPrice.toLocaleString()}
            </span>
          </div>

          <div className="space-y-2 mt-6">
            {/* ATH */}
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                All Time High:{" "}
                <span className="font-semibold text-gray-400">
                  ${athPrice.toLocaleString()}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                All time high change:{" "}
                <span
                  className={`font-semibold ${
                    athChangePercentage >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {athChangePercentage.toFixed(2)}%
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                All time high date:{" "}
                <span className="font-semibold">{athDate}</span>
              </p>
            </div>

            {/* ATL */}
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                All Time Low:{" "}
                <span className="text-gray-400 font-semibold">
                  ${atlPrice.toLocaleString()}
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                All time low change:{" "}
                <span
                  className={`font-semibold ${
                    atlChangePercentage >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {atlChangePercentage.toFixed(2)}%
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                All time low date:{" "}
                <span className="font-semibold">{atlDate}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 24h Statistics */}
      <div className="bg-gray-100 dark:bg-gray-900 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 shadow-[0_0_15px_#ffffff80] dark:shadow-[0_0_15px_#ffffff33] border border-white/40 dark:border-white/20 animate__animated animate__fadeIn">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4">
          24h Statistics
        </h2>
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-400">
            High 24h:{" "}
            <span className="font-semibold">${high24h.toLocaleString()}</span>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Low 24h:{" "}
            <span className="font-semibold">${low24h.toLocaleString()}</span>
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

      {/* Card Useful Links */}
      <div className="bg-gray-100 dark:bg-gray-900 shadow-lg rounded-lg p-6 w-96 transform transition duration-500 shadow-[0_0_15px_#ffffff80] dark:shadow-[0_0_15px_#ffffff33] border border-white/40 dark:border-white/20 animate__animated animate__fadeIn">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-4 ">
          Explorer & Links
        </h2>
        <div className="space-y-3">
          <a
            href={coinData.links.homepage[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-700  p-2 rounded-md"
          >
            <CgWebsite className="mr-2" />
            Official Website
          </a>
          <a
            href={coinData.links.blockchain_site[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-gray-500 hover:text-gray-400  p-2 rounded-md"
          >
            <FaLink className="mr-2" />
            Blockchain Explorer
          </a>
          <a
            href={coinData.links.whitepaper}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-white hover:text-gray-300 p-2 rounded-md"
          >
            <FaComments className="mr-2" />
            Whitepaper
          </a>
          <a
            href={coinData.links.subreddit_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-orange-500 hover:text-orange-400 p-2 rounded-md"
          >
            <FaReddit className="mr-2" />
            Subreddit
          </a>
        </div>
      </div>
    </div>
  );
}

export default CurrencyStats;
