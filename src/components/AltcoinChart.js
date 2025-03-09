import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AltcoinChart = ({ coin, onClose }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=7`
        );
        const data = await response.json();

        // Transformăm datele primite într-un format corect pentru Recharts
        const formattedData = data.prices.map((priceData) => ({
          date: new Date(priceData[0]).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          }), // Format: DD/MM
          price: priceData[1].toFixed(2), // Prețul cu 2 zecimale
        }));

        // Setăm datele
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching historical data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [coin.id]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        className="fixed top-0 right-0 h-full w-1/3 bg-white dark:bg-gray-800 shadow-lg p-6"
      >
        <button
          onClick={onClose}
          className="text-gray-700 dark:text-white mb-4"
        >
          Close
        </button>
        <p className="text-gray-700 dark:text-gray-300">Loading chart...</p>
      </motion.div>
    );
  }

  // Calculăm minimul și maximul pentru axa Y
  const prices = chartData.map((data) => parseFloat(data.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Ajustăm domeniul Y cu un factor de scalare
  const priceRange = maxPrice - minPrice;
  const margin = priceRange * 0.05; // 5% marjă de ajustare

  // Setăm domeniul pe baza min și max cu marja adăugată
  const yDomain = [
    Math.max(0, minPrice - margin), // Adăugăm marja de jos
    maxPrice + margin, // Adăugăm marja de sus
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed top-0 right-0 h-full w-1/3 bg-white dark:bg-gray-800 shadow-lg p-6"
    >
      <button onClick={onClose} className="text-gray-700 dark:text-white mb-4">
        Close
      </button>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {coin.name}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        Price Change: {coin.priceChange > 0 ? "+" : ""}
        {coin.priceChange.toFixed(2)}%
      </p>
      <img
        src={coin.image}
        alt={coin.name}
        className="w-16 h-16 rounded-full mb-6"
      />

      {/* Graficul */}
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            {/* Eliminăm dungi punctate și grila de fundal */}
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
                fontSize: 12,
                angle: 0, // Fără unghi
                textAnchor: "middle", // Alinierea orizontală
              }}
              interval={Math.floor(chartData.length / 7)} // Setăm intervalul la aproximativ o etichetă pe zi
              axisLine={{ stroke: "#666" }}
            />
            <YAxis
              tickFormatter={(value) => `$${parseFloat(value).toFixed(2)}`} // Formatarea valorilor de pe axa Y
              tick={{ fill: "#666", fontSize: 12 }}
              axisLine={{ stroke: "#666" }}
              domain={yDomain} // Setăm domeniul pentru axa Y
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
            {/* Eliminăm legenda */}
            {/* <Legend /> */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#23d996" // Culoare turcoaz
              strokeWidth={3}
              dot={false} // Elimină punctele de pe grafic
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default AltcoinChart;
