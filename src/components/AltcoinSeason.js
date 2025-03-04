import React, { useEffect, useState } from "react";

const AltcoinSeason = () => {
  const [isAltcoinSeason, setIsAltcoinSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outperformingCount, setOutperformingCount] = useState(0);
  const [totalAltcoins, setTotalAltcoins] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [outperformingCoins, setOutperformingCoins] = useState([]);

  useEffect(() => {
    const fetchAltcoinSeasonData = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1"
        );
        const data = await response.json();

        const excludedCoins = [
          "tether",
          "usd-coin",
          "wrapped-bitcoin",
          "staked-ether",
          "binance-usd",
          "dai",
          "trueusd",
          "wrapped-steth",
          "weth",
          "ethereum-classic",
          "coinbase-wrapped-btc",
          "wrapped-ethereum",
          "usds",
          "wrapped-eeth",
          "bitcoin-cash",
          "wrapped-ust",
          "susds",
          "ethena-usde",
          "first-digital-usd",
          "paypal-usd",
          "usual-usd",
        ];

        const filteredData = data.filter(
          (coin) => !excludedCoins.includes(coin.id)
        );
        console.log("Lista de altcoinuri:", filteredData);
        let outperformingCountTemp = 0;
        const totalAltcoinsTemp = filteredData.length;
        const outperformingCoinsTemp = [];

        const bitcoin = data.find((coin) => coin.id === "bitcoin");
        if (!bitcoin) {
          console.error("Bitcoin data not found");
          return;
        }

        for (let coin of filteredData) {
          if (
            coin.price_change_percentage_24h >
            bitcoin.price_change_percentage_24h
          ) {
            outperformingCountTemp++;
            outperformingCoinsTemp.push({
              name: coin.name,
              priceChange: coin.price_change_percentage_24h,
              image: coin.image,
            });
          }
        }

        setOutperformingCount(outperformingCountTemp);
        setTotalAltcoins(totalAltcoinsTemp);
        setOutperformingCoins(outperformingCoinsTemp);
        setPercentage((outperformingCountTemp / totalAltcoinsTemp) * 100);
        setIsAltcoinSeason(
          (outperformingCountTemp / totalAltcoinsTemp) * 100 >= 75
        );
      } catch (error) {
        console.error("Error fetching altcoin season data:", error);
        setIsAltcoinSeason(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAltcoinSeasonData();
  }, []);

  if (loading) return <div>Loading...</div>;

  const barColor =
    percentage >= 80
      ? "#16a34a"
      : percentage >= 60
      ? "#4ade80"
      : percentage >= 40
      ? "#fcd34d"
      : percentage >= 20
      ? "#fb923c"
      : "#ff4444";

  return (
    <div className="p-6 max-w-lg mx-auto rounded-lg bg-white shadow-xl">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isAltcoinSeason ? "It's Altcoin Season!" : "It's not Altcoin Season."}
      </h2>
      <div className="w-full bg-gray-300 h-4 rounded-full mb-4">
        <div
          className="h-4 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        ></div>
      </div>
      <p className="text-lg text-gray-600">
        {outperformingCount} of {totalAltcoins} altcoins have performed better
        than Bitcoin in the last 24 hours.
      </p>
      <p className="text-gray-500 mt-2 text-sm">Price Change in the Last 24H</p>
      {outperformingCoins.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-xl text-gray-800 mb-4">
            Coins outperforming Bitcoin:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {outperformingCoins.map((coin, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <img src={coin.image} alt={coin.name} className="w-8 h-8" />
                  <span className="font-medium dark:text-white text-black">
                    {coin.name}
                  </span>
                </div>
                <span
                  className={`font-medium ${
                    coin.priceChange > 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {coin.priceChange > 0 ? "+" : ""}
                  {coin.priceChange.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AltcoinSeason;
