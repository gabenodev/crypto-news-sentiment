import React from "react";
import { useParams } from "react-router-dom";
import PriceChart from "./PriceChart";
import CurrencyStats from "./CurrencyStats";
//import { motion } from "framer-motion";

function CurrencyDetails() {
  const { coinId } = useParams();

  return (
    <div>
      {/* Secțiunea cu datele despre monedă */}
      <CurrencyStats />

      {/* Graficul prețului */}
      <div className="mt-8">
        <PriceChart coinId={coinId} />
      </div>
    </div>
  );
}

export default CurrencyDetails;
