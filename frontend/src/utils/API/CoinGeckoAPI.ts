import axios from "axios";
import type { WhaleTransactionsResponse } from "../../types"; // Importa tipul pentru răspunsul de la API
import type { Cryptocurrency } from "../../types"; // Importa tipul pentru criptomonede
import { excludedCoins } from "../excludedCoins";

const API_BASE_URL = "https://sentimentxv2-project.vercel.app/api"; // Adresa de bază a API-ului

// Fetch pentru Market Dominance
export const fetchMarketDominance = async () => {
  const response = await axios.get(`${API_BASE_URL}/market-dominance`);
  return response.data;
};

// Fetch pentru toate criptomonedele
export const fetchAllCryptosData = async (): Promise<Cryptocurrency[]> => {
  // Returnează un array de Cryptocurrency
  try {
    const response = await fetch(`${API_BASE_URL}/api/all-cryptos`);
    const data: Cryptocurrency[] = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all cryptos data:", error);
    throw new Error(
      "Failed to load cryptocurrency data. Please try again later."
    );
  }
};

// Fetch pentru Altcoin Season Chart
export const fetchAltcoinSeasonChartData = async () => {
  const response = await axios.get(`${API_BASE_URL}/altcoin-season-chart`);
  return response.data;
};

// Fetch pentru detalii despre o criptomonedă
export const fetchCoinData = async (coinId: string) => {
  const response = await axios.get(`${API_BASE_URL}/coin-data/${coinId}`);
  return response.data;
};

// Fetch pentru Trending Coins
export const fetchTrendingCoins = async () => {
  const response = await axios.get(`${API_BASE_URL}/trending`);
  return response.data;
};

// Fetch pentru rezultate căutare
export const fetchSearchResults = async (query: string) => {
  const response = await axios.get(`${API_BASE_URL}/search`, {
    params: { query },
  });
  return response.data;
};

// Fetch pentru Whale Transactions
export const fetchWhaleTransactions = async (
  page = 1,
  threshold = 1000
): Promise<WhaleTransactionsResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/whale-transactions`, {
      params: { page, threshold },
    });

    return {
      transactions: response.data.transactions || [],
      totalPages: response.data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching whale transactions:", error);
    return {
      transactions: [],
      totalPages: 1,
    };
  }
};

export const fetchCryptoData = async (page = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all-cryptos`, {
      params: { per_page: page * 100 },
    });

    const data: Cryptocurrency[] = response.data;

    // Filtrare și sortare a criptomonedelor
    const filteredData = data
      .filter((coin) => !excludedCoins.has(coin.id)) // Excludere monede
      .sort((a, b) => a.market_cap_rank - b.market_cap_rank); // Sortare după rank

    return filteredData;
  } catch (error) {
    console.error("Error fetching crypto data:", error);
    throw new Error("Failed to fetch cryptocurrency data");
  }
};

export const fetchTopMoversData = async (page = 1) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all-cryptos`, {
      params: { per_page: page * 100 },
    });

    const data: Cryptocurrency[] = response.data;

    // Sortează criptomonedele pentru Top Movers (scădere în funcție de schimbarea procentuală a prețului în ultimele 24h)
    const sortedTopMovers = [...data]
      .sort(
        (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
      )
      .slice(0, 5); // Ia doar primele 5

    // Sortează criptomonedele pentru Top Losers (creștere în funcție de schimbarea procentuală a prețului în ultimele 24h)
    const sortedTopLosers = [...data]
      .sort(
        (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
      )
      .slice(0, 5); // Ia doar primele 5

    return { topMovers: sortedTopMovers, topLosers: sortedTopLosers };
  } catch (error) {
    console.error("Error fetching top movers data:", error);
    throw new Error("Failed to fetch top movers data");
  }
};

// Fetch market data for a specific coin
export const fetchMarketData = async (coinId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/all-cryptos`);
    const data = response.data;

    const coinData = data.find((coin: any) => coin.id === coinId);
    if (!coinData) {
      throw new Error("Coin not found in market data");
    }

    return {
      market_cap: coinData.market_cap,
      rank: coinData.market_cap_rank,
      volume: coinData.total_volume,
      ath: coinData.ath,
      atl: coinData.atl,
    };
  } catch (error) {
    console.error("Error fetching market data:", error);
    return {
      market_cap: null,
      rank: null,
      volume: null,
      ath: null,
      atl: null,
    };
  }
};

// Fetch historical price data for a coin
export const fetchHistoricalData = async (coinId: string, days: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/altcoin-season-chart`, {
      params: { coinId, days },
    });

    if (!response.data || !response.data.prices) {
      throw new Error("Invalid data format: prices not found");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    throw error;
  }
};

// Fetch Bitcoin data from CoinGecko
export const fetchBitcoinData = async () => {
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/bitcoin`
    );
    return {
      price_change_percentage_24h:
        response.data.market_data.price_change_percentage_24h,
    };
  } catch (error) {
    console.error("Failed to fetch Bitcoin data", error);
    return null;
  }
};
