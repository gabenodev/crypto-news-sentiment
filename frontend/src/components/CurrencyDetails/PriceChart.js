import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  ReferenceLine,
} from "recharts";

function PriceChart({ coinId }) {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/altcoin-season-chart?coinId=${coinId}&days=${days}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        if (data && Array.isArray(data.prices)) {
          const priceChartData = data.prices.map((item) => ({
            time: new Date(item[0]).toLocaleString(),
            price: item[1],
          }));
          setPriceData(priceChartData);
        } else {
          throw new Error("Data is not in expected format");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [coinId, days]);

  if (loading) {
    return <div>Loading...</div>;
  }

  const minPrice = Math.min(...priceData.map((item) => item.price));
  const maxPrice = Math.max(...priceData.map((item) => item.price));

  const roundedMinPrice = Math.floor(minPrice * 0.99);
  const roundedMaxPrice = Math.ceil(maxPrice * 1.01);

  const movingAverage = (data, period) => {
    return data.map((item, index) => {
      if (index < period - 1) return item;
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, val) => acc + val.price, 0);
      return { ...item, movingAverage: sum / period };
    });
  };

  const dataWithMovingAverage = movingAverage(priceData, 12); // Media mobilă pe 30 de puncte

  return (
    <div style={{ width: "90%", margin: "0 auto" }}>
      <select
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        style={{ marginBottom: "20px", padding: "5px", fontSize: "14px" }}
      >
        <option value={365}>1 Year</option>
        <option value={30}>30 Days</option>
        <option value={7}>7 Days</option>
        <option value={1}>1 Day</option>
      </select>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart
          data={dataWithMovingAverage}
          margin={{ top: 20, right: 50, left: 20, bottom: 10 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#23d996" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#23d996" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="time"
            tick={{ fill: "#555", fontSize: 12 }}
            tickFormatter={(time) => new Date(time).toLocaleDateString()}
            interval={Math.floor(priceData.length / 5)}
          />
          <YAxis
            tick={{ fill: "#555", fontSize: 12 }}
            domain={[roundedMinPrice, roundedMaxPrice]}
            tickFormatter={(price) => `$${price.toFixed(2)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#333",
              border: "none",
              borderRadius: "5px",
              color: "#fff",
            }}
            labelFormatter={(time) =>
              `Data: ${new Date(time).toLocaleString()}`
            }
            formatter={(price) => [`Price: $${price.toFixed(2)}`]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke="#23d996"
            fill="url(#priceGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8, fill: "#23d996" }}
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#23d996"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8, fill: "#23d996" }}
            animationDuration={1000}
          />
          <Line
            type="monotone"
            dataKey="movingAverage"
            stroke="#ff7300"
            strokeDasharray="5 5"
            strokeWidth={2}
            dot={false}
            animationDuration={1000}
          />
          <ReferenceLine
            y={(maxPrice + minPrice) / 2}
            stroke="#8884d8"
            strokeDasharray="3 3"
            label={{
              value: `$${((maxPrice + minPrice) / 2).toFixed(2)}`,
              position: "insideTopRight",
              fill: "#8884d8",
              fontSize: 12,
              offset: 5,
            }}
          />
          <ReferenceLine
            y={maxPrice}
            stroke="#ff4d4f"
            strokeDasharray="3 3"
            label={{
              value: `$${maxPrice.toFixed(2)}`,
              position: "insideTopRight",
              fill: "#ff4d4f",
              fontSize: 12,
              offset: 5,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;
