import { useState, useEffect } from "react";
import { fetchWhaleTransactions } from "./EthScan";

const WhaleTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Pagina curentă
  const [totalPages, setTotalPages] = useState(1); // Numărul total de pagini

  const loadTransactions = async (page) => {
    setLoading(true);
    const { transactions: fetchedTransactions, totalPages: fetchedTotalPages } =
      await fetchWhaleTransactions(page, 100); // Filtrează tranzacții mai mari de 1000 ETH
    setTransactions(fetchedTransactions);
    setTotalPages(fetchedTotalPages);
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions(page);
  }, [page]);

  // Functie pentru trunchierea adreselor și a hash-urilor
  const truncate = (str) => {
    return str.length > 15 ? `${str.slice(0, 6)}...${str.slice(-4)}` : str;
  };

  return (
    <div className="container mx-auto p-6 dark:bg-gray-900 dark:text-white">
      <h2
        className="text-3xl font-bold text-center mb-8 
    text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
    dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-teal-300 dark:to-green-400"
      >
        Whale Transactions
      </h2>

      {/* Bara orizontală */}
      <hr className="border-t border-gray-200 dark:border-gray-700 mb-8" />

      {loading ? (
        <p className="text-center text-xl text-gray-600 dark:text-gray-400">
          Loading transactions...
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg p-6">
          {transactions.length > 0 ? (
            <div className="space-y-2">
              {transactions.map((tx, index) => (
                <div
                  key={index}
                  className="p-3 border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex justify-center items-center">
                        {tx.icon}
                      </div>
                      <div>
                        <div className="font-semibold text-md text-gray-800 dark:text-gray-200">
                          {tx.exchange} Transaction
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {tx.age} ago
                        </div>
                      </div>
                    </div>
                    <div>
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        className="text-cyan-500 hover:text-cyan-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View on Etherscan
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <strong>From:</strong>{" "}
                      <a
                        href={`https://etherscan.io/address/${tx.from}`}
                        className="text-cyan-500 hover:text-cyan-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {truncate(tx.from)}
                      </a>
                    </div>
                    <div>
                      <strong>To:</strong>{" "}
                      <a
                        href={`https://etherscan.io/address/${tx.to}`}
                        className="text-cyan-500 hover:text-cyan-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {truncate(tx.to)}
                      </a>
                    </div>
                    <div>
                      <strong>Amount:</strong> {tx.value}{" "}
                      {tx.blockchain === "ETH" ? "ETH" : "BNB"}
                    </div>
                    <div>
                      <strong>Block:</strong> {tx.block}
                    </div>
                    <div>
                      <strong>Fee:</strong> {tx.fee} ETH
                    </div>
                    <div>
                      <strong>Hash:</strong>{" "}
                      <a
                        href={`https://etherscan.io/tx/${tx.hash}`}
                        className="text-cyan-500 hover:text-cyan-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {truncate(tx.hash)}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xl text-gray-600 dark:text-gray-400">
              No large transactions available at the moment.
            </p>
          )}

          {/* Butoane de paginare */}
          <div className="flex justify-center mt-6 space-x-4">
            <button
              onClick={() => setPage(1)} // Revino la pagina 1
              disabled={page === 1}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
              First Page
            </button>
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg disabled:bg-gray-300 dark:disabled:bg-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WhaleTransactions;
