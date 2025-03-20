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
  const [movingAverages, setMovingAverages] = useState({
    ma5: false,
    ma10: false,
    ma13: false,
  });
  const [referenceLines, setReferenceLines] = useState({
    min: false,
    max: false,
    avg: false,
  });

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

  const movingAverage = (data, period, key) => {
    return data.map((item, index) => {
      if (index < period - 1) return { ...item, [key]: null };
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, val) => acc + val.price, 0);
      return { ...item, [key]: sum / period };
    });
  };

  // Adăugăm MA-urile direct în setul de date principal
  const dataWithMAs = movingAverage(priceData, 5, "ma5");
  const dataWithMAs2 = movingAverage(dataWithMAs, 10, "ma10");
  const dataWithMAs3 = movingAverage(dataWithMAs2, 13, "ma13");

  return (
    <div style={{ width: "90%", margin: "0 auto" }}>
      {/* Dropdown pentru selectarea intervalului */}
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

      {/* Butoane pentru MA */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() =>
            setMovingAverages({ ...movingAverages, ma5: !movingAverages.ma5 })
          }
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: movingAverages.ma5 ? "#1890ff" : "#eee",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          MA 5
        </button>
        <button
          onClick={() =>
            setMovingAverages({ ...movingAverages, ma10: !movingAverages.ma10 })
          }
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: movingAverages.ma10 ? "#722ed1" : "#eee",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          MA 10
        </button>
        <button
          onClick={() =>
            setMovingAverages({ ...movingAverages, ma13: !movingAverages.ma13 })
          }
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: movingAverages.ma13 ? "#13c2c2" : "#eee",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          MA 13
        </button>
      </div>

      {/* Butoane pentru Min, Max, Average */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() =>
            setReferenceLines({ ...referenceLines, min: !referenceLines.min })
          }
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: referenceLines.min ? "#52c41a" : "#eee", // Verde
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Min
        </button>
        <button
          onClick={() =>
            setReferenceLines({ ...referenceLines, max: !referenceLines.max })
          }
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: referenceLines.max ? "#ff4d4f" : "#eee", // Roșu
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Max
        </button>
        <button
          onClick={() =>
            setReferenceLines({ ...referenceLines, avg: !referenceLines.avg })
          }
          style={{
            marginRight: "10px",
            padding: "5px 10px",
            backgroundColor: referenceLines.avg ? "#fa8c16" : "#eee", // Portocaliu
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Avg
        </button>
      </div>

      {/* Graficul */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={dataWithMAs3}
          margin={{ top: 20, right: 50, left: 50, bottom: 10 }}
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
          {/* Linii de MA */}
          {movingAverages.ma5 && (
            <Line
              type="monotone"
              dataKey="ma5"
              stroke="#1890ff" // Albastru
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
              name="MA 5"
            />
          )}
          {movingAverages.ma10 && (
            <Line
              type="monotone"
              dataKey="ma10"
              stroke="#722ed1" // Mov
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
              name="MA 10"
            />
          )}
          {movingAverages.ma13 && (
            <Line
              type="monotone"
              dataKey="ma13"
              stroke="#13c2c2" // Turcoaz
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
              name="MA 13"
            />
          )}
          {/* Linii de referință */}
          {referenceLines.min && (
            <ReferenceLine
              y={minPrice}
              stroke="#52c41a" // Verde
              strokeDasharray="3 3"
              label={{
                value: `Min: $${minPrice.toFixed(2)}`,
                position: "insideBottomRight",
                fill: "#52c41a",
                fontSize: 12,
                offset: 5,
              }}
            />
          )}
          {referenceLines.max && (
            <ReferenceLine
              y={maxPrice}
              stroke="#ff4d4f" // Roșu
              strokeDasharray="3 3"
              label={{
                value: `Max: $${maxPrice.toFixed(2)}`,
                position: "insideTopRight",
                fill: "#ff4d4f",
                fontSize: 12,
                offset: 5,
              }}
            />
          )}
          {referenceLines.avg && (
            <ReferenceLine
              y={(maxPrice + minPrice) / 2}
              stroke="#fa8c16" // Portocaliu
              strokeDasharray="3 3"
              label={{
                value: `Avg: $${((maxPrice + minPrice) / 2).toFixed(2)}`,
                position: "insideTopRight",
                fill: "#fa8c16",
                fontSize: 12,
                offset: 5,
              }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;
