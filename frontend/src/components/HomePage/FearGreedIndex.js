import React, { useEffect, useState } from "react";
import axios from "axios";

function FearGreedIndexCard() {
  const [fearGreedIndex, setFearGreedIndex] = useState(null);

  const fetchFearGreedIndex = async () => {
    try {
      const response = await axios.get(
        "https://api.alternative.me/fng/?limit=1&format=json"
      );
      setFearGreedIndex(response.data.data[0].value);
    } catch (error) {
      console.error("Error fetching Fear & Greed Index:", error);
    }
  };

  useEffect(() => {
    fetchFearGreedIndex();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
        Fear & Greed Index
      </h3>
      <div className="flex justify-center items-center">
        {fearGreedIndex !== null ? (
          <div className="text-3xl font-bold text-center text-gray-700 dark:text-gray-300">
            {fearGreedIndex}
          </div>
        ) : (
          <div className="text-xl font-semibold text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

export default FearGreedIndexCard;
