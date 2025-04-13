const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const ETHERSCAN_API_KEY = process.env.API_KEY_ETH;

const whaleWallets = [
  {
    name: "Binance",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    blockchain: "ETH",
    apiKey: ETHERSCAN_API_KEY,
  },
  // Adaugă altele aici
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getBlockNumberByTimestamp = async (timestamp) => {
  const url = `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${ETHERSCAN_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data?.status === "1" ? data.result : null;
};

const getWhaleTransactionsFromEtherscan = async (
  page,
  filterValue,
  startBlock
) => {
  const allTx = [];

  for (let i = 0; i < whaleWallets.length; i++) {
    const { address, apiKey, blockchain, name } = whaleWallets[i];
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&page=${page}&offset=100&sort=desc&apikey=${apiKey}`;

    await delay(200); // pentru rate-limit

    const response = await fetch(url);
    const json = await response.json();

    if (json?.status === "1") {
      const filtered = json.result.filter(
        (tx) => parseFloat(tx.value) > 10 ** 18 * filterValue
      );

      const mapped = filtered.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value / 10 ** 18,
        blockchain,
        exchange: name,
        date: new Date(tx.timeStamp * 1000).toLocaleString(),
        timeStamp: tx.timeStamp,
      }));

      allTx.push(...mapped);
    }
  }

  return allTx;
};

module.exports = {
  getWhaleTransactionsFromEtherscan,
  getBlockNumberByTimestamp,
};
