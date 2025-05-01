import React from "react";
import { FiInbox } from "react-icons/fi";
import type { EmptyStateProps } from "../types";

const EmptyState: React.FC<EmptyStateProps> = ({ message, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 bg-white dark:bg-dark-secondary rounded-xl shadow border border-gray-100 dark:border-dark-tertiary">
      <div className="p-4 bg-gray-100 dark:bg-dark-tertiary rounded-full mb-4">
        <FiInbox className="h-8 w-8 text-gray-500 dark:text-dark-text-secondary" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
        {message}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-dark-text-secondary text-center max-w-md">
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
