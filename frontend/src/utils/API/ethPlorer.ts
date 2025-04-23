// utils/API/ethPlorer.ts
export const fetchWalletHoldings = async (address: string) => {
  const res = await fetch(
    `https://api.ethplorer.io/getAddressInfo/${address}?apiKey=freekey`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch holdings");
  }
  const data = await res.json();
  return data.tokens || [];
};
