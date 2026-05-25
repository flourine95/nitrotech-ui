import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { usePaginationPages } from './use-pagination-pages';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pages = usePaginationPages(page, totalPages);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      {/* First page */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={page === 0}
        onClick={() => onPageChange(0)}
        aria-label="Trang đầu"
      >
        <ChevronsLeft data-icon />
      </Button>

      {/* Previous page */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={page === 0}
        onClick={() => onPageChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft data-icon />
      </Button>

      {/* Page numbers with ellipsis */}
      {pages.map((pageNum) => {
        if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
          return (
            <div
              key={pageNum}
              className="flex size-9 items-center justify-center text-sm text-muted-foreground"
            >
              ...
            </div>
          );
        }

        return (
          <Button
            key={pageNum}
            variant={page === pageNum ? 'default' : 'outline'}
            size="sm"
            className="size-9 rounded-full"
            onClick={() => onPageChange(pageNum)}
            aria-label={`Trang ${pageNum + 1}`}
            aria-current={page === pageNum ? 'page' : undefined}
          >
            {pageNum + 1}
          </Button>
        );
      })}

      {/* Next page */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight data-icon />
      </Button>

      {/* Last page */}
      <Button
        variant="outline"
        size="icon"
        className="rounded-full"
        disabled={page >= totalPages - 1}
        onClick={() => onPageChange(totalPages - 1)}
        aria-label="Trang cuối"
      >
        <ChevronsRight data-icon />
      </Button>
    </div>
  );
}
