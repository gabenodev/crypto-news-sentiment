// Import dinamic pentru a evita eroarea legată de module ESM vs CommonJS
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// API Key pentru Etherscan
const ETHERSCAN_API_KEY = process.env.API_KEY_ETH;

// Lista de wallet-uri cunoscute (poți adăuga mai multe)
const whaleWallets = require("../utils/helper/whaleWallets");

// Funcție helper pentru delay între request-uri (pentru a evita rate-limit)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Obține block-ul de la un timestamp (folosit pentru a limita căutarea în timp)
const getBlockNumberByTimestamp = async (timestamp) => {
  const url = `https://api.etherscan.io/api?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=before&apikey=${ETHERSCAN_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data?.status === "1" ? data.result : null;
};

// Obține tranzacțiile mari de la wallet-urile definite
const getWhaleTransactionsFromEtherscan = async (filterValue, startBlock) => {
  const allTx = [];

  // Iterăm prin fiecare wallet mare
  for (let i = 0; i < whaleWallets.length; i++) {
    const { address, apiKey, blockchain, name } = whaleWallets[i];

    // Construim URL-ul pentru apelul către Etherscan API
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=99999999&page=1&offset=100&sort=desc&apikey=${apiKey}`;

    // Așteptăm 300ms între request-uri pentru a evita rate-limit
    await delay(300);

    // Apelăm API-ul și parcurgem datele
    const response = await fetch(url);
    const json = await response.json();

    // Dacă status-ul e OK, filtrăm tranzacțiile după valoare minimă (ex: >10 ETH)
    if (json?.status === "1") {
      const filtered = json.result.filter(
        (tx) => parseFloat(tx.value) > 10 ** 18 * filterValue
      );

      // Formatăm datele pentru frontend
      const mapped = filtered.map((tx) => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value / 10 ** 18, // conversie din wei în ETH
        blockchain,
        exchange: name,
        date: new Date(tx.timeStamp * 1000).toLocaleString(),
        timeStamp: tx.timeStamp,
      }));

      // Adăugăm tranzacțiile în lista finală
      allTx.push(...mapped);
    }
  }

  return allTx;
};

module.exports = {
  getWhaleTransactionsFromEtherscan,
  getBlockNumberByTimestamp,
};
