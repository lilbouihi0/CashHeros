import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for handling pagination
 * @param {Object} options - Pagination options
 * @param {number} options.initialPage - Initial page number (default: 1)
 * @param {number} options.initialLimit - Initial items per page (default: 10)
 * @param {number} options.totalItems - Total number of items (optional)
 * @param {Function} options.onPageChange - Callback when page changes
 * @returns {Object} - Pagination state and handlers
 */
const usePagination = ({
  initialPage = 1,
  initialLimit = 10,
  totalItems = 0,
  onPageChange = null
} = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(totalItems);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Update total items
  const updateTotal = useCallback((newTotal) => {
    setTotal(newTotal);
  }, []);

  // Go to specific page
  const goToPage = useCallback((newPage) => {
    const pageNumber = Math.max(1, Math.min(newPage, totalPages));
    setPage(pageNumber);
  }, [totalPages]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      goToPage(page + 1);
    }
  }, [page, totalPages, goToPage]);

  // Go to previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1);
    }
  }, [page, goToPage]);

  // Change items per page
  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    // Reset to first page when changing limit
    setPage(1);
  }, []);

  // Call onPageChange callback when page or limit changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange({ page, limit });
    }
  }, [page, limit, onPageChange]);

  // Reset to first page if total pages decreases below current page
  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages));
    }
  }, [page, totalPages]);

  return {
    page,
    limit,
    total,
    totalPages,
    updateTotal,
    goToPage,
    nextPage,
    prevPage,
    changeLimit,
    // Helper values
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    // For API requests
    offset: (page - 1) * limit,
    // For displaying page ranges
    startItem: Math.min(total, (page - 1) * limit + 1),
    endItem: Math.min(total, page * limit)
  };
};

export default usePagination;