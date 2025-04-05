import { useEffect, useState } from "react";

function useTopMovers(page = 1) {
  const [topMovers, setTopMovers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMovers = async () => {
      try {
        const response = await fetch(
          `https://sentimentx-backend.vercel.app/api/all-cryptos?per_page=${
            page * 100
          }`
        );
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();

        // Sortează monedele descrescător în funcție de schimbarea procentuală în ultimele 24h pentru Top Movers
        const sortedTopMovers = data
          .sort(
            (a, b) =>
              b.price_change_percentage_24h - a.price_change_percentage_24h
          )
          .slice(0, 5); // Ia doar primele 5 monede

        // Sortează monedele crescător în funcție de schimbarea procentuală în ultimele 24h pentru Top Losers
        const sortedTopLosers = data
          .sort(
            (a, b) =>
              a.price_change_percentage_24h - b.price_change_percentage_24h
          )
          .slice(0, 5); // Ia doar primele 5 monede

        setTopMovers(sortedTopMovers);
        setTopLosers(sortedTopLosers);
      } catch (error) {
        console.error("Error fetching top movers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovers();
  }, []);

  return { topMovers, topLosers, loading };
}

export default useTopMovers;
