import React from "react";
import { useParams } from "react-router-dom";
import PriceChart from "./PriceChart";
import CurrencyStats from "./CurrencyStats";
import { motion } from "framer-motion";

function CurrencyDetails() {
  const { coinId } = useParams();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen bg-gray-100 dark:bg-gradient-to-r from-gray-900 to-gray-800 py-8 px-4"
    >
      {/* Secțiunea cu datele despre monedă */}
      <CurrencyStats />

      {/* Graficul prețului */}
      <div className="mt-8">
        <PriceChart coinId={coinId} />
      </div>
    </motion.div>
  );
}

export default CurrencyDetails;
