// CurrencyDetails.js
import React from "react";
import { useParams } from "react-router-dom";
import PriceChart from "./PriceChart"; // Import corect din același folder

function CurrencyDetails() {
  const { coinId } = useParams(); // Extragem coinId din parametrii rutei
  console.log(coinId); // Verifică dacă coinId este corect

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gradient-to-r from-gray-900 to-gray-800 py-8 px-2">
      <div>
        <PriceChart coinId={coinId} />{" "}
        {/* Afișăm graficul pentru criptomonedă */}
      </div>
    </div>
  );
}

export default CurrencyDetails;
