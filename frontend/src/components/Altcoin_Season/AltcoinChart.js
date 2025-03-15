import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Funcție helper pentru formatarea prețului
const formatPrice = (price) => {
  if (price < 0.001) {
    return price.toFixed(6); // Afișează 6 zecimale pentru prețuri foarte mici
  }
  return price.toFixed(2); // Afișează 2 zecimale pentru prețuri mai mari
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const fullDate = dataPoint.fullDate.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-900 dark:text-white">
          <strong>Date:</strong> {fullDate}
        </p>
        <p className="text-sm text-gray-900 dark:text-white">
          <strong>Price:</strong> ${formatPrice(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

const AltcoinChart = ({ coin, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [marketCap, setMarketCap] = useState(null);
  const [rank, setRank] = useState(null);

  const fetchMarketData = async (coinId) => {
    try {
      const response = await fetch(
        `https://sentimentx-backend.vercel.app/api/altcoin-season`
      );
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      const data = await response.json();

      // Găsim moneda specifică după `coinId`
      const coinData = data.find((coin) => coin.id === coinId);
      if (!coinData) {
        throw new Error("Coin not found in market data");
      }

      return {
        market_cap: coinData.market_cap,
        rank: coinData.market_cap_rank,
      };
    } catch (error) {
      console.error("Error fetching market data:", error);
      return { market_cap: null, rank: null };
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        // Fetch historical data
        const historicalResponse = await fetch(
          `https://sentimentx-backend.vercel.app/api/altcoin-season-chart?coinId=${coin.id}`
        );
        if (!historicalResponse.ok) {
          throw new Error(
            `Server returned status: ${historicalResponse.status}`
          );
        }
        const historicalData = await historicalResponse.json();
        if (!historicalData || !historicalData.prices) {
          throw new Error("Invalid data format: prices not found");
        }

        const formattedData = historicalData.prices.map((priceData) => ({
          date: new Date(priceData[0]).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          }),
          price: priceData[1], // Păstrează valoarea originală fără formatare
          fullDate: new Date(priceData[0]),
        }));
        setChartData(formattedData);

        // Fetch market cap and rank
        const { market_cap, rank } = await fetchMarketData(coin.id);
        setMarketCap(market_cap);
        setRank(rank);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Too many requests. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coin.id]);

  if (loading) {
    return (
      <div className="w-96 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <p className="text-gray-700 dark:text-gray-300">⏳ Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-96 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg shadow-lg">
        <p>❌ {error}</p>
      </div>
    );
  }

  const prices = chartData.map((data) => parseFloat(data.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  const margin = priceRange * 0.1; // Adaugă un margin de 10% pentru a evita comprimarea graficului
  const yDomain = [Math.max(0, minPrice - margin), maxPrice + margin];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className={`${
          isExpanded ? "w-[600px]" : "w-96"
        } p-4 bg-white dark:bg-gray-900 shadow-lg rounded-lg flex flex-col`}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300"
          >
            Close
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-700 dark:text-white hover:text-gray-900 dark:hover:text-gray-300"
          >
            {isExpanded ? "Minimize" : "Expand"}
          </button>
        </div>
        <div className="flex items-center mb-2">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {coin.name}
          </h2>
          <img
            src={coin.image}
            alt={coin.name}
            className="w-8 h-8 rounded-full ml-2"
          />
        </div>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          Price Change:{" "}
          <span style={{ color: coin.priceChange > 0 ? "#16a34a" : "#dc2626" }}>
            {coin.priceChange > 0 ? "+" : ""}
            {coin.priceChange.toFixed(2)}%
          </span>
        </p>
        {marketCap !== null && rank !== null && (
          <>
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              <strong>Rank</strong> #{rank}
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              <strong>Market Cap:</strong> ${marketCap.toLocaleString()}
            </p>
          </>
        )}

        <div className="flex-1">
          <ResponsiveContainer width="100%" height={isExpanded ? 400 : 200}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="none"
                stroke="#eee"
                vertical={false}
                horizontal={false}
              />
              <XAxis
                dataKey="date"
                tick={{
                  fill: "#666",
                  fontSize: 10,
                  angle: 0,
                  textAnchor: "middle",
                }}
                interval={Math.floor(chartData.length / 7)}
                axisLine={{ stroke: "#666" }}
              />
              <YAxis
                tickFormatter={(value) => `$${formatPrice(value)}`} // Folosește funcția formatPrice
                tick={{ fill: "#666", fontSize: 10 }}
                axisLine={{ stroke: "#666" }}
                domain={yDomain}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#23d996"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AltcoinChart;
