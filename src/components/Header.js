import React, { useState, useEffect } from "react";
import NightToggle from "./NightToggle"; // Importă componenta NightToggle

function Header({ setActiveTab }) {
  const [cryptoData, setCryptoData] = useState({
    bitcoinDominance: 0,
    ethereumDominance: 0,
    totalVolume24h: 0,
    totalMarketCap: 0,
    marketCapChange24h: 0,
  });

  useEffect(() => {
    // Funcție pentru a obține datele de la CoinGecko
    const fetchCoinGeckoData = async () => {
      try {
        const response = await fetch("https://api.coingecko.com/api/v3/global");
        const data = await response.json();
        console.log("API Response:", data); // Debugging: Afișează răspunsul API

        // Extrage datele necesare
        const globalMetrics = data.data;
        const bitcoinDominance = globalMetrics.market_cap_percentage.btc;
        const ethereumDominance = globalMetrics.market_cap_percentage.eth;
        const totalVolume24h = globalMetrics.total_volume.usd;
        const totalMarketCap = globalMetrics.total_market_cap.usd;
        const marketCapChange24h =
          globalMetrics.market_cap_change_percentage_24h_usd;

        // Actualizează state-ul cu noile date
        setCryptoData({
          bitcoinDominance,
          ethereumDominance,
          totalVolume24h,
          totalMarketCap,
          marketCapChange24h,
        });
      } catch (error) {
        console.error("Error fetching CoinGecko data:", error); // Debugging: Afișează erorile
      }
    };

    fetchCoinGeckoData();
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Titlul site-ului, navbar-ul și NightToggle pe aceeași linie */}
        <div className="flex items-center justify-between">
          {/* Partea din stânga: Titlul și navbar-ul */}
          <div className="flex items-center space-x-10">
            {/* Titlul site-ului */}
            <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
              SentimentX
            </h1>

            {/* Navbar */}
            <nav className="flex space-x-6 text-lg font-medium">
              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("news")}
              >
                News
              </button>

              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("altcoin")}
              >
                Altcoin Season Index
              </button>

              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("sentiment")}
              >
                Sentiment Trend
              </button>

              <button
                className="text-gray-300 hover:text-teal-400 transition duration-300"
                onClick={() => setActiveTab("whaleTransactions")}
              >
                Whale Transactions
              </button>
            </nav>
          </div>

          {/* Partea din dreapta: NightToggle */}
          <div className="flex items-center">
            <NightToggle />
          </div>
        </div>

        {/* Linie de separare cu gradient */}
        <div className="my-4 h-px bg-gradient-to-r from-teal-400 to-green-500"></div>

        {/* Informații despre crypto */}
        <div className="flex space-x-8 text-sm font-medium text-gray-300">
          {/* Bitcoin Dominance */}
          <div className="flex items-center space-x-2">
            <span className="text-teal-400">BTC Dominance</span>
            <span>{cryptoData.bitcoinDominance.toFixed(2)}%</span>
          </div>

          {/* Ethereum Dominance */}
          <div className="flex items-center space-x-2">
            <span className="text-purple-400">ETH Dominance</span>
            <span>{cryptoData.ethereumDominance.toFixed(2)}%</span>
          </div>

          {/* 24h Volume */}
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">Vol</span>
            <span>${cryptoData.totalVolume24h.toLocaleString()}</span>
          </div>

          {/* Market Cap */}
          <div className="flex items-center space-x-2">
            <span className="text-blue-400">Market Cap</span>
            <span>${cryptoData.totalMarketCap.toLocaleString()}</span>
            <span
              className={
                cryptoData.marketCapChange24h >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {cryptoData.marketCapChange24h >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(cryptoData.marketCapChange24h).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
