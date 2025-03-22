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
  CartesianGrid,
  Brush,
} from "recharts";
import {
  movingAverage,
  calculateMinPrice,
  calculateMaxPrice,
  calculateAveragePrice,
} from "./MAindicators";

const maColors = {
  ma5: "#1890ff",
  ma8: "#722ed1",
  ma13: "#13c2c2",
  ma50: "#fa8c16",
  ma100: "#f5222d",
  ma200: "#52c41a",
};

function PriceChart({ coinId }) {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [movingAverages, setMovingAverages] = useState({
    ma5: false,
    ma8: false,
    ma13: false,
    ma50: false,
    ma100: true,
    ma200: true,
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
        if (!response.ok) throw new Error("Failed to fetch data");
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

  if (loading) return <div>Loading...</div>;

  const minPrice = calculateMinPrice(priceData);
  const maxPrice = calculateMaxPrice(priceData);
  const avgPrice = calculateAveragePrice(priceData);

  const dataWithMAs = movingAverage(priceData, 5, "ma5");
  const dataWithMAs2 = movingAverage(dataWithMAs, 8, "ma8");
  const dataWithMAs3 = movingAverage(dataWithMAs2, 13, "ma13");
  const dataWithMAs4 = movingAverage(dataWithMAs3, 50, "ma50");
  const dataWithMAs5 = movingAverage(dataWithMAs4, 100, "ma100");
  const dataWithMAs6 = movingAverage(dataWithMAs5, 200, "ma200");

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg">
          <p className="text-sm text-white">
            {days < 7
              ? `Time: ${new Date(label).toLocaleString()}`
              : `Date: ${new Date(label).toLocaleDateString()}`}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: $${entry.value.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-[90%] mx-auto dark:bg-gray-900 p-4 rounded-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="flex gap-2 justify-center">
          {Object.entries(movingAverages).map(([key, value]) => (
            <button
              key={key}
              onClick={() =>
                setMovingAverages({ ...movingAverages, [key]: !value })
              }
              style={{
                backgroundColor: value ? maColors[key] : "#374151",
                color: "white",
              }}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-2 justify-center">
          {["min", "max", "avg"].map((item) => (
            <button
              key={item}
              onClick={() =>
                setReferenceLines({
                  ...referenceLines,
                  [item]: !referenceLines[item],
                })
              }
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                referenceLines[item]
                  ? item === "min"
                    ? "bg-green-500 text-white"
                    : item === "max"
                    ? "bg-red-500 text-white"
                    : "bg-orange-500 text-white"
                  : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
              }`}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex justify-center items-center">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-md"
          >
            <option value={1}>1 Day</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={365}>1 Year</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={650}>
        <LineChart
          data={dataWithMAs6}
          margin={{ top: 20, right: 50, left: 50, bottom: 20 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#23d996" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#23d996" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis
            dataKey="time"
            tick={{ fill: "#555", fontSize: 12 }}
            tickFormatter={(time) =>
              days < 7
                ? new Date(time).toLocaleString()
                : new Date(time).toLocaleDateString()
            }
            interval={Math.floor(priceData.length / 5)}
          />
          <YAxis
            tick={{ fill: "#555", fontSize: 12 }}
            domain={["auto", "auto"]}
            tickFormatter={(price) => {
              if (price >= 1) return `$${price.toFixed(2)}`;
              return `$${price}`;
            }}
            tickCount={6}
          />
          <Tooltip
            content={<CustomTooltip />}
            contentStyle={{
              backgroundColor: "#333",
              border: "none",
              borderRadius: "5px",
              color: "#fff",
              fontSize: 14,
            }}
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
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#23d996"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8, fill: "#23d996" }}
            animationDuration={1000}
            isAnimationActive={true}
          />
          {Object.entries(movingAverages).map(
            ([key, value]) =>
              value && (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={maColors[key]}
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1000}
                  isAnimationActive={true}
                  name={key.toUpperCase()}
                />
              )
          )}
          {referenceLines.min && (
            <ReferenceLine
              y={minPrice}
              stroke="#52c41a"
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
              stroke="#ff4d4f"
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
              y={avgPrice}
              stroke="#fa8c16"
              strokeDasharray="3 3"
              label={{
                value: `Avg: $${avgPrice.toFixed(2)}`,
                position: "insideTopRight",
                fill: "#fa8c16",
                fontSize: 12,
                offset: 5,
              }}
            />
          )}
          <Brush
            dataKey="time"
            height={30}
            stroke="#23d996"
            fill="#333"
            travellerWidth={10}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PriceChart;
