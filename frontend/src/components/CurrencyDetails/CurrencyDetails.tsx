"use client";
import * as React from "react";
import { useParams } from "react-router-dom";
import PriceChart from "./PriceChart";
import CurrencyStats from "./CurrencyStats";

function CurrencyDetails(): JSX.Element {
  const { coinId } = useParams<{ coinId: string }>();

  return (
    <div>
      {/* Currency data section */}
      <CurrencyStats />

      {/* Price chart */}
      <div className="mt-8">
        <PriceChart coinId={coinId || ""} />
      </div>
    </div>
  );
}

export default CurrencyDetails;
