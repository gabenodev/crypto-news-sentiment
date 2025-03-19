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

  useEffect(() => {
    const fetchPriceData = async () => {
      try {
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/altcoin-season-chart?coinId=${coinId}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();

        // Transformăm array-ul `prices` în formatul dorit
        if (data && Array.isArray(data.prices)) {
          const priceChartData = data.prices.map((item) => ({
            time: new Date(item[0]).toLocaleString(), // Conversia timestamp-ului
            price: item[1], // Prețul
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
  }, [coinId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={priceData}
        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis
          dataKey="time"
          tick={{ fill: "#666", fontSize: 12 }}
          tickFormatter={(time) => new Date(time).toLocaleDateString()} // Formatare data
        />
        <YAxis
          tick={{ fill: "#666", fontSize: 12 }}
          tickFormatter={(price) => `$${price.toFixed(2)}`} // Formatare preț
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#333",
            border: "none",
            borderRadius: "5px",
            color: "#fff",
          }}
          labelFormatter={(time) => `Data: ${new Date(time).toLocaleString()}`}
          formatter={(price) => [`Preț: $${price.toFixed(2)}`, "Preț"]}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#8884d8"
          strokeWidth={2}
          dot={false} // Elimină punctele de pe linie
          activeDot={{ r: 8 }} // Mărește punctul activ
          animationDuration={1000} // Adaugă animație
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PriceChart;
