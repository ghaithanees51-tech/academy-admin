import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange?: (rows: number) => void;
  rowsPerPageOptions?: number[];
  showRowsPerPage?: boolean;
  showEntriesInfo?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  rowsPerPage,
  totalItems,
  startIndex,
  endIndex,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 25, 50, 100],
  showRowsPerPage = true,
  showEntriesInfo = true,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onRowsPerPageChange) {
      onRowsPerPageChange(Number(e.target.value));
      onPageChange(1); // Reset to first page when changing rows per page
    }
  };

  if (totalPages === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
      {showRowsPerPage && onRowsPerPageChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select 
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {rowsPerPageOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
      )}

      <div className="flex items-center gap-1">
        <button 
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &lt;
        </button>
        
        {getPageNumbers().map((page, idx) => (
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-sm text-slate-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-gray-600 hover:bg-slate-50'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &gt;
        </button>
      </div>

      {showEntriesInfo && (
        <div className="text-sm text-gray-600">
          {startIndex + 1} - {Math.min(endIndex, totalItems)} of {totalItems} entries
        </div>
      )}
    </div>
  );
};

export default Pagination;

