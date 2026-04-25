'use client';
import { useDeferredValue, useState, useTransition } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import type { DateRange } from 'react-day-picker';
import { type Order, type OrderStatus } from '@/lib/api/orders';
import { mockOrdersPage } from '@/lib/mocks/orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
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
  PENDING:   { label: 'Chờ xác nhận', variant: 'secondary' },
  CONFIRMED: { label: 'Đã xác nhận',  variant: 'outline' },
  SHIPPING:  { label: 'Đang giao',    variant: 'default' },
  COMPLETED: { label: 'Hoàn thành',   variant: 'secondary' },
  CANCELLED: { label: 'Đã hủy',       variant: 'destructive' },
};

const STATUS_FILTERS: Array<{ value: OrderStatus | 'all'; label: string }> = [
  { value: 'all',       label: 'Tất cả' },
  { value: 'PENDING',   label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'SHIPPING',  label: 'Đang giao' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã hủy' },
];

const ALL_STATUSES = STATUS_FILTERS.filter((f) => f.value !== 'all') as Array<{ value: OrderStatus; label: string }>;

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
  const [statusFilter, setStatusFilter] = useQueryState('st', parseAsString.withDefault('all'));
  const [sortBy, setSortBy] = useQueryState('sort', parseAsString.withDefault('createdAt'));
  const [sortDir, setSortDir] = useQueryState('dir', parseAsString.withDefault('desc') as ReturnType<typeof parseAsString>);
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(10));

  // ── Sheet draft state (pending, not yet applied) ──
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined);

  function openSheet() {
    setDraftRange(
      dateFrom
        ? { from: parseLocalDate(dateFrom), to: dateTo ? parseLocalDate(dateTo) : undefined }
        : undefined,
    );
    setSheetOpen(true);
  }

  function applySheet() {
    setDateFrom(draftRange?.from ? formatDateKey(draftRange.from) : '');
    setDateTo(draftRange?.to ? formatDateKey(draftRange.to) : '');
    setCurrentPage(0);
    setSheetOpen(false);
  }

  function resetSheet() {
    setDraftRange(undefined);
  }

  // Applied filters derived
  const appliedStatuses = statusFilter !== 'all' ? [statusFilter as OrderStatus] : [];
  const appliedRange: DateRange | undefined = dateFrom
    ? { from: parseLocalDate(dateFrom), to: dateTo ? parseLocalDate(dateTo) : undefined }
    : undefined;

  const activeFilterCount = (dateFrom ? 1 : 0);

  const [isPending, startTransition] = useTransition();
  const deferredSearch = useDeferredValue(search);

  function handleSort(field: string) {
    startTransition(() => {
      if (sortBy === field) void setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      else { void setSortBy(field); void setSortDir('desc'); }
      void setCurrentPage(0);
    });
  }

  function clearAllFilters() {
    startTransition(() => {
      void setSearch('');
      void setStatusFilter('all');
      void setDateFrom('');
      void setDateTo('');
      void setSortBy('createdAt');
      void setSortDir('desc');
      void setCurrentPage(0);
    });
  }

  // ── Queries ──
  const ordersQuery = useQuery({
    queryKey: ['orders', deferredSearch, statusFilter, dateFrom, dateTo, sortBy, sortDir, currentPage, pageSize],
    queryFn: () =>
      Promise.resolve(
        mockOrdersPage({
          search: deferredSearch || undefined,
          statuses: appliedStatuses.length ? appliedStatuses : undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
          sortBy,
          sortDir: sortDir as 'asc' | 'desc',
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
        <SortHeader label="Mã đơn" field="code" sortBy={sortBy} sortDir={sortDir as 'asc' | 'desc'} onSort={handleSort} />
      ),
      cell: ({ row }) => (
        <span className="font-mono font-semibold">{row.original.code}</span>
      ),
    },
    {
      accessorKey: 'customerName',
      header: () => (
        <SortHeader label="Khách hàng" field="customerName" sortBy={sortBy} sortDir={sortDir as 'asc' | 'desc'} onSort={handleSort} />
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
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.itemCount} sản phẩm</span>,
    },
    {
      accessorKey: 'totalAmount',
      header: () => (
        <div className="flex justify-end">
          <SortHeader label="Tổng tiền" field="totalAmount" sortBy={sortBy} sortDir={sortDir as 'asc' | 'desc'} onSort={handleSort} />
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
        <SortHeader label="Ngày đặt" field="createdAt" sortBy={sortBy} sortDir={sortDir as 'asc' | 'desc'} onSort={handleSort} />
      ),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng</h1>
          <p className="mt-1 text-sm text-muted-foreground">{totalElements} đơn hàng</p>
        </div>
      </div>

      {/* Toolbar: search + status toggle + date filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm mã đơn, tên, email khách hàng..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(0); }}
            className="h-9 pl-9"
          />
          {search && (
            <Button variant="ghost" size="icon" aria-label="Xóa tìm kiếm"
              onClick={() => { setSearch(''); setCurrentPage(0); }}
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            >
              <XIcon />
            </Button>
          )}
        </div>

        {/* Status toggle — inline như products */}
        <div className="flex h-9 items-center rounded-md border bg-muted/40 p-0.5">
          <ToggleGroup
            type="single"
            value={statusFilter}
            onValueChange={(v) => { if (v) { setStatusFilter(v); setCurrentPage(0); } }}
            className="gap-0"
          >
            {STATUS_FILTERS.map((f) => (
              <ToggleGroupItem
                key={f.value}
                value={f.value}
                className="h-8 rounded px-3 text-sm data-[state=on]:bg-background data-[state=on]:font-medium data-[state=on]:shadow-sm"
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {/* Date filter button */}
        <Button variant="outline" onClick={openSheet} className="relative h-9 shrink-0">
          <FilterIcon className="size-4" />
          Ngày đặt
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-1.5 -right-1.5 size-4 justify-center rounded-full p-0 text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Active date filter chip */}
      {appliedRange?.from && (
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary" className="gap-1 pr-1">
            {appliedRange.to
              ? `${appliedRange.from.toLocaleDateString('vi-VN')} – ${appliedRange.to.toLocaleDateString('vi-VN')}`
              : appliedRange.from.toLocaleDateString('vi-VN')}
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(0); }}
              className="ml-0.5 hover:text-foreground"
              aria-label="Xóa filter ngày"
            >
              <XIcon className="size-3" />
            </button>
          </Badge>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAllFilters}>
            Xóa tất cả
          </Button>
        </div>
      )}

      {/* Table */}
      <div className={cn(
        'rounded-md border bg-card transition-opacity duration-150',
        (ordersQuery.isFetching && !ordersQuery.isLoading) || isPending ? 'opacity-60' : 'opacity-100',
      )}>
        {ordersQuery.isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <AlertCircleIcon className="mb-3 h-10 w-10 text-destructive/40" />
            <p className="text-sm font-medium text-foreground">Không thể tải dữ liệu</p>
            <p className="mt-1 text-xs">Kiểm tra kết nối và thử lại</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => ordersQuery.refetch()}>
              Thử lại
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent">
                  {hg.headers.map((header) => (
                    <TableHead key={header.id} className={(header.column.columnDef.meta as { className?: string })?.className}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {ordersQuery.isLoading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-3.5 w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="ml-auto h-3.5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-3.5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                  </TableRow>
                ))
              ) : table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/orders/${row.original.id}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={(cell.column.columnDef.meta as { className?: string })?.className}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                    Không tìm thấy đơn hàng nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination footer */}
        {!ordersQuery.isError && (
          <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <p className="text-sm whitespace-nowrap text-muted-foreground">
                {totalElements > 0
                  ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, totalElements)} / ${totalElements}`
                  : '0 kết quả'}
              </p>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Mỗi trang</span>
                <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(0); }}>
                  <SelectTrigger className="h-8 w-16"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((s) => (
                      <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button variant="ghost" size="sm"
                      onClick={() => startTransition(() => { void setCurrentPage(Math.max(0, currentPage - 1)); })}
                      disabled={currentPage === 0}
                    >
                      <ChevronLeftIcon /> Trước
                    </Button>
                  </PaginationItem>
                  {showLeftEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                  {pages.map((page) => (
                    <PaginationItem key={page}>
                      <Button size="icon" variant={page === currentPage + 1 ? 'default' : 'outline'}
                        onClick={() => startTransition(() => { void setCurrentPage(page - 1); })}
                      >
                        {page}
                      </Button>
                    </PaginationItem>
                  ))}
                  {showRightEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                  <PaginationItem>
                    <Button variant="ghost" size="sm"
                      onClick={() => startTransition(() => { void setCurrentPage(Math.min(totalPages - 1, currentPage + 1)); })}
                      disabled={currentPage >= totalPages - 1}
                    >
                      Sau <ChevronRightIcon />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </div>

      {/* Date filter Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-sm">
          <SheetHeader className="border-b px-6 py-4">
            <SheetTitle>Lọc theo ngày</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <div className="space-y-3">
              <p className="text-sm font-medium">Khoảng ngày đặt</p>
              <DateRangePicker value={draftRange} onChange={setDraftRange} className="w-full" />
            </div>
          </div>
          <SheetFooter className="flex-row gap-2 border-t px-6 py-4">
            <Button variant="outline" className="flex-1" onClick={resetSheet}>Đặt lại</Button>
            <Button className="flex-1" onClick={applySheet}>Áp dụng</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
