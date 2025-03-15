import { FaEthereum, FaBitcoin } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const whaleWallets = {
  // Adrese Ethereum - Exchange-uri
  "0x742d35cc6634c0532925a3b844bc454e4438f44e": "Binance",
  "0x28c6c06298d514db089934071355e5743bf21d60": "Binance 3",
  "0x21a31ee1afc51d94c2efccaa2092ad1028285549": "Binance 4",
  "0x56eddb7aa87536c09ccc2793473599fd21a8b17f": "Bitfinex",
  "0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec": "Bitfinex 2",
  "0x5a52e96bacdabb82fd05763e25335261b270efcb": "Binance 2",
  "0x6cc5f688a315f3dc28a7781717a9a798a59fda7b": "OKX",
  "0xe92d1a43df510f82c66382592a047d288f85226f": "OKX 2",
  "0xa7efae728d2936e78bda97dc267687568dd593f3": "OKX 3",
  "0x2faf487a4414fe77e2327f0bf4ae2a264a776ad2": "FTX",
  "0xc098b2a3aa256d2140208c3de6543aaef5cd3a94": "FTX 2",
  "0x1b3cb81e51011b549d78bf720b0d924ac763a7c2": "Bybit",
  "0x1b5b4e441f16a93837710f6405359c1b1a67715d": "Bybit 2",
  "0x7155d7a4e4a8a0e9a793bfb3f2b2c0b1026a78b9": "Bybit 3",
  "0xee5b5b923ffce93a870b3104b7ca09c3db80047a": "Bybit 4",
  "0xf89d7b9c864f589bbf53a82105107622b35eaa40": "Bybit 5",
  "0x3f5ce5fbfe3e9af3971dd833d26ba9b5c936f0be": "Binance 5",
  "0x34ea4138580435b5a521e460035edb19df1938c1": "Kraken",
  "0x53d284357ec70ce289d6d64134dfac8e511c8a3d": "Kraken 2",
  "0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e": "Crypto.com",
  "0x6262998ced04146fa42253a5c0af90ca02dfd2a3": "Crypto.com 2",
  "0x46340b20830761efd32832a74d7169b29feb9758": "Huobi",
  "0x5c985e89dde482efe97ea9f1950ad149eb73829b": "Huobi 2",
  "0xdc76cd25977e0a5ae17155770273ad58648900d3": "KuCoin",
  "0x2b5634c42055806a59e9107ed44d43c426e58258": "KuCoin 2",

  // Adrese Ethereum - Alte entități
  "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae": "Ethereum Foundation",
  "0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208": "Gemini",
  "0x4fabb145d64652a948d72533023f6e7a623c7c53": "Binance USD (BUSD) Issuer",
  "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503": "Binance 6",
  "0xeb2d2f1b8c558a40207669291fda468e50c8a0bb": "Binance 7",
  "0x876eabf441b2ee5b5b7374e7089458496b04279b": "Bitstamp",
  "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8": "F2Pool",
  "0x9bf4001d307dfd62b5a8a31d6b5f5d0f5e4d1a0c": "Nexo",
  "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67": "BlockFi",
};

export const fetchWhaleTransactions = async (page, filterValue) => {
  const API_KEY_ETH = "RP1AAGBP2YNUWFTAFP6KWT7GRRKC5BG5MM"; // Înlocuiește cu cheia ta Etherscan
  // const API_KEY_BSC = "P51M4PQJ9KBGFGNXJFUETUJ2HSNJ98Y26T"; // Înlocuiește cu cheia ta BscScan

  const wallets = [
    {
      name: "Binance",
      address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Binance 2",
      address: "0x5a52E96BAcdaBb82fd05763E25335261B270Efcb",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Binance 3",
      address: "0x28C6c06298d514Db089934071355E5743bf21d60",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bitfinex",
      address: "0x56Eddb7aa87536c09CCc2793473599fD21A8b17F",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bitfinex 2",
      address: "0x77134cbc06cb00b66f4c7e623d5fdbf6777635ec",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "OKX",
      address: "0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "OKX 2",
      address: "0xE92d1A43df510F82C66382592a047d288f85226f",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "OKX 3",
      address: "0xA7EFae728D2936e78BDA97dc267687568dD593f3",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "FTX",
      address: "0x2faf487A4414Fe77e2327F0bf4AE2a264a776AD2",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "FTX 2",
      address: "0xC098B2a3Aa256D2140208C3de6543aAEf5cd3A94",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bybit",
      address: "0x1b3cb81e51011b549d78bf720b0d924ac763a7c2",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bybit 2",
      address: "0x1b5b4e441f16a93837710f6405359c1b1a67715d",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bybit 3",
      address: "0x7155d7a4e4a8a0e9a793bfb3f2b2c0b1026a78b9",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bybit 4",
      address: "0xee5b5b923ffce93a870b3104b7ca09c3db80047a",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bybit 5",
      address: "0xf89d7b9c864f589bbF53a82105107622B35EaA40",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Binance 5",
      address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE",
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
      name: "Kraken 2",
      address: "0x53d284357ec70ce289d6d64134dfac8e511c8a3d",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Crypto.com",
      address: "0x6c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Crypto.com 2",
      address: "0x6262998ced04146fa42253a5c0af90ca02dfd2a3",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Huobi",
      address: "0x46340b20830761efd32832a74d7169b29feb9758",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Huobi 2",
      address: "0x5c985e89dde482efe97ea9f1950ad149eb73829b",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "KuCoin",
      address: "0xdc76cd25977e0a5ae17155770273ad58648900d3",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "KuCoin 2",
      address: "0x2b5634c42055806a59e9107ed44d43c426e58258",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Ethereum Foundation",
      address: "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Gemini",
      address: "0x2a0c0dbecc7e4d658f48e01e3fa353f44050c208",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Binance USD (BUSD) Issuer",
      address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Binance 6",
      address: "0x47ac0fb4f2d84898e4d9e7b4dab3c24507a6d503",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Binance 7",
      address: "0xeb2d2f1b8c558a40207669291fda468e50c8a0bb",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Bitstamp",
      address: "0x876eabf441b2ee5b5b7374e7089458496b04279b",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "F2Pool",
      address: "0xbe0eb53f46cd790cd13851d5eff43d12404d33e8",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "Nexo",
      address: "0x9bf4001d307dfd62b5a8a31d6b5f5d0f5e4d1a0c",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
    {
      name: "BlockFi",
      address: "0x4e9ce36e442e55ecd9025b9a6e0d88485d628a67",
      blockchain: "ETH",
      apiKey: API_KEY_ETH,
    },
  ];

  const allTransactions = [];

  // Calculează timestamp-ul pentru acum și acum minus 30 de zile
  const now = Math.floor(Date.now() / 1000); // Timestamp curent în secunde
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60; // Timestamp pentru acum 30 de zile

  // Funcție pentru a obține numărul block-ului corespunzător unui timestamp
  const getBlockNumberByTimestamp = async (timestamp) => {
    const url = `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${API_KEY_ETH}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Block number API response:", data); // Log răspunsul API-ului
      if (data.status === "1") {
        return data.result; // Returnează numărul block-ului
      } else {
        console.error("Error fetching block number:", data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching block number:", error);
      return null;
    }
  };

  // Obține numărul block-ului pentru acum 30 de zile
  const startBlock = await getBlockNumberByTimestamp(thirtyDaysAgo);
  if (!startBlock) {
    console.error("Could not fetch start block number.");
    return { transactions: [], totalPages: 0 };
  }

  // Funcție pentru a face un request cu delay
  const fetchWithDelay = async (url, delay) => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        try {
          const response = await fetch(url);
          const data = await response.json();
          console.log("Transaction API response:", data); // Log răspunsul API-ului
          resolve(data);
        } catch (error) {
          console.error("Error fetching transactions:", error);
          resolve(null);
        }
      }, delay);
    });
  };

  // Parcurge fiecare wallet cu un delay între request-uri
  for (let i = 0; i < wallets.length; i++) {
    const wallet = wallets[i];
    const { address, blockchain, apiKey, name } = wallet;

    // Construiește URL-ul cu startblock și endblock
    const url =
      blockchain === "ETH"
        ? `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&page=${page}&offset=100&sort=desc&apikey=${apiKey}`
        : `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&page=${page}&offset=100&sort=desc&apikey=${apiKey}`;

    // Așteaptă 200 ms între fiecare request pentru a nu depăși limita de 5 request-uri pe secundă
    const data = await fetchWithDelay(url, i * 200);

    if (data && data.status === "1") {
      const filteredTransactions = data.result.filter(
        (tx) => parseFloat(tx.value) > 10 ** 18 * filterValue
      );

      const transactionsWithData = filteredTransactions.map((tx) => {
        let exchange = "Unknown";
        const fromAddress = tx.from.toLowerCase();
        const toAddress = tx.to.toLowerCase();

        if (whaleWallets[fromAddress]) {
          exchange = whaleWallets[fromAddress];
        } else if (whaleWallets[toAddress]) {
          exchange = whaleWallets[toAddress];
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
          timeStamp: tx.timeStamp,
        };
      });

      allTransactions.push(...transactionsWithData);
    } else {
      console.error(`No transactions found for wallet: ${name}`);
    }
  }

  // Sortează tranzacțiile după dată (timeStamp)
  allTransactions.sort((a, b) => b.timeStamp - a.timeStamp);

  // Calculează numărul total de pagini
  const totalFilteredTransactions = allTransactions.length;
  const totalPages = Math.ceil(totalFilteredTransactions / 10);

  // Limitează tranzacțiile la 10 pe pagină
  const startIndex = (page - 1) * 10;
  const endIndex = startIndex + 10;
  const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

  return { transactions: paginatedTransactions, totalPages };
};
