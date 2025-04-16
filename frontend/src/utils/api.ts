import axios from "axios";

export const fetchMarketDominance = async () => {
  const response = await axios.get(
    "https://sentimentx-backend.vercel.app/api/market-dominance"
  );
  return response.data;
};
