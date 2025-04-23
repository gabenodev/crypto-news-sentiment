import React, { useState } from "react";
import WalletHoldings from "../components/whaleWatchHoldings/WalletHoldings";

const WalletHoldingsPage = () => {
  const [address, setAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedAddress(address.trim());
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Wallet Holdings</h1>
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Enter wallet address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Check
        </button>
      </form>

      {submittedAddress && <WalletHoldings address={submittedAddress} />}
    </div>
  );
};

export default WalletHoldingsPage;
