import React, { useEffect, useState } from "react";

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-2">
      <h1 className="text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-8">
        Cryptocurrency Market
      </h1>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-200 dark:bg-gray-800">
            <tr className="text-lg text-gray-700 dark:text-gray-300">
              {["#", "Name", "Price", "24h Change", "Market Cap", "Supply"].map(
                (header) => (
                  <th
                    key={header}
                    className="py-4 px-6 text-left font-semibold"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-gray-100 dark:bg-gray-900">
            {cryptoData.map((crypto) => (
              <tr
                key={crypto.id}
                className="border-b border-gray-300 dark:border-gray-700"
              >
                <td className="py-4 px-6 text-gray-800 dark:text-gray-200 font-medium">
                  #{crypto.market_cap_rank}
                </td>
                <td className="py-4 px-6 flex items-center space-x-3">
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-gray-900 dark:text-gray-200 font-medium">
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </span>
                </td>
                <td className="py-4 px-6 text-gray-900 dark:text-gray-200 font-medium">
                  ${crypto.current_price.toLocaleString()}
                </td>
                <td
                  className={`py-4 px-6 font-medium ${
                    crypto.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="py-4 px-6 text-gray-900 dark:text-gray-200 font-medium">
                  ${crypto.market_cap.toLocaleString()}
                </td>
                <td className="py-4 px-6 text-gray-600 dark:text-gray-400 text-sm">
                  {crypto.circulating_supply.toLocaleString()} /{" "}
                  {crypto.max_supply ? crypto.max_supply.toLocaleString() : "∞"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Homepage;
