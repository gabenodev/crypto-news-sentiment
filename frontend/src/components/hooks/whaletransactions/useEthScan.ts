import type { WhaleTransaction } from "../../../types";

interface WhaleTransactionsResponse {
  transactions: WhaleTransaction[];
  totalPages: number;
}

export const fetchWhaleTransactions = async (
  page = 1,
  threshold = 100
): Promise<WhaleTransactionsResponse> => {
  try {
    const res = await fetch(
      `https://sentimentx-backend.vercel.app/api/whale-transactions?page=${page}&threshold=${threshold}`
    );
    if (!res.ok) throw new Error("Failed to fetch transactions from backend");

    const data = await res.json();
    return {
      transactions: data.transactions || [],
      totalPages: data.totalPages || 1,
    };
  } catch (error) {
    console.error("Error fetching whale transactions:", error);
    return {
      transactions: [],
      totalPages: 1,
    };
  }
};
