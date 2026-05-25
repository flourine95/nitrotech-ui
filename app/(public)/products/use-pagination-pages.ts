import { useMemo } from 'react';

type PageItem = number | 'ellipsis-start' | 'ellipsis-end';

export function usePaginationPages(currentPage: number, totalPages: number): PageItem[] {
  return useMemo(() => {
    const pages: PageItem[] = [];
    const showPages = 5;
    const sidePages = 2;

    if (totalPages <= showPages + 2) {
      // Show all pages if total is small
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(0);

      // Calculate range around current page
      let start = Math.max(1, currentPage - sidePages);
      let end = Math.min(totalPages - 2, currentPage + sidePages);

      // Adjust if near start
      if (currentPage < sidePages + 2) {
        end = showPages - 1;
      }

      // Adjust if near end
      if (currentPage > totalPages - sidePages - 3) {
        start = totalPages - showPages;
      }

      // Add ellipsis after first page if needed
      if (start > 1) {
        pages.push('ellipsis-start');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 2) {
        pages.push('ellipsis-end');
      }

      // Always show last page
      pages.push(totalPages - 1);
    }

    return pages;
  }, [currentPage, totalPages]);
}
