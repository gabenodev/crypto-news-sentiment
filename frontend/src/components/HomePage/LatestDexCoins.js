import React, { useState, useEffect } from "react";
import axios from "axios";

const LatestDexCoins = () => {
  const [latestTokens, setLatestTokens] = useState([]);
  const [tokenPairs, setTokenPairs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch latest tokens
  useEffect(() => {
    const fetchLatestTokens = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.dexscreener.com/token-profiles/latest/v1"
        );

        // Verificăm structura răspunsului
        const tokens = response.data?.data || response.data || [];
        const validTokens = Array.isArray(tokens) ? tokens : [tokens];
        setLatestTokens(validTokens);

        // Fetch pairs for each token
        const pairsData = {};
        for (const token of validTokens) {
          try {
            const pairResponse = await axios.get(
              `https://api.dexscreener.com/token-pairs/v1/${token.chainId}/${token.tokenAddress}`,
              { timeout: 10000 }
            );

            // Verificăm mai atent structura răspunsului pentru perechi
            const pairs =
              pairResponse.data?.pairs ||
              pairResponse.data?.data?.pairs ||
              pairResponse.data;

            pairsData[token.tokenAddress] = Array.isArray(pairs)
              ? pairs
              : [pairs].filter(Boolean);
          } catch (pairError) {
            console.error(
              `Error fetching pairs for ${token.tokenAddress}:`,
              pairError
            );
            pairsData[token.tokenAddress] = [];
          }
        }
        setTokenPairs(pairsData);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching latest tokens:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestTokens();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="latest-dex-coins">
      <h2>Latest Dex Tokens</h2>
      <div className="tokens-container">
        {latestTokens.map((token) => (
          <div key={token.tokenAddress} className="token-card">
            <div className="token-header">
              <h3>
                {token.name || "Unnamed Token"} ({token.symbol || "N/A"})
              </h3>
              <p>Chain: {token.chainId}</p>
              <p>Address: {token.tokenAddress}</p>
            </div>

            <div className="token-pairs">
              <h4>Pairs:</h4>
              {tokenPairs[token.tokenAddress]?.length > 0 ? (
                <ul>
                  {tokenPairs[token.tokenAddress].map((pair) => (
                    <li key={pair.pairAddress}>
                      <p>
                        Pair: {pair?.baseToken?.symbol}/
                        {pair?.quoteToken?.symbol}
                      </p>
                      <p>Price (Native): {pair?.priceNative || "N/A"}</p>
                      <p>
                        Price (USD):{" "}
                        {pair?.priceUsd ? `$${pair.priceUsd}` : "N/A"}
                      </p>
                      <p>
                        Volume (24h):{" "}
                        {pair?.volume?.h24
                          ? `$${pair.volume.h24.toLocaleString()}`
                          : "N/A"}
                      </p>
                      <p>
                        Liquidity:{" "}
                        {pair?.liquidity?.usd
                          ? `$${pair.liquidity.usd.toLocaleString()}`
                          : "N/A"}
                      </p>
                      <p>DEX: {pair?.dexId || "N/A"}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No pairs found for this token</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LatestDexCoins;
