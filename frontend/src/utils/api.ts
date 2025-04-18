import axios from "axios";

export const fetchMarketDominance = async () => {
  const response = await axios.get(
    "https://sentimentxv2-project.vercel.app/api/market-dominance"
  );
  return response.data;
};
