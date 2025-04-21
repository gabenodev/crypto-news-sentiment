"use client";

import { useMemo } from "react";
import type { FilteredAndSortedCoinsProps } from "../types";

export const useFilteredCoins = ({
  outperformingCoins,
  searchTerm,
  sortConfig,
}: FilteredAndSortedCoinsProps) => {
  const filteredAndSortedCoins = useMemo(() => {
    let filtered = outperformingCoins;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (coin) =>
          coin.name.toLowerCase().includes(term) ||
          coin.symbol.toLowerCase().includes(term)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortConfig.key === "priceChange") {
        return sortConfig.direction === "asc"
          ? a.priceChange - b.priceChange
          : b.priceChange - a.priceChange;
      } else if (sortConfig.key === "marketCap") {
        return sortConfig.direction === "asc"
          ? a.marketCap - b.marketCap
          : b.marketCap - a.marketCap;
      } else if (sortConfig.key === "name") {
        return sortConfig.direction === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortConfig.direction === "asc"
          ? a.rank - b.rank
          : b.rank - a.rank;
      }
    });
  }, [outperformingCoins, searchTerm, sortConfig]);

  return filteredAndSortedCoins;
};

export default useFilteredCoins;
