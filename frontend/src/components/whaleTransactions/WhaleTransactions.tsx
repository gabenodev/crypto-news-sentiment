"use client";
import * as React from "react";
import { useState, useEffect } from "react";
import useWhaleTransactions from "../../hooks/whaleTransactions/useEthScan";
import { CryptoData } from "./types";
import { Header } from "./components/Header";
import { StatsBar } from "./components/StatsBar";
import WhaleTransactionsLoading from "./components/Loading";
import DesktopTable from "./components/DesktopTable";
import MobileTable from "./components/MobileTable";
import Pagination from "./components/Pagination";

export default function WhaleTransactions(): JSX.Element {
  const [page, setPage] = useState<number>(1);
  const [cryptoData, setCryptoData] = useState<Record<string, CryptoData>>({});
  const [isLoadingCryptoData, setIsLoadingCryptoData] = useState<boolean>(true);
  const itemsPerPage = 10;

  const { transactions, totalPages, loading } = useWhaleTransactions(
    page,
    itemsPerPage
  );

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(
          "https://sentimentxv2-project.vercel.app/api/all-cryptos"
        );
        const data = await response.json();
        const cryptoMap = data.reduce(
          (acc: Record<string, CryptoData>, crypto: CryptoData) => {
            acc[crypto.symbol.toLowerCase()] = crypto;
            return acc;
          },
          {}
        );
        setCryptoData(cryptoMap);
      } catch (error) {
        console.error("Failed to fetch crypto data:", error);
      } finally {
        setIsLoadingCryptoData(false);
      }
    };

    fetchCryptoData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Header />

        {/* Stats Bar */}
        <StatsBar transactions={transactions} cryptoData={cryptoData} />

        {/* Content */}
        {loading || isLoadingCryptoData ? (
          <WhaleTransactionsLoading />
        ) : (
          <div>
            {/* Desktop view */}
            <DesktopTable transactions={transactions} cryptoData={cryptoData} />

            {/* Mobile view */}
            <MobileTable transactions={transactions} cryptoData={cryptoData} />

            {/* Pagination */}
            <Pagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
