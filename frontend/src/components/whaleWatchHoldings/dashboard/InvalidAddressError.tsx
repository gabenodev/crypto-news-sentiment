import React from "react";
import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import type { InvalidAddressErrorProps } from "../types";

const InvalidAddressError: React.FC<InvalidAddressErrorProps> = ({
  address,
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-red-50 dark:bg-error/20 border border-red-200 dark:border-error/50 rounded-xl p-6 text-center">
        <div className="text-error text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-error mb-2">
          Invalid Ethereum Address
        </h2>
        <p className="text-error/90 mb-6">
          The address "{address}" is not a valid Ethereum address. Please check
          the address and try again.
        </p>
        <Link
          to="/wallet-holdings"
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-600 hover:to-green-600 text-white rounded-lg transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Wallet Search
        </Link>
      </div>
    </div>
  );
};

export default InvalidAddressError;
