import React, { useEffect, useState, useRef } from "react";
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
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [tooManyRequests, setTooManyRequests] = useState(false);
  const lastRequestTimeRef = useRef(0); // Folosim useRef pentru lastRequestTime

  useEffect(() => {
    const now = Date.now();

    // Blochează cererile dacă se apasă prea repede
    if (now - lastRequestTimeRef.current < 3000) {
      setTooManyRequests(true);
      setTimeout(() => setTooManyRequests(false), 2000);
      return;
    }

    lastRequestTimeRef.current = now; // Actualizăm lastRequestTimeRef
    setLoading(true);
    setError(null);

    const fetchHistoricalData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay de 1 secundă

        const response = await fetch(
          `http://localhost:5000/api/altcoin-season-chart?coinId=${coin.id}`
        );

        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.prices) {
          throw new Error("Invalid data format: prices not found");
        }

        const formattedData = data.prices.map((priceData) => ({
          date: new Date(priceData[0]).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          }),
          price: priceData[1].toFixed(2),
        }));

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching historical data:", error);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, [coin.id]); // Doar depindem de coin.id

  if (tooManyRequests) {
    return (
      <div className="w-96 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-lg shadow-lg">
        <p>⚠️ Too many requests... slow down!</p>
      </div>
    );
  }

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
  const margin = priceRange * 0.05;
  const yDomain = [Math.max(0, minPrice - margin), maxPrice + margin];

  return (
    <div
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
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {coin.name}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        Price Change: {coin.priceChange > 0 ? "+" : ""}
        {coin.priceChange.toFixed(2)}%
      </p>
      <img
        src={coin.image}
        alt={coin.name}
        className="w-12 h-12 rounded-full mb-4"
      />

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
              tickFormatter={(value) => `$${parseFloat(value).toFixed(2)}`}
              tick={{ fill: "#666", fontSize: 10 }}
              axisLine={{ stroke: "#666" }}
              domain={yDomain}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
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
    </div>
  );
};

export default AltcoinChart;
