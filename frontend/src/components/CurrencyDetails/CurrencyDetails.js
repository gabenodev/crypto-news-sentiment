import React from "react";
import { useParams } from "react-router-dom";
import PriceChart from "./PriceChart";
import CurrencyStats from "./CurrencyStats";

function CurrencyDetails() {
  const { coinId } = useParams();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-r from-gray-900 to-gray-800 py-8 px-4">
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
