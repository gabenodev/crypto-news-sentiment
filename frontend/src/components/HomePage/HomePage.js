import React, { useEffect, useState } from "react";
import CryptoTable from "./CryptoTable"; // 🔹 Importăm componenta tabelului

function Homepage() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://sentimentx-backend.vercel.app/api/all-cryptos"
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Sortăm datele după market cap (rank)
        const sortedData = data.sort(
          (a, b) => a.market_cap_rank - b.market_cap_rank
        );
        setCryptoData(sortedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-r from-gray-900 to-gray-800 py-8 px-2">
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
        Cryptocurrency Market
      </h1>
      <CryptoTable cryptoData={cryptoData} />{" "}
      {/* 🔹 Apelăm componenta CryptoTable */}
    </div>
  );
}

export default Homepage;
