import React from "react";
import { motion } from "framer-motion";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function CryptoTable({ cryptoData }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse select-none">
        <thead className="bg-gray-100 dark:bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-300 dark:border-gray-700">
          <tr className="text-lg text-gray-700 dark:text-gray-300">
            {["#", "Name", "Price", "24h Change", "Market Cap", "Supply"].map(
              (header) => (
                <th
                  key={header}
                  className={`py-4 px-6 font-semibold ${
                    header === "24h Change"
                      ? "text-right pr-8"
                      : header === "Market Cap" || header === "Supply"
                      ? "text-right pr-12"
                      : "text-left"
                  }`}
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="bg-gray-100 dark:bg-gradient-to-r from-gray-900 to-gray-800">
          {cryptoData.map((crypto) => {
            const maxSupply = crypto.max_supply || crypto.total_supply;
            const progress = (crypto.circulating_supply / maxSupply) * 100;

            return (
              <motion.tr
                key={crypto.id}
                className="border-b border-gray-300 dark:border-gray-700"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                onClick={() => navigate(`/currencies/${crypto.id}`)}
              >
                <td className="py-5 px-6 text-gray-800 dark:text-gray-200 font-medium">
                  #{crypto.market_cap_rank}
                </td>
                <td className="py-5 px-6 flex items-center space-x-3">
                  <img
                    src={crypto.image}
                    alt={crypto.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-gray-900 dark:text-gray-200 font-medium">
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </span>
                </td>
                <td className="py-5 px-6 text-gray-900 dark:text-gray-200 font-medium">
                  ${crypto.current_price.toLocaleString()}
                </td>
                <td
                  className={`py-5 px-6 font-medium text-right pr-8 flex items-center justify-end ${
                    crypto.price_change_percentage_24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {crypto.price_change_percentage_24h >= 0 ? (
                    <FaArrowUp className="mr-2" />
                  ) : (
                    <FaArrowDown className="mr-2" />
                  )}
                  {crypto.price_change_percentage_24h.toFixed(2)}%
                </td>
                <td className="py-5 px-6 text-gray-900 dark:text-gray-200 font-medium text-right pr-12">
                  ${crypto.market_cap.toLocaleString()}
                </td>
                <td className="py-5 px-6 text-right pr-12">
                  {progress >= 100 ? (
                    <span className="text-gray-600 dark:text-gray-400">
                      {crypto.circulating_supply.toLocaleString()}
                    </span>
                  ) : (
                    <>
                      <div className="w-full bg-gray-300 rounded-full h-2.5">
                        <motion.div
                          className="h-2.5 rounded-full"
                          style={{
                            width: `${progress.toFixed(2)}%`,
                            background:
                              "linear-gradient(to right, #38b2ac, #48bb78)",
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress.toFixed(2)}%` }}
                          transition={{ duration: 1 }}
                        ></motion.div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-teal-500">
                          {progress.toFixed(2)}%
                        </span>
                      </div>
                    </>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default CryptoTable;
