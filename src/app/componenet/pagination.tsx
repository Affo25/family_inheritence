'use client';

import React from 'react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, onPageChange }) => {
  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex items-center justify-center space-x-2 my-4">
      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
      >
        Prev
      </button>

      {[...Array(totalPages).keys()].map((_, index) => {
        const pg = index + 1;
        return (
          <button
            key={pg}
            className={`px-3 py-1 border rounded ${
              page === pg ? 'bg-blue-500 text-white' : ''
            }`}
            onClick={() => goToPage(pg)}
          >
            {pg}
          </button>
        );
      })}

      <button
        className="px-3 py-1 border rounded disabled:opacity-50"
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
