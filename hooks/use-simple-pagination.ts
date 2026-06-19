type UseSimplePaginationProps = {
  currentPage: number;
  totalPages: number;
};

type UseSimplePaginationReturn = {
  currentPage: number;
  currentPageLabel: number;
  totalPages: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  previousPage: number;
  nextPage: number;
};

export function useSimplePagination({
  currentPage,
  totalPages,
}: UseSimplePaginationProps): UseSimplePaginationReturn {
  const safeTotalPages = Math.max(0, totalPages);
  const lastPage = Math.max(0, safeTotalPages - 1);
  const safeCurrentPage = Math.min(Math.max(0, currentPage), lastPage);

  return {
    currentPage: safeCurrentPage,
    currentPageLabel: safeTotalPages === 0 ? 0 : safeCurrentPage + 1,
    totalPages: safeTotalPages,
    canGoPrevious: safeCurrentPage > 0,
    canGoNext: safeCurrentPage < lastPage,
    previousPage: Math.max(0, safeCurrentPage - 1),
    nextPage: Math.min(lastPage, safeCurrentPage + 1),
  };
}
