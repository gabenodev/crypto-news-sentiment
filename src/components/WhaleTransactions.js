import { useState, useEffect } from "react";
import { FaEthereum, FaBitcoin } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const whaleWallets = {
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e": "Binance",
  "0x5d69c5e4727f0d2f6b8a64358d9e4c8981b9bb6f": "Coinbase",
  "0x7a80d8d3d77222b9f6889b5e8b6a7ef5d7f086df": "PancakeSwap",
  "0x9e8cb2fae327d2a22b5d1e9db1734f97511fba9f": "FTX",
  "0x33B8a63B32F62603BB537E33E5981D029bf99a51": "Bitfinex",
  // adăugați mai multe adrese ale exchange-urilor importante aici
};

const WhaleTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // Pagina curentă
  const [totalPages, setTotalPages] = useState(1); // Numărul total de pagini

  const fetchWhaleTransactions = async (page) => {
    const API_KEY_ETH = "RP1AAGBP2YNUWFTAFP6KWT7GRRKC5BG5MM"; // Înlocuiește cu cheia ta Etherscan
    const API_KEY_BSC = "P51M4PQJ9KBGFGNXJFUETUJ2HSNJ98Y26T"; // Înlocuiește cu cheia ta BscScan

    const wallets = [
      {
        name: "Binance",
        address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        blockchain: "ETH",
        apiKey: API_KEY_ETH,
      },
      {
        name: "Coinbase",
        address: "0x5d69c5e4727f0d2f6b8a64358d9e4c8981b9bb6f",
        blockchain: "ETH",
        apiKey: API_KEY_ETH,
      },
      {
        name: "PancakeSwap",
        address: "0x7a80d8d3d77222b9f6889b5e8b6a7ef5d7f086df",
        blockchain: "BSC",
        apiKey: API_KEY_BSC,
      },
      {
        name: "FTX",
        address: "0x9e8cb2fae327d2a22b5d1e9db1734f97511fba9f",
        blockchain: "ETH",
        apiKey: API_KEY_ETH,
      },
    ];

    const allTransactions = [];

    for (let wallet of wallets) {
      const { address, blockchain, apiKey, name } = wallet;
      const url =
        blockchain === "ETH"
          ? `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=100&sort=desc&apikey=${apiKey}`
          : `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=100&sort=desc&apikey=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(data);

        if (data.status === "1") {
          // Filtrează tranzacțiile (converteste hexazecimal în număr)
          const filteredTransactions = data.result.filter(
            (tx) => parseFloat(tx.value) > 10 ** 18
          );

          const transactionsWithData = filteredTransactions.map((tx) => {
            let exchange = "Unknown";

            // Verificăm 'from' și 'to' pentru a atribui exchange-ul
            if (whaleWallets[tx.from]) {
              exchange = whaleWallets[tx.from];
            } else if (whaleWallets[tx.to]) {
              exchange = whaleWallets[tx.to];
            }

            return {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              value: tx.value / 10 ** 18,
              blockchain,
              exchange,
              date: new Date(tx.timeStamp * 1000).toLocaleString(),
              fee: tx.gasUsed ? (tx.gasUsed * tx.gasPrice) / 10 ** 18 : "N/A",
              block: tx.blockNumber,
              age: formatDistanceToNow(new Date(tx.timeStamp * 1000)),
              icon:
                blockchain === "ETH" ? (
                  <FaEthereum className="text-cyan-400 text-xl" />
                ) : (
                  <FaBitcoin className="text-yellow-400 text-xl" />
                ),
            };
          });

          allTransactions.push(...transactionsWithData);
        } else {
          console.error(`No transactions found for wallet: ${name}`);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    }

    // Calculează numărul total de pagini
    const totalFilteredTransactions = allTransactions.length;
    const totalPages = Math.ceil(totalFilteredTransactions / 10);
    setTotalPages(totalPages);

    // Limitează tranzacțiile la 10 pe pagină
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

    setTransactions(paginatedTransactions);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true); // Afișează mesajul de încărcare când se schimbă pagina
    fetchWhaleTransactions(page);
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
      {loading ? (
        <p className="text-center text-xl text-gray-600 dark:text-gray-400">
          Loading transactions...
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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
