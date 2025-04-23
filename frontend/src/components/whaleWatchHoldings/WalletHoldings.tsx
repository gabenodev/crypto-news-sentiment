import React, { useState, useEffect } from "react";
import { fetchWalletHoldings } from "../../utils/API/ethPlorer";

const WalletHoldings = ({ address }: { address: string }) => {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHoldings = async () => {
      try {
        const data = await fetchWalletHoldings(address);
        const filtered = data.filter((token: any) => Number(token.balance) > 0);
        setHoldings(filtered);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadHoldings();
  }, [address]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Holdings for {address}</h2>
      <div className="grid gap-4">
        {holdings.map((token, idx) => {
          const tokenInfo = token.tokenInfo;
          const decimals = Number(tokenInfo.decimals) || 0;
          const balance = Number(token.balance) / Math.pow(10, decimals);
          return (
            <div key={idx} className="p-4 rounded bg-gray-100 dark:bg-gray-800">
              <p className="font-medium text-lg">
                {tokenInfo.name} ({tokenInfo.symbol})
              </p>
              <p>Balance: {balance.toFixed(4)}</p>
              {tokenInfo.price?.rate && (
                <p>Value: ${(balance * tokenInfo.price.rate).toFixed(2)}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WalletHoldings;
