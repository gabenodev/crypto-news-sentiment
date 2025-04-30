import type React from "react";
import type { WalletHeaderProps } from "../types";
import { generateWalletPlaceholder } from "../../../utils/placeholderGenerator";

const WalletHeader: React.FC<WalletHeaderProps> = ({
  address,
  walletInfo,
  className = "",
}) => {
  return (
    <div
      className={`px-4 py-4 flex items-center border-b border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-400/30 to-teal-600/30 p-0.5 mr-3">
        <img
          src={generateWalletPlaceholder(address, 48) || "/placeholder.svg"}
          alt="Wallet"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div>
        <h1 className="text-base font-bold text-gray-900 dark:text-dark-text-primary">
          {walletInfo ? walletInfo.name : "Anonymous Wallet"}
        </h1>
        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
          {walletInfo ? walletInfo.description : "Blockchain address"}
        </p>
      </div>
    </div>
  );
};

export default WalletHeader;
