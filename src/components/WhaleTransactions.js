import { useState, useEffect } from "react";
import { FaEthereum, FaBitcoin } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const whaleWallets = {
  // Adrese Ethereum
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e": "Binance",
  "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb": "Binance 2",
  "0x28C6c06298d514Db089934071355E5743bf21d60": "Binance 3",
  "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549": "Binance 4",
  "0x56Eddb7aa87536c09CCc2793473599fD21A8b17F": "Bitfinex",
  "0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec": "Bitfinex 2",
  "0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b": "OKX",
  "0xE92d1A43df510F82C66382592a047d288f85226f": "OKX 2",
  "0xA7EFae728D2936e78BDA97dc267687568dD593f3": "OKX 3",
  "0x2faf487A4414Fe77e2327F0bf4AE2a264a776AD2": "FTX",
  "0xC098B2a3Aa256D2140208C3de6543aAEf5cd3A94": "FTX 2",
  "0x1b3cb81e51011b549d78bf720b0d924ac763a7c2": "Bybit",
  "0x1b5b4e441f16a93837710f6405359c1b1a67715d": "Bybit 2",
  "0x7155d7a4e4a8a0e9a793bfb3f2b2c0b1026a78b9": "Bybit 3",
  "0xee5b5b923ffce93a870b3104b7ca09c3db80047a": "Bybit 4",
  "0xf89d7b9c864f589bbF53a82105107622B35EaA40": "Bybit 5",
  "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE": "Binance 5",
  "0x34ea4138580435b5a521e460035edb19df1938c1": "Kraken",
  "0x53d284357ec70ce289d6d64134dfac8e511c8a3d": "Kraken 2",
  "0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e": "Crypto.com",
  "0x6262998ced04146fa42253a5c0af90ca02dfd2a3": "Crypto.com 2",
  "0x46340b20830761efd32832a74d7169b29feb9758": "Huobi",
  "0x5c985e89dde482efe97ea9f1950ad149eb73829b": "Huobi 2",
  "0xdc76cd25977e0a5ae17155770273ad58648900d3": "KuCoin",
  "0x2b5634c42055806a59e9107ed44d43c426e58258": "KuCoin 2",
  "0x00000000219ab540356cBB839Cbe05303d7705Fa": "Beacon Deposit Contract",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "wrapped Ether",
  "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8": "Binance 7",
  "0x49048044D57e1C92A77f79988d21Fa8fAF74E97e": "Base: Base Portal",
  "0x40B38765696e3d5d8d9d834D8AaD4bB6e418E489": "Robingood",
  "0x8315177aB297bA92A06054cE80a67Ed4DBd7ed3a": "Arbitrum: Bridge",
  "0x0E58e8993100F1CBe45376c410F97f4893d9BfCD": "Upbit 41",
  "0xF977814e90dA44bFA03b6295A0616a897441aceC": "Binance 20",
  "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503": "Binance-Peg Tokens",
  "0xbEb5Fc579115071764c7423A4f12eDde41f106Ed": "Optimism",

  // Adaugă mai multe adrese aici
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
      {
        name: "Kraken",
        address: "0x34ea4138580435b5a521e460035edb19df1938c1",
        blockchain: "ETH",
        apiKey: API_KEY_ETH,
      },
      {
        name: "Huobi",
        address: "0x46340b20830761efd32832a74d7169b29feb9758",
        blockchain: "ETH",
        apiKey: API_KEY_ETH,
      },
      // Adaugă mai multe wallet-uri aici
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
            (tx) => parseFloat(tx.value) > 10 ** 18 * 100 // Filtrează tranzacții mai mari de 100 ETH
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
