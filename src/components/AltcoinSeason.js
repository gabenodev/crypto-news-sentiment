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
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1"
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
        ];

        const filteredData = data.filter(
          (coin) => !excludedCoins.includes(coin.id)
        );

        console.log("All Altcoins:", filteredData);

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
            coin.price_change_percentage_24h &&
            bitcoin.price_change_percentage_24h
          ) {
            if (
              coin.price_change_percentage_24h >
              bitcoin.price_change_percentage_24h
            ) {
              outperformingCountTemp++;
              outperformingCoinsTemp.push({
                name: coin.name,
                priceChange: coin.price_change_percentage_24h,
              });
            }
          }
        }

        setOutperformingCount(outperformingCountTemp);
        setTotalAltcoins(totalAltcoinsTemp);
        setOutperformingCoins(outperformingCoinsTemp);

        const percentageTemp =
          (outperformingCountTemp / totalAltcoinsTemp) * 100;
        setPercentage(percentageTemp);

        setIsAltcoinSeason(percentageTemp >= 75);
      } catch (error) {
        console.error("Error fetching altcoin season data:", error);
        setIsAltcoinSeason(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAltcoinSeasonData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  let barColor = "#ff4444";

  if (percentage >= 80) {
    barColor = "#16a34a";
  } else if (percentage >= 60) {
    barColor = "#4ade80";
  } else if (percentage >= 40) {
    barColor = "#fcd34d";
  } else if (percentage >= 20) {
    barColor = "#fb923c";
  } else {
    barColor = "#ff4444";
  }

  return (
    <div className="p-6 max-w-lg mx-auto rounded-lg bg-white shadow-xl">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        {isAltcoinSeason
          ? "It's Altcoin Season (75% of the Top 50 coins are outperforming Bitcoin)"
          : "It's not Altcoin Season."}
      </h2>

      <div className="w-full bg-gray-300 h-4 rounded-full mb-4">
        <div
          className="h-4 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
          }}
        ></div>
      </div>

      <p className="text-lg text-gray-600">
        {outperformingCount} of {totalAltcoins} altcoins have performed better
        than Bitcoin in the last 24 hours.
      </p>

      {/* Eticheta pentru 24H */}
      <p className="text-gray-500 mt-2 text-sm">Price Change in the Last 24H</p>

      {outperformingCoins.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-lg text-gray-800">
            Coins outperforming Bitcoin:
          </h3>
          <ul className="list-disc pl-5 mt-2 space-y-2">
            {outperformingCoins.map((coin, index) => (
              <li key={index} className="text-left text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">{coin.name}</span>
                  <span
                    className={`font-medium ${
                      coin.priceChange > 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {coin.priceChange > 0 ? "+" : ""}
                    {coin.priceChange.toFixed(2)}%
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AltcoinSeason;
