import React from "react";

interface PignationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export default function Pignation({
  currentPage,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: PignationProps) {
  return (
    <div className="flex space-x-2 justify-center my-6">
      <button
        disabled={!hasPreviousPage}
        className={`px-4 rounded-full bg-gray-300 dark:bg-gray-400 ${
          hasPreviousPage
            ? "hover:bg-gray-400 dark:hover:bg-gray-500"
            : "opacity-50 cursor-not-allowed"
        }`}
        onClick={() => {
          if (hasPreviousPage) onPageChange(currentPage - 1);
        }}
      >
        Previous
      </button>

      <span className="px-4 py-2 font-semibold">{currentPage}</span>

      <button
        disabled={!hasNextPage}
        className={`px-4 rounded-full bg-gray-300 dark:bg-gray-400 ${
          hasNextPage
            ? "hover:bg-gray-400 dark:hover:bg-gray-500"
            : "opacity-50 cursor-not-allowed"
        }`}
        onClick={() => {
          if (hasNextPage) onPageChange(currentPage + 1);
        }}
      >
        Next
      </button>
    </div>
  );
}
