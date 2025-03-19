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

function PriceChart({ coinId }) {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30); // Starea pentru intervalul de timp

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

        console.log("Fetched data:", data); // Verifică datele primite

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
  }, [coinId, days]); // Re-fetch data când coinId sau days se schimbă

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Dropdown pentru selectarea intervalului */}
      <select
        value={days}
        onChange={(e) => {
          console.log("Selected days:", e.target.value); // Verifică dacă valoarea se schimbă
          setDays(Number(e.target.value));
        }}
        style={{ marginBottom: "20px" }}
      >
        <option value={365}>1 Year</option>
        <option value={30}>30 Days</option>
        <option value={7}>7 Days</option>
        <option value={1}>1 Day</option>
      </select>

      {/* Graficul */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          key={days} // Forțează re-renderizarea când `days` se schimbă
          data={priceData}
          margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#666", fontSize: 12 }}
            tickFormatter={(time) => new Date(time).toLocaleDateString()}
          />
          <YAxis
            tick={{ fill: "#666", fontSize: 12 }}
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
            formatter={(price) => [`Preț: $${price.toFixed(2)}`, "Preț"]}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#8884d8"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;
