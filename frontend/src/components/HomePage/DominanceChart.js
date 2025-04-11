import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#14b8a6", "#10b981", "#64748b"];

const MarketDominanceCard = () => {
  const [dominance, setDominance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("https://api.coingecko.com/api/v3/global");
        const data = res.data.data.market_cap_percentage;
        const btc = data.btc;
        const eth = data.eth;
        const others = 100 - btc - eth;

        setDominance([
          { name: "BTC", value: btc },
          { name: "ETH", value: eth },
          { name: "Other", value: others },
        ]);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const color =
        COLORS[dominance.findIndex((item) => item.name === payload[0].name)];
      return (
        <div
          className="px-3 py-2 rounded-lg shadow-lg"
          style={{
            backgroundColor: color,
            color: "#fff",
          }}
        >
          <p className="font-semibold">{payload[0].name}</p>
          <p>{`${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };

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
      className="w-full max-w-xs"
    >
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            <span className="text-teal-500 mr-2">•</span>
            Market Dominance
          </h3>

          {loading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Pie Chart */}
              <div className="h-36 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dominance}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={60}
                      paddingAngle={1}
                      dataKey="value"
                      activeIndex={activeIndex}
                      activeShape={{
                        innerRadius: 40,
                        outerRadius: 65,
                        paddingAngle: 2,
                      }}
                      animationDuration={300}
                      animationEasing="ease-out"
                    >
                      {dominance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index]}
                          strokeWidth={activeIndex === index ? 2 : 0}
                          stroke="#fff"
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Interactive Data List */}
              <div className="w-full mt-3 space-y-2">
                {dominance.map((item, i) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onMouseEnter={() => handleItemHover(i)}
                    onMouseLeave={handleItemLeave}
                  >
                    <div className="flex justify-between items-center px-3 py-2 rounded-lg cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: COLORS[i],
                            transform:
                              activeIndex === i ? "scale(1.2)" : "scale(1)",
                            transition: "transform 0.2s",
                          }}
                        />
                        <span
                          className="text-sm text-gray-800 dark:text-gray-200"
                          style={{
                            color: activeIndex === i ? COLORS[i] : "inherit",
                            fontWeight: activeIndex === i ? "600" : "400",
                          }}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span
                        className="text-sm font-medium text-gray-900 dark:text-gray-100"
                        style={{
                          color: activeIndex === i ? COLORS[i] : "inherit",
                        }}
                      >
                        {item.value.toFixed(1)}%
                      </span>
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
