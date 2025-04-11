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

const COLORS = ["#14b8a6", "#10b981", "#64748b"]; // BTC, ETH, Others

const MarketDominanceCard = () => {
  const [dominance, setDominance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDominance = async () => {
      try {
        const res = await axios.get("https://api.coingecko.com/api/v3/global");
        const data = res.data.data.market_cap_percentage;
        const btc = data.btc;
        const eth = data.eth;
        const others = 100 - btc - eth;
        setDominance([
          { name: "Bitcoin", value: btc },
          { name: "Ethereum", value: eth },
          { name: "Others", value: others },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch market data", error);
        setLoading(false);
      }
    };

    fetchDominance();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex justify-center px-4">
        <div className="relative w-full max-w-lg h-full">
          <div className="absolute -inset-3 bg-gradient-to-r from-teal-400/30 to-green-500/30 rounded-2xl blur-xl opacity-40 dark:opacity-30 animate-pulse-slow"></div>

          <div className="relative w-full bg-white/95 dark:bg-gray-800/95 p-5 rounded-2xl shadow-xl border border-gray-200/60 dark:border-gray-700/60 backdrop-blur-sm h-full">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-200/50 dark:border-gray-700/50">
              <h3 className="text-xl font-bold">
                <span className="mr-2">📊</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-500">
                  Market Dominance
                </span>
              </h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-6 text-teal-500">
                Loading...
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dominance}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                    >
                      {dominance.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => `${value.toFixed(2)}%`}
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        borderRadius: "0.5rem",
                        border: "none",
                      }}
                      itemStyle={{ color: "#f9fafb" }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3 mt-4 text-sm text-gray-800 dark:text-gray-100">
                  {dominance.map((item, i) => (
                    <div
                      key={item.name}
                      className="flex justify-between items-center bg-gray-50/70 dark:bg-gray-700/70 p-3 rounded-lg border border-gray-200/50 dark:border-gray-600/50"
                    >
                      <span
                        className="font-medium"
                        style={{ color: COLORS[i] }}
                      >
                        {item.name}
                      </span>
                      <span className="font-semibold">
                        {item.value.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MarketDominanceCard;
