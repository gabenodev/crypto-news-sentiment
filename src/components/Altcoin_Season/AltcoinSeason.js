import React, { useEffect, useState } from "react";
import AltcoinChart from "./AltcoinChart";

const AltcoinSeason = () => {
  const [isAltcoinSeason, setIsAltcoinSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [outperformingCount, setOutperformingCount] = useState(0);
  const [totalAltcoins, setTotalAltcoins] = useState(0);
  const [percentage, setPercentage] = useState(0);
  const [outperformingCoins, setOutperformingCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);

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
          "binance-staked-sol",
          "solv-protocol-solvbtc-bbn",
          "lombard-staked-btc",
          "wrapped-avax",
          "solv-btc",
          "binance-peg-weth",
          "kelp-dao-restaked-eth",
          "mantle-staked-ether",
          "rocket-pool-eth",
        ];

        const filteredData = data.filter(
          (coin) => !excludedCoins.includes(coin.id)
        );
        console.log("Datele filtrate:", filteredData);
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
              id: coin.id,
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

  if (loading)
    return <div className="text-center text-gray-700 text-lg">Loading...</div>;

  const barColor =
    percentage >= 80
      ? "bg-green-600"
      : percentage >= 60
      ? "bg-green-400"
      : percentage >= 40
      ? "bg-yellow-400"
      : percentage >= 20
      ? "bg-orange-400"
      : "bg-red-500";

  outperformingCoins.sort((a, b) => b.priceChange - a.priceChange);

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6 items-start">
      {/* Cardul principal */}
      <div className="flex-1 p-6 rounded-lg bg-white shadow-2xl dark:bg-gray-900">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white text-center">
          {isAltcoinSeason
            ? "It's Altcoin Season! 🚀"
            : "It's not Altcoin Season. 📉"}
        </h2>
        <div className="relative w-full bg-gray-300 h-4 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-4 rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-4">
          <span className="font-semibold text-gray-900 dark:text-white">
            {outperformingCount}
          </span>{" "}
          out of
          <span className="font-semibold text-gray-900 dark:text-white">
            {" "}
            {totalAltcoins}{" "}
          </span>
          altcoins have outperformed Bitcoin in the last 24 hours.
        </p>
        {outperformingCoins.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
              Coins outperforming Bitcoin:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {outperformingCoins.map((coin, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedCoin(coin)}
                  className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md hover:scale-105 transition-transform cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
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

      {/* Cardul cu graficul */}
      {selectedCoin && (
        <div className="sticky top-20">
          <AltcoinChart
            coin={selectedCoin}
            onClose={() => setSelectedCoin(null)}
          />
        </div>
      )}
    </div>
  );
};

export default AltcoinSeason;
