import { useEffect, useState } from "react";

function useTopMovers() {
  const [topMovers, setTopMovers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMovers = async () => {
      try {
        // Preia 200 de monede pentru a avea o gamă largă de opțiuni
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1"
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
