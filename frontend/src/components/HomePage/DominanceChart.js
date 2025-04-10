import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#10B981", "#3B82F6", "#6366F1"]; // BTC, ETH, Others

const MarketDominanceCard = () => {
  const [dominance, setDominance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await axios.get("https://api.coingecko.com/api/v3/global");
        const data = res.data.data.market_cap_percentage;

        // Extragem doar BTC și ETH, restul merg în Others
        const btc = parseFloat(data.btc.toFixed(2));
        const eth = parseFloat(data.eth.toFixed(2));
        const others = 100 - btc - eth;

        setDominance([
          { name: "BTC", value: btc },
          { name: "ETH", value: eth },
          { name: "OTHERS", value: parseFloat(others.toFixed(2)) },
        ]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(true);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Actualizare la fiecare minut
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 py-3 rounded-lg shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700"
        >
          <p className="font-bold text-lg" style={{ color: payload[0].color }}>
            {data.name}
          </p>
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            {data.value}% <span className="text-sm">market share</span>
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => (
    <div className="flex justify-center space-x-4 mt-4">
      {payload.map((entry, index) => (
        <div
          key={`legend-${index}`}
          className="flex items-center cursor-pointer"
          onMouseEnter={() => setActiveIndex(index)}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  const handleItemHover = (index) => {
    setActiveIndex(index);
  };

  const handleItemLeave = () => {
    setActiveIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md"
    >
      <div className="relative bg-gradient-to-br from-white/80 to-white/20 dark:from-gray-800/90 dark:to-gray-800/40 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-30 dark:opacity-20" />
        <div className="relative p-5">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Market Dominance
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Bitcoin vs Ethereum vs Other coins
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 text-xs font-bold px-3 py-1 rounded-full"
            >
              LIVE
            </motion.div>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Loading market data...
              </p>
            </div>
          ) : error ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-4 text-center p-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h4 className="font-bold text-gray-800 dark:text-gray-200">
                Failed to load data
              </h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Couldn't connect to CoinGecko API. Please try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Pie Chart */}
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dominance}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      activeIndex={activeIndex}
                      activeShape={{
                        innerRadius: 55,
                        outerRadius: 85,
                        paddingAngle: 3,
                      }}
                      animationDuration={500}
                      animationEasing="ease-out"
                    >
                      {dominance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          strokeWidth={activeIndex === index ? 3 : 0}
                          stroke="#fff"
                          style={{
                            filter:
                              activeIndex === index
                                ? `drop-shadow(0px 0px 6px ${
                                    COLORS[index % COLORS.length]
                                  }80)`
                                : "none",
                            transition: "all 0.3s ease",
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      content={<CustomLegend />}
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Data List */}
              <div className="w-full mt-4 space-y-2">
                {dominance.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    <div
                      onMouseEnter={() => handleItemHover(i)}
                      onMouseLeave={handleItemLeave}
                      className={`flex justify-between items-center px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                        activeIndex === i
                          ? "bg-white dark:bg-gray-700 shadow-md transform scale-[1.02]"
                          : "bg-gray-50/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: COLORS[i % COLORS.length],
                            transform:
                              activeIndex === i ? "scale(1.3)" : "scale(1)",
                          }}
                        />
                        <span
                          className={`font-medium ${
                            activeIndex === i
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`font-bold ${
                            activeIndex === i
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-800 dark:text-gray-200"
                          }`}
                        >
                          {item.value}%
                        </span>
                        <div
                          className={`w-10 h-1 rounded-full ${
                            activeIndex === i ? "opacity-100" : "opacity-70"
                          }`}
                          style={{
                            backgroundColor: COLORS[i % COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MarketDominanceCard;
