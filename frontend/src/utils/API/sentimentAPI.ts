import axios from "axios";
import { format } from "date-fns";
import { FearGreedIndexData } from "../../types"; // Dacă ai un tip definit pentru aceasta
export const fetchSentimentData = async (
  limit: string | number
): Promise<{ sentimentScores: number[]; sentimentTimestamps: string[] }> => {
  try {
    const url =
      limit === "max"
        ? "https://api.alternative.me/fng/?limit=2000&format=json"
        : `https://api.alternative.me/fng/?limit=${limit}&format=json`;

    const response = await axios.get(url);

    if (!response.data || !response.data.data) {
      throw new Error("Invalid data format from API");
    }

    const data: FearGreedIndexData[] = response.data.data;
    const sentimentScores = data.map((item) => Number.parseInt(item.value));
    const sentimentTimestamps = data.map((item) =>
      format(new Date(item.timestamp * 1000), "MMM dd, yyyy")
    );

    return {
      sentimentScores: sentimentScores.reverse(),
      sentimentTimestamps: sentimentTimestamps.reverse(),
    };
  } catch (error) {
    console.error("Error fetching sentiment data:", error);
    throw new Error("Failed to load sentiment data. Please try again later.");
  }
};
