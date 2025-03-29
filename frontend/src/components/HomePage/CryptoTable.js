import React, { useState, useMemo } from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function CryptoTable({ cryptoData }) {
  const navigate = useNavigate();
  const [sortConfig, setSortConfig] = useState({
    key: "market_cap_rank",
    direction: "asc",
  });
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const sortedData = useMemo(() => {
    if (!cryptoData) return [];

    const sortableItems = [...cryptoData];
    const { key, direction } = sortConfig;

    return sortableItems.sort((a, b) => {
      if (a[key] == null) return direction === "asc" ? 1 : -1;
      if (b[key] == null) return direction === "asc" ? -1 : 1;

      if (typeof a[key] === "number" && typeof b[key] === "number") {
        return direction === "asc" ? a[key] - b[key] : b[key] - a[key];
      }

      if (typeof a[key] === "string" && typeof b[key] === "string") {
        return direction === "asc"
          ? a[key].localeCompare(b[key])
          : b[key].localeCompare(a[key]);
      }

      return 0;
    });
  }, [cryptoData, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <FaArrowUp className="ml-1" size={10} />
    ) : (
      <FaArrowDown className="ml-1" size={10} />
    );
  };

  const formatPrice = (price) => {
    if (price < 0.01) {
      return price.toFixed(8).replace(/\.?0+$/, "");
    }
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="relative w-full max-w-full">
        {/* Glow effect */}
        <div className="absolute -inset-3 -z-10 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-teal-400/40 to-green-500/40 rounded-xl blur-xl opacity-50 dark:opacity-40 animate-pulse-slow"></div>
        </div>

        {/* Table container */}
        <div className="relative w-full rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200/50 dark:border-gray-700/50">
                <th
                  className="py-4 px-6 font-medium text-left cursor-pointer hover:text-teal-500 transition-colors"
                  onClick={() => requestSort("market_cap_rank")}
                >
                  <div className="flex items-center">
                    # {getSortIcon("market_cap_rank")}
                  </div>
                </th>
                <th className="py-4 px-6 font-medium text-left">Coin</th>
                <th
                  className="py-4 px-6 font-medium text-left cursor-pointer hover:text-teal-500 transition-colors"
                  onClick={() => requestSort("current_price")}
                >
                  <div className="flex items-center">
                    Price {getSortIcon("current_price")}
                  </div>
                </th>
                <th
                  className="py-4 px-6 font-medium text-right cursor-pointer hover:text-teal-500 transition-colors"
                  onClick={() => requestSort("price_change_percentage_24h")}
                >
                  <div className="flex items-center justify-end">
                    24h {getSortIcon("price_change_percentage_24h")}
                  </div>
                </th>
                <th
                  className="py-4 px-6 font-medium text-right cursor-pointer hover:text-teal-500 transition-colors"
                  onClick={() => requestSort("market_cap")}
                >
                  <div className="flex items-center justify-end">
                    Market Cap {getSortIcon("market_cap")}
                  </div>
                </th>
                <th className="py-4 px-6 font-medium text-right">Supply</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
              {currentData.map((crypto, index) => {
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
                      {index + 1 + (currentPage - 1) * itemsPerPage}
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
                      ${formatPrice(crypto.current_price)}
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

          {/* Paginare */}
          <div className="flex justify-between items-center py-4 px-6 bg-teal-50 dark:bg-teal-900/10 rounded-b-xl">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Items per page:
              </span>
              <select
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-teal-500 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-teal-500 text-white rounded-md shadow-sm hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-teal-500 text-white rounded-md shadow-sm hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CryptoTable;
