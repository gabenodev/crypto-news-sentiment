"use client";

import { useState, useEffect, useRef } from "react";
import type { TokenData } from "../types";
import {
  processTokenData,
  calculatePercentagesAndSort,
} from "../utils/tokenUtils";

export const useTokenProcessing = (
  holdings: TokenData[],
  ethBalance: number,
  ethPrice: number,
  isLoading: boolean,
  onStatsUpdate?: (stats: any) => void,
  onLoadingChange?: (loading: boolean) => void
) => {
  const [processedHoldings, setProcessedHoldings] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(isLoading);
  const [error, setError] = useState<string | null>(null);

  // Use useRef to prevent duplicate requests
  const isInitialMount = useRef(true);
  const previousHoldingsRef = useRef("");
  const selectedTokenRef = useRef<string | null>(null);
  const statsUpdatedRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      setLoading(true);
      return;
    }

    // Check if holdings has actually changed to avoid unnecessary processing
    const holdingsString = JSON.stringify(holdings);
    if (holdingsString === previousHoldingsRef.current) {
      return;
    }
    previousHoldingsRef.current = holdingsString;

    const currentSelectedSymbol = selectedTokenRef.current || null;
    try {
      // Save the currently selected token symbol (if any)
      if (currentSelectedSymbol) {
        selectedTokenRef.current = currentSelectedSymbol;
      }

      // Process the received data
      const { processedTokens, totalValue } = processTokenData(
        holdings,
        ethBalance,
        ethPrice
      );

      // Calculate percentages and sort by value
      const dataWithPercentages = calculatePercentagesAndSort(
        processedTokens,
        totalValue
      );

      setProcessedHoldings(dataWithPercentages);
      setError(null);

      // Update stats in parent component
      if (onStatsUpdate) {
        onStatsUpdate({
          totalValue,
          tokenCount: dataWithPercentages.length,
          ethBalance,
        });
      }

      // Handle token selection
      if (dataWithPercentages.length > 0) {
        if (selectedTokenRef.current) {
          // Try to find the previously selected token
          const previouslySelected = dataWithPercentages.find(
            (token) => token.tokenInfo.symbol === selectedTokenRef.current
          );
          if (!previouslySelected && isInitialMount.current) {
            // If not found and it's the first load, select the first token
            selectedTokenRef.current = dataWithPercentages[0].tokenInfo.symbol;
            isInitialMount.current = false;
          }
        } else if (isInitialMount.current) {
          // If no token was selected before and it's the first load, select the first token
          selectedTokenRef.current = dataWithPercentages[0].tokenInfo.symbol;
          isInitialMount.current = false;
        }
      }
    } catch (err: any) {
      console.error("Error processing data:", err);
      setError(err.message || "Error processing data");
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [
    holdings,
    isLoading,
    ethBalance,
    ethPrice,
    onLoadingChange,
    onStatsUpdate,
  ]);

  useEffect(() => {
    if (
      !isLoading &&
      holdings &&
      holdings.length > 0 &&
      !statsUpdatedRef.current
    ) {
      try {
        // Set the flag to true to prevent multiple updates
        statsUpdatedRef.current = true;

        // Check if ETH already exists in holdings
        const ethTokenExists = holdings.some(
          (token) =>
            token.tokenInfo.symbol.toLowerCase() === "eth" &&
            !token.tokenInfo.name.toLowerCase().includes("defi")
        );

        // Calculate ETH value
        const ethValue = ethBalance * ethPrice;

        // Calculate total token value
        let totalTokenValue = 0;
        holdings.forEach((token) => {
          if (token.tokenInfo.price?.rate) {
            const decimals = Number(token.tokenInfo.decimals) || 0;
            const formattedBalance =
              Number(token.balance) / Math.pow(10, decimals);
            totalTokenValue += formattedBalance * token.tokenInfo.price.rate;
          }
        });

        // Calculate total portfolio value, avoiding ETH duplication
        const totalValue = totalTokenValue + (ethTokenExists ? 0 : ethValue);

        // Update stats
        if (onStatsUpdate) {
          onStatsUpdate({
            totalValue,
            tokenCount: holdings.length,
            ethBalance,
          });
        }
      } catch (err) {
        console.error("Error calculating total value:", err);
      }
    }

    // Reset the flag when dependencies change
    return () => {
      if (isLoading) {
        statsUpdatedRef.current = false;
      }
    };
  }, [holdings, ethBalance, ethPrice, isLoading, onStatsUpdate]);

  return { processedHoldings, loading, error, selectedTokenRef };
};
