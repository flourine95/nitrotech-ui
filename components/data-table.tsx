'use client';
import { memo, type ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  width?: string;
  hidden?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  isError?: boolean;
  isFetching?: boolean;
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  allSelected?: boolean;
  someSelected?: boolean;
  onToggleSelect?: (id: string | number) => void;
  onToggleSelectAll?: () => void;
  totalSelectableCount?: never;
  currentPage?: number;
  totalPages?: number;
  totalElements?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  rowLabel?: string;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: ReactNode;
  errorTitle?: string;
  errorDescription?: string;
  errorIcon?: ReactNode;
  rowClassName?: (row: T) => string | undefined;
}

function SkeletonRows({ cols, rows }: { cols: number; rows: number }) {
  const cappedRows = Math.min(rows, 10);
  return (
    <div className="divide-y">
      {Array.from({ length: cappedRows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={cn('h-4', j === 0 ? 'w-4' : j === 1 ? 'w-40' : 'w-20')} />
          ))}
        </div>
      ))}
    </div>
  );
}

function PaginationFooter({
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  pageSizeOptions,
  rowLabel,
  selectedCount,
  onPageChange,
  onPageSizeChange,
}: {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  pageSizeOptions: number[];
  rowLabel: string;
  selectedCount: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  return (
    <div className="flex flex-col-reverse items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground sm:flex-row">
      <p className="flex-1 whitespace-nowrap">
        {selectedCount > 0 ? (
          <span>
            <span className="font-medium text-foreground">{selectedCount}</span> / {totalElements} {rowLabel} đã chọn
          </span>
        ) : (
          <span>{totalElements} {rowLabel}</span>
        )}
      </p>

      <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Mỗi trang</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-16">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" side="top" sideOffset={4}>
              {pageSizeOptions.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-center whitespace-nowrap">
          Trang {currentPage + 1} / {totalPages}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline" size="icon" className="hidden size-8 lg:flex"
            onClick={() => onPageChange(0)}
            disabled={currentPage === 0}
            aria-label="Trang đầu"
          >
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline" size="icon" className="size-8"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Trang trước"
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline" size="icon" className="size-8"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Trang sau"
          >
            <ChevronRight />
          </Button>
          <Button
            variant="outline" size="icon" className="hidden size-8 lg:flex"
            onClick={() => onPageChange(totalPages - 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Trang cuối"
          >
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

export const DataTable = memo(function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  isError = false,
  isFetching = false,
  selectable = false,
  selectedIds,
  allSelected = false,
  someSelected = false,
  onToggleSelect,
  onToggleSelectAll,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50],
  onPageChange,
  onPageSizeChange,
  rowLabel = 'mục',
  emptyIcon,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  errorTitle = 'Không thể tải dữ liệu',
  errorDescription = 'Kiểm tra kết nối và thử lại',
  errorIcon,
  rowClassName,
}: DataTableProps<T>) {
  const visibleColumns = columns.filter((c) => !c.hidden);
  const colCount = visibleColumns.length + (selectable ? 1 : 0);
  const selectedCount = selectedIds?.size ?? 0;

  return (
    <div className="rounded-md border">
      {loading ? (
        <SkeletonRows cols={colCount} rows={pageSize} />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          {errorIcon && <div className="mb-3">{errorIcon}</div>}
          <p className="text-sm font-medium text-foreground">{errorTitle}</p>
          <p className="mt-1 text-xs">{errorDescription}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
          <p className="text-sm font-medium">{emptyTitle}</p>
          {emptyDescription && <div className="mt-1 text-xs">{emptyDescription}</div>}
        </div>
      ) : (
        <div
          className={cn(
            'transition-opacity duration-150',
            isFetching && 'pointer-events-none opacity-50',
          )}
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {selectable && (
                  <TableHead className="w-10 px-4">
                    <Checkbox
                      checked={someSelected ? 'indeterminate' : allSelected}
                      onCheckedChange={onToggleSelectAll}
                      aria-label="Chọn tất cả"
                    />
                  </TableHead>
                )}
                {visibleColumns.map((col) => (
                  <TableHead key={col.key} className={cn(col.className, col.width)}>
                    {col.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => {
                const id = rowKey(row);
                return (
                  <TableRow
                    key={id}
                    data-state={selectedIds?.has(id) ? 'selected' : undefined}
                    className={rowClassName?.(row)}
                  >
                    {selectable && (
                      <TableCell className="px-4">
                        <Checkbox
                          checked={selectedIds?.has(id) ?? false}
                          onCheckedChange={() => onToggleSelect?.(id)}
                          aria-label={`Chọn hàng ${id}`}
                        />
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.cell(row)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!loading && totalElements > 0 && onPageChange && onPageSizeChange && (
        <PaginationFooter
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          rowLabel={rowLabel}
          selectedCount={selectedCount}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      )}
    </div>
  );
}) as <T>(props: DataTableProps<T>) => ReactNode;
