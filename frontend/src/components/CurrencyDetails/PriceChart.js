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
} from "recharts";

function PriceChart({ coinId }) {
  const [priceData, setPriceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [movingAverages, setMovingAverages] = useState({
    ma5: false,
    ma8: false,
    ma13: false,
    ma50: false,
    ma100: false,
    ma200: false,
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
    if (data.length < period) {
      console.error(`Cannot calculate ${key} on a timeframe this small.`);
      return data.map((item) => ({ ...item, [key]: null }));
    }
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
  const dataWithMAs2 = movingAverage(dataWithMAs, 8, "ma8");
  const dataWithMAs3 = movingAverage(dataWithMAs2, 13, "ma13");
  const dataWithMAs4 = movingAverage(dataWithMAs3, 50, "ma50");
  const dataWithMAs5 = movingAverage(dataWithMAs4, 100, "ma100");
  const dataWithMAs6 = movingAverage(dataWithMAs5, 200, "ma200");

  return (
    <div className="w-[90%] mx-auto dark:bg-gray-900 p-4 rounded-lg">
      {/* Container pentru butoane și dropdown */}
      <div className="flex justify-between items-center mb-6">
        {/* Butoane pentru MA */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setMovingAverages({ ...movingAverages, ma5: !movingAverages.ma5 })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              movingAverages.ma5
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            MA 5
          </button>
          <button
            onClick={() =>
              setMovingAverages({
                ...movingAverages,
                ma8: !movingAverages.ma8,
              })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              movingAverages.ma8
                ? "bg-purple-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            MA 8
          </button>
          <button
            onClick={() =>
              setMovingAverages({
                ...movingAverages,
                ma13: !movingAverages.ma13,
              })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              movingAverages.ma13
                ? "bg-teal-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            MA 13
          </button>
          <button
            onClick={() =>
              setMovingAverages({
                ...movingAverages,
                ma50: !movingAverages.ma50,
              })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              movingAverages.ma50
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            MA 50
          </button>
          <button
            onClick={() =>
              setMovingAverages({
                ...movingAverages,
                ma100: !movingAverages.ma100,
              })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              movingAverages.ma100
                ? "bg-pink-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            MA 100
          </button>
          <button
            onClick={() =>
              setMovingAverages({
                ...movingAverages,
                ma200: !movingAverages.ma200,
              })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              movingAverages.ma200
                ? "bg-indigo-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            MA 200
          </button>
        </div>

        {/* Butoane pentru Min, Max, Average */}
        <div className="flex gap-2">
          <button
            onClick={() =>
              setReferenceLines({ ...referenceLines, min: !referenceLines.min })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              referenceLines.min
                ? "bg-green-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Min
          </button>
          <button
            onClick={() =>
              setReferenceLines({ ...referenceLines, max: !referenceLines.max })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              referenceLines.max
                ? "bg-red-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Max
          </button>
          <button
            onClick={() =>
              setReferenceLines({ ...referenceLines, avg: !referenceLines.avg })
            }
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              referenceLines.avg
                ? "bg-orange-500 text-white"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
            }`}
          >
            Avg
          </button>
        </div>

        {/* Dropdown pentru selectarea intervalului */}
        <div className="mt-6">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-white px-4 py-2 rounded-md appearance-none"
          >
            <option value={1}>1 Day</option>
            <option value={7}>7 Days</option>
            <option value={30}>30 Days</option>
            <option value={365}>1 Year</option>
          </select>
        </div>
      </div>

      {/* Graficul */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={dataWithMAs6}
          margin={{ top: 20, right: 50, left: 50, bottom: 10 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#23d996" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#23d996" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Grid-ul orizontal și vertical */}
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
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
          {movingAverages.ma8 && (
            <Line
              type="monotone"
              dataKey="ma8"
              stroke="#722ed1" // Mov
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
              name="MA 8"
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
          {movingAverages.ma50 && (
            <Line
              type="monotone"
              dataKey="ma50"
              stroke="#fa8c16" // Portocaliu
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
              name="MA 50"
            />
          )}
          {movingAverages.ma100 && (
            <Line
              type="monotone"
              dataKey="ma100"
              stroke="#f5222d" // Roșu
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
              name="MA 100"
            />
          )}
          {movingAverages.ma200 && (
            <Line
              type="monotone"
              dataKey="ma200"
              stroke="#52c41a" // Verde
              strokeDasharray="5 5"
              strokeWidth={2}
              dot={false}
              animationDuration={1000}
              name="MA 200"
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
