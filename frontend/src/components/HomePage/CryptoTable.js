import React, { useState } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function CryptoTable({ cryptoData }) {
  const navigate = useNavigate();
  const [sortedData, setSortedData] = useState([...cryptoData]);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "desc",
  });

  const handleSort = (key) => {
    let direction = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }

    const sorted = [...sortedData].sort((a, b) => {
      if (direction === "asc") {
        return a[key] - b[key];
      } else {
        return b[key] - a[key];
      }
    });

    setSortedData(sorted);
    setSortConfig({ key, direction });
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="relative w-full max-w-full">
        {/* Enhanced glow effect */}
        {/* Glow effect - acum mai vizibil pe margini */}
        <div className="absolute -inset-3 -z-10 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400/40 to-green-500/40 rounded-xl blur-xl opacity-50 dark:opacity-40 animate-pulse-slow"></div>
        </div>

        {/* Table container with requested background and subtle glass effect */}
        <div className="relative w-full rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200/50 dark:border-gray-700/50">
                <th className="py-4 px-6 font-medium text-left">#</th>
                <th className="py-4 px-6 font-medium text-left">Coin</th>
                <th
                  className="py-4 px-6 font-medium text-left cursor-pointer hover:text-teal-500 transition-colors"
                  onClick={() => handleSort("current_price")}
                >
                  <div className="flex items-center">
                    Price
                    {sortConfig.key === "current_price" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <FaArrowUp size={10} />
                        ) : (
                          <FaArrowDown size={10} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-4 px-6 font-medium text-right cursor-pointer hover:text-teal-500 transition-colors"
                  onClick={() => handleSort("price_change_percentage_24h")}
                >
                  <div className="flex items-center justify-end">
                    24h
                    {sortConfig.key === "price_change_percentage_24h" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <FaArrowUp size={10} />
                        ) : (
                          <FaArrowDown size={10} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="py-4 px-6 font-medium text-right cursor-pointer hover:text-teal-500 transition-colors"
                  onClick={() => handleSort("market_cap")}
                >
                  <div className="flex items-center justify-end">
                    Market Cap
                    {sortConfig.key === "market_cap" && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? (
                          <FaArrowUp size={10} />
                        ) : (
                          <FaArrowDown size={10} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="py-4 px-6 font-medium text-right">Supply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {sortedData.map((crypto) => {
                const maxSupply = crypto.max_supply || crypto.total_supply;
                const progress = maxSupply
                  ? (crypto.circulating_supply / maxSupply) * 100
                  : 0;

                return (
                  <tr
                    key={crypto.id}
                    onClick={() => navigate(`/currencies/${crypto.id}`)}
                    className="group hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 font-medium">
                      {crypto.market_cap_rank}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <img
                            src={crypto.image}
                            alt={crypto.name}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-600 shadow-sm group-hover:border-teal-300 transition-colors"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                            {crypto.name}
                          </div>
                          <div className="text-xs text-teal-500 dark:text-teal-400 font-medium">
                            {crypto.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      $
                      {crypto.current_price < 0.01
                        ? crypto.current_price.toFixed(8).replace(/\.?0+$/, "")
                        : crypto.current_price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}
                    </td>
                    <td
                      className={`py-4 px-6 text-right font-medium ${
                        crypto.price_change_percentage_24h >= 0
                          ? "text-green-500 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      <div className="flex items-center justify-end">
                        {crypto.price_change_percentage_24h >= 0 ? (
                          <FaArrowUp className="mr-1" size={10} />
                        ) : (
                          <FaArrowDown className="mr-1" size={10} />
                        )}
                        {Math.abs(crypto.price_change_percentage_24h).toFixed(
                          2
                        )}
                        %
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-gray-800 dark:text-gray-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                      ${crypto.market_cap.toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {progress >= 100 ? (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {crypto.circulating_supply.toLocaleString()}
                        </span>
                      ) : (
                        <div className="flex flex-col items-end space-y-1">
                          <div className="w-full max-w-[120px] bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full"
                              style={{
                                width: `${progress.toFixed(2)}%`,
                                background:
                                  "linear-gradient(to right, #2dd4bf, #4ade80)",
                              }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="text-teal-500 dark:text-teal-400 font-medium">
                              {progress.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CryptoTable;
