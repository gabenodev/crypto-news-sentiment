const { getCachedData } = require("../services/cacheService");
const {
  getWhaleTransactionsFromEtherscan,
  getBlockNumberByTimestamp,
} = require("../services/ethScanService");

const getWhaleTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filterValue = parseFloat(req.query.filterValue) || 10;

    const cacheKey = `whale_tx_page_${page}_filter_${filterValue}`;
    const now = Math.floor(Date.now() / 1000);
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60;

    const data = await getCachedData(
      cacheKey,
      async () => {
        const startBlock = await getBlockNumberByTimestamp(thirtyDaysAgo);
        if (!startBlock) return { transactions: [], totalPages: 0 };

        const allTx = await getWhaleTransactionsFromEtherscan(
          page,
          filterValue,
          startBlock
        );
        allTx.sort((a, b) => b.timeStamp - a.timeStamp);

        const totalPages = Math.ceil(allTx.length / 10);
        const paginated = allTx.slice((page - 1) * 10, page * 10);

        return { transactions: paginated, totalPages };
      },
      600
    ); // cache 10 min

    res.json(data);
  } catch (err) {
    console.error("Error in getWhaleTransactions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getWhaleTransactions };
