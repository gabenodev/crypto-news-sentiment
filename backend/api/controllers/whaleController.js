// Importăm serviciul de caching și funcțiile din ethScanService
const { getCachedData } = require("../services/cacheService");
const {
  getWhaleTransactionsFromEtherscan,
  getBlockNumberByTimestamp,
} = require("../services/ethScanService");

const getWhaleTransactions = async (req, res) => {
  try {
    // Valoarea minimă (în ETH) pentru filtrarea tranzacțiilor
    const filterValue = parseFloat(req.query.filterValue) || 100; // Default la 100 ETH

    // Cheie unică pentru caching în funcție de filtru
    const cacheKey = `whale_tx_filter_${filterValue}`;

    // Timpul actual (în secunde) și acum 30 de zile
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    // Verificăm dacă avem date în cache, altfel le obținem din API
    const data = await getCachedData(
      cacheKey,
      async () => {
        // Obținem block-ul de început pentru perioada de 30 de zile
        const startBlock = await getBlockNumberByTimestamp(thirtyDaysAgo);
        if (!startBlock) return { transactions: [] };

        // Obținem tranzacțiile de la toate wallet-urile mari
        const allTx = await getWhaleTransactionsFromEtherscan(
          filterValue,
          startBlock
        );

        // Sortăm descrescător după timestamp
        allTx.sort((a, b) => b.timeStamp - a.timeStamp);

        return { transactions: allTx };
      },
      600 // cache pentru 10 minute (600 secunde)
    );

    // Returnăm datele către frontend
    res.json(data);
  } catch (err) {
    console.error("Error in getWhaleTransactions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getWhaleTransactions };
