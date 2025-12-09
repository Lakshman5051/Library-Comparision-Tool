import React from 'react';
import './Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange, totalItems }) {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis
      if (currentPage < 3) {
        // Near the start
        pages.push(0, 1, 2, 3, '...', totalPages - 1);
      } else if (currentPage > totalPages - 4) {
        // Near the end
        pages.push(0, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        // In the middle
        pages.push(0, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages - 1);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  // Calculate item range
  const startItem = currentPage * 20 + 1;
  const endItem = Math.min((currentPage + 1) * 20, totalItems);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {startItem}-{endItem} of {totalItems} libraries
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={handlePrevious}
          disabled={currentPage === 0}
          title="Previous page"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Previous
        </button>

        <div className="pagination-numbers">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
            ) : (
              <button
                key={page}
                className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageClick(page)}
              >
                {page + 1}
              </button>
            )
          ))}
        </div>

        <button
          className="pagination-button"
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          title="Next page"
        >
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Pagination;