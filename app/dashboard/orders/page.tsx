'use client';
import { useDeferredValue, useState, useTransition } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { type Order, type OrderStatus } from '@/lib/api/orders';
import { mockOrdersPage } from '@/lib/mocks/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DateRangePicker, parseLocalDate, formatDateKey } from './date-range-picker';
import { usePagination } from '@/hooks/use-pagination';
import { cn } from '@/lib/utils';

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZES = [5, 10, 20, 50];

const statusConfig: Record<
  OrderStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  PENDING: { label: 'Chờ xác nhận', variant: 'secondary' },
  CONFIRMED: { label: 'Đã xác nhận', variant: 'outline' },
  SHIPPING: { label: 'Đang giao', variant: 'default' },
  COMPLETED: { label: 'Hoàn thành', variant: 'outline' },
  CANCELLED: { label: 'Đã hủy', variant: 'destructive' },
};

const ALL_STATUSES: Array<{ value: OrderStatus; label: string }> = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// ─── Sort header ──────────────────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  sortBy,
  sortDir,
  onSort,
}: {
  label: string;
  field: string;
  sortBy: string;
  sortDir: 'asc' | 'desc';
  onSort: (f: string) => void;
}) {
  const active = sortBy === field;
  return (
    <button
      className={cn(
        'flex items-center gap-1 transition-colors hover:text-foreground',
        active ? 'font-semibold text-foreground' : 'text-muted-foreground',
      )}
      onClick={() => onSort(field)}
    >
      {label}
      {active ? (
        sortDir === 'asc' ? (
          <ArrowUpIcon className="size-3.5" />
        ) : (
          <ArrowDownIcon className="size-3.5" />
        )
      ) : (
        <ArrowUpDownIcon className="size-3.5 opacity-40" />
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardOrdersPage() {
  // ── URL state (applied filters) ──
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [dateFrom, setDateFrom] = useQueryState('from', parseAsString.withDefault(''));
  const [dateTo, setDateTo] = useQueryState('to', parseAsString.withDefault(''));
  const [statuses, setStatuses] = useQueryState('st', parseAsString.withDefault(''));
  const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('createdAt'));
  const [sortDir, setSortDir] = useQueryState(
    'dir',
    parseAsStringEnum<'asc' | 'desc'>(['asc', 'desc']).withDefault('desc'),
  );
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(10));

  // ── Sheet draft state (pending, not yet applied) ──
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftStatuses, setDraftStatuses] = useState<OrderStatus[]>([]);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined);

  function openSheet() {
    // Init draft từ applied state
    setDraftStatuses(statuses ? (statuses.split(',') as OrderStatus[]) : []);
    setDraftRange(
      dateFrom
        ? { from: parseLocalDate(dateFrom), to: dateTo ? parseLocalDate(dateTo) : undefined }
        : undefined,
    );
    setSheetOpen(true);
  }

  function applySheet() {
    setStatuses(draftStatuses.length ? draftStatuses.join(',') : '');
    setDateFrom(draftRange?.from ? formatDateKey(draftRange.from) : '');
    setDateTo(draftRange?.to ? formatDateKey(draftRange.to) : '');
    setCurrentPage(0);
    setSheetOpen(false);
  }

  function resetSheet() {
    setDraftStatuses([]);
    setDraftRange(undefined);
  }

  function toggleDraftStatus(s: OrderStatus) {
    setDraftStatuses((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  // Applied filters derived
  const appliedStatuses = statuses ? (statuses.split(',') as OrderStatus[]) : [];
  const appliedRange: DateRange | undefined = dateFrom
    ? { from: parseLocalDate(dateFrom), to: dateTo ? parseLocalDate(dateTo) : undefined }
    : undefined;

  const activeFilterCount = (appliedStatuses.length > 0 ? 1 : 0) + (dateFrom ? 1 : 0);

  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  function handleSort(field: string) {
    startTransition(() => {
      if (sortBy === field) void setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      else {
        void setSortBy(field);
        void setSortDir('desc');
      }
      void setCurrentPage(0);
    });
  }

  function clearAllFilters() {
    startTransition(() => {
      void setSearch('');
      void setStatuses('');
      void setDateFrom('');
      void setDateTo('');
      void setSortBy('createdAt');
      void setSortDir('desc');
      void setCurrentPage(0);
    });
  }

  // ── Queries ──
  const ordersQuery = useQuery({
    queryKey: [
      'orders',
      deferredSearch,
      statuses,
      dateFrom,
      dateTo,
      sortBy,
      sortDir,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      Promise.resolve(
        mockOrdersPage({
          search: deferredSearch || undefined,
          statuses: appliedStatuses.length ? appliedStatuses : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          sortDir,
          page: currentPage,
          size: pageSize,
        }),
      ),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

  const summaryQuery = useQuery({
    queryKey: ['orders-summary'],
    queryFn: async () => {
      const results = await Promise.all(
        ALL_STATUSES.map((s) => Promise.resolve(mockOrdersPage({ statuses: [s.value], size: 1 }))),
      );
      return Object.fromEntries(
        ALL_STATUSES.map((s, i) => [s.value, results[i].totalElements]),
      ) as Record<OrderStatus, number>;
    },
    staleTime: 60_000,
  });

  const orders = ordersQuery.data?.content ?? [];
  const totalPages = ordersQuery.data?.totalPages ?? 0;
  const totalElements = ordersQuery.data?.totalElements ?? 0;

  // ── Columns ──
  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: 'code',
      header: () => (
        <SortHeader
          label="Mã đơn"
          field="code"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ),
      cell: ({ row }) => <span className="font-mono font-semibold">{row.original.code}</span>,
    },
    {
      accessorKey: 'customerName',
      header: () => (
        <SortHeader
          label="Khách hàng"
          field="customerName"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.customerName}</span>
          <span className="text-xs text-muted-foreground">{row.original.customerEmail}</span>
        </div>
      ),
    },
    {
      accessorKey: 'itemCount',
      header: 'Sản phẩm',
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.itemCount} sp</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: () => (
        <div className="flex justify-end">
          <SortHeader
            label="Tổng tiền"
            field="totalAmount"
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
          />
        </div>
      ),
      meta: { className: 'text-right' },
      cell: ({ row }) => (
        <div className="text-right font-semibold">{vnd.format(row.original.totalAmount)}</div>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: () => (
        <SortHeader
          label="Ngày đặt"
          field="createdAt"
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        const cfg = statusConfig[row.original.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <Button variant="ghost" size="icon-sm" aria-label={`Xem đơn ${row.original.code}`}>
          <EyeIcon />
        </Button>
      ),
      size: 48,
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: totalPages,
  });

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: currentPage + 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Đơn hàng</h1>
        <p className="text-sm text-muted-foreground">{totalElements} đơn hàng</p>
      </div>

      {/* Summary cards — click để quick filter 1 status */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <button
          onClick={clearAllFilters}
          className={cn(
            'flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent',
            !statuses && !dateFrom && 'ring-2 ring-ring',
          )}
        >
          <Badge
            variant="secondary"
            className="size-9 justify-center text-base font-bold tabular-nums"
          >
            {summaryQuery.data ? Object.values(summaryQuery.data).reduce((a, b) => a + b, 0) : 0}
          </Badge>
          <span className="text-sm">Tất cả</span>
        </button>
        {ALL_STATUSES.map((s) => {
          const isActive =
            appliedStatuses.length === 1 && appliedStatuses[0] === s.value && !dateFrom;
          return (
            <button
              key={s.value}
              onClick={() => {
                setStatuses(s.value);
                setDateFrom('');
                setDateTo('');
                setCurrentPage(0);
              }}
              className={cn(
                'flex items-center gap-3 rounded-lg border bg-card p-4 text-left transition-colors hover:bg-accent',
                isActive && 'ring-2 ring-ring',
              )}
            >
              <Badge
                variant={statusConfig[s.value].variant}
                className="size-9 justify-center text-base font-bold tabular-nums"
              >
                {summaryQuery.data?.[s.value] ?? 0}
              </Badge>
              <span className="text-sm">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: search + filter button + active tags */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            type="search"
            placeholder="Tìm mã đơn, tên, email khách hàng..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            className="pl-9"
          />
        </div>

        {/* Filter button */}
        <Button variant="outline" onClick={openSheet} className="relative shrink-0">
          <FilterIcon className="size-4" />
          Bộ lọc
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full p-0 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* Active filter tags */}
        {(appliedStatuses.length > 0 || appliedRange) && (
          <div className="flex flex-wrap gap-1.5">
            {appliedStatuses.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1 pr-1">
                {statusConfig[s].label}
                <button
                  onClick={() => {
                    setStatuses(appliedStatuses.filter((x) => x !== s).join(','));
                    setCurrentPage(0);
                  }}
                  className="ml-0.5 hover:text-foreground"
                  aria-label={`Xóa filter ${statusConfig[s].label}`}
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            ))}
            {appliedRange?.from && (
              <Badge variant="secondary" className="gap-1 pr-1">
                {appliedRange.to
                  ? `${appliedRange.from.toLocaleDateString('vi-VN')} – ${appliedRange.to.toLocaleDateString('vi-VN')}`
                  : appliedRange.from.toLocaleDateString('vi-VN')}
                <button
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setCurrentPage(0);
                  }}
                  className="ml-0.5 hover:text-foreground"
                  aria-label="Xóa filter ngày"
                >
                  <XIcon className="size-3" />
                </button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearAllFilters}
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className={cn(
          'rounded-lg border bg-card transition-opacity duration-150',
          (ordersQuery.isFetching && !ordersQuery.isLoading) || isPending
            ? 'opacity-60'
            : 'opacity-100',
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={(header.column.columnDef.meta as { className?: string })?.className}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {ordersQuery.isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as { className?: string })?.className}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground"
                >
                  Không tìm thấy đơn hàng nào
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Pagination footer */}
        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <p className="text-sm whitespace-nowrap text-muted-foreground">
              {totalElements > 0
                ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, totalElements)} / ${totalElements}`
                : '0 kết quả'}
            </p>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-2">
              <span className="text-sm whitespace-nowrap text-muted-foreground">Hiển thị</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setCurrentPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      startTransition(() => {
                        void setCurrentPage(Math.max(0, currentPage - 1));
                      })
                    }
                    disabled={currentPage === 0}
                  >
                    <ChevronLeftIcon /> Trước
                  </Button>
                </PaginationItem>
                {showLeftEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                {pages.map((page) => (
                  <PaginationItem key={page}>
                    <Button
                      size="icon"
                      variant={page === currentPage + 1 ? 'default' : 'outline'}
                      onClick={() =>
                        startTransition(() => {
                          void setCurrentPage(page - 1);
                        })
                      }
                    >
                      {page}
                    </Button>
                  </PaginationItem>
                ))}
                {showRightEllipsis && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      startTransition(() => {
                        void setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
                      })
                    }
                    disabled={currentPage >= totalPages - 1}
                  >
                    Sau <ChevronRightIcon />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>

      {/* Filter Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Bộ lọc</SheetTitle>
          </SheetHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {/* Trạng thái — multi-select */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Trạng thái</p>
              <div className="flex flex-wrap gap-2">
                {ALL_STATUSES.map((s) => {
                  const active = draftStatuses.includes(s.value);
                  return (
                    <button
                      key={s.value}
                      onClick={() => toggleDraftStatus(s.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm transition-colors',
                        active
                          ? 'border-foreground bg-foreground text-background'
                          : 'bg-background text-foreground hover:bg-accent',
                      )}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
              {draftStatuses.length > 0 && (
                <button
                  onClick={() => setDraftStatuses([])}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Bỏ chọn tất cả
                </button>
              )}
            </div>

            <Separator />

            {/* Khoảng ngày */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Khoảng ngày đặt</p>
              <DateRangePicker value={draftRange} onChange={setDraftRange} className="w-full" />
            </div>
          </div>

          <SheetFooter className="flex-row gap-2 border-t px-6 py-4">
            <Button variant="outline" className="flex-1" onClick={resetSheet}>
              Đặt lại
            </Button>
            <Button className="flex-1" onClick={applySheet}>
              Áp dụng
              {(draftStatuses.length > 0 || draftRange) && (
                <Badge variant="secondary" className="ml-1">
                  {(draftStatuses.length > 0 ? 1 : 0) + (draftRange ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
