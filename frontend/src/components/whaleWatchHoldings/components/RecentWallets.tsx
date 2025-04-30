import type React from "react";
import { Link } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import type { RecentWalletsProps } from "../types";
import { generateWalletPlaceholder } from "../../../utils/placeholderGenerator";

const RecentWallets: React.FC<RecentWalletsProps> = ({
  recentWallets,
  currentAddress,
  truncateAddress,
  className = "",
}) => {
  // Filter out current address and limit to 3
  const filteredWallets = recentWallets
    .filter((w) => w !== currentAddress)
    .slice(0, 3);

  if (filteredWallets.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h3 className="text-xs font-medium text-gray-500 dark:text-dark-text-secondary mb-2 flex items-center">
        <FiClock className="mr-2 text-teal-500 dark:text-teal-400" size={14} />
        Recent Wallets
      </h3>
      <ul className="space-y-1">
        {filteredWallets.map((wallet) => (
          <li key={wallet} className="group">
            <Link
              to={`/wallet-holdings/${wallet}`}
              className="flex items-center p-2 rounded-lg bg-gray-50 dark:bg-dark-tertiary hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all group-hover:border-l border-teal-500 dark:border-teal-400"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-dark-tertiary dark:to-dark-secondary p-0.5 mr-2">
                <img
                  src={
                    generateWalletPlaceholder(wallet, 24) || "/placeholder.svg"
                  }
                  alt="Wallet"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-700 dark:text-dark-text-primary truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  {truncateAddress(wallet)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentWallets;
