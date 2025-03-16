import { useEffect, useState } from "react";

const Homepage = () => {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCryptos = async () => {
      try {
        const response = await fetch("/api/cryptos");
        if (!response.ok) {
          throw new Error("Failed to fetch cryptos");
        }
        const data = await response.json();
        setCryptos(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCryptos();
  }, []);

  if (loading) return <p>Loading cryptocurrencies...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Top Cryptocurrencies</h1>
      <ul className="space-y-4">
        {cryptos.map((crypto, index) => (
          <li
            key={crypto.id}
            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
          >
            <span className="text-lg font-semibold">
              {index + 1}. {crypto.name} ({crypto.symbol.toUpperCase()})
            </span>
            <span className="text-green-400">
              ${crypto.market_cap.toLocaleString()}{" "}
              {/* afișez market cap-ul corect */}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Homepage;
