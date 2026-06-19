'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import {
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  PackageIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShoppingCartIcon,
  XIcon,
} from 'lucide-react';

import { MultipleSortPopover } from '@/components/dashboard/multiple-sort-popover';
import { PageSizeDropdown } from '@/components/dashboard/page-size-dropdown';
import { StatusChip } from '@/components/dashboard/status-chip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { useSimplePagination } from '@/hooks/use-simple-pagination';
import {
  createAdminOrderShipment,
  getAdminOrderFacets,
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrderListItem,
  type AdminOrderStatus,
  type AdminPaymentMethod,
} from '@/lib/api/admin/orders';
import { cn } from '@/lib/utils';
import { formatVnd } from '@/lib/utils/formatting';
import { DateRangePicker } from './date-range-picker';
import {
  ExportCurrentPageButton,
  FilterDropdown,
  NextOrderStatus,
  OrderCard,
  OrderCardSkeleton,
} from './order-list-components';
import {
  ALL,
  AMOUNT_MAX_MILLION,
  AMOUNT_MIN_MILLION,
  PAGE_SIZES,
  exportOrdersPage,
  sortFields,
} from './order-list-helpers';
import { useOrderListState } from './use-order-list-state';

type FilterOption = { value: string; label: string; count?: number };
const EMPTY_FILTER_OPTIONS: FilterOption[] = [];
const EMPTY_ORDERS: AdminOrderListItem[] = [];
const SORT_LABELS = {
  trigger: (count: number) => `Sắp xếp (${count})`,
  title: 'Tiêu chí sắp xếp',
  fieldPlaceholder: 'Chọn cột',
  descending: 'Giảm dần',
  ascending: 'Tăng dần',
  addRule: 'Thêm tiêu chí',
  reset: 'Đặt lại',
  moveUp: 'Lên',
  moveDown: 'Xuống',
  removeRule: 'Xóa tiêu chí',
};

const OrdersFilterSidebar = memo(function OrdersFilterSidebar({
  searchInput,
  statusFilter,
  statusOptions,
  isFacetLoading,
  paymentMethod,
  paymentOptions,
  datePopoverOpen,
  dateFilterLabel,
  draftRange,
  amountRange,
  onSearchInputChange,
  onClearSearch,
  onStatusChange,
  onPaymentMethodChange,
  onDatePopoverOpenChange,
  onOpenDatePopover,
  onDraftRangeChange,
  onResetDraftRange,
  onApplyDateFilter,
  onAmountRangeChange,
  onClearAllFilters,
}: {
  searchInput: string;
  statusFilter: string;
  statusOptions: FilterOption[];
  isFacetLoading: boolean;
  paymentMethod: string;
  paymentOptions: FilterOption[];
  datePopoverOpen: boolean;
  dateFilterLabel: string;
  draftRange: DateRange | undefined;
  amountRange: number[];
  onSearchInputChange: (value: string) => void;
  onClearSearch: () => void;
  onStatusChange: (value: string) => void;
  onPaymentMethodChange: (value: string) => void;
  onDatePopoverOpenChange: (open: boolean) => void;
  onOpenDatePopover: () => void;
  onDraftRangeChange: (range: DateRange | undefined) => void;
  onResetDraftRange: () => void;
  onApplyDateFilter: () => void;
  onAmountRangeChange: (value: number[]) => void;
  onClearAllFilters: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Tìm đơn bán hàng..."
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          className="h-10 pl-10 pr-9 2xl:h-11"
        />
        {searchInput ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Xóa tìm kiếm"
            onClick={onClearSearch}
            className="absolute inset-y-0 right-1 my-auto size-7"
          >
            <XIcon />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Trạng thái đơn</p>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-background/70">
          {isFacetLoading && statusOptions.length <= 1 ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-10 w-full items-center justify-between border-b border-border/60 px-3 py-2 last:border-b-0"
              >
                <span className="flex items-center gap-2.5">
                  <Skeleton className="size-2 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </span>
                <Skeleton className="h-4 w-6" />
              </div>
            ))
          ) : statusOptions.map((item) => {
            const active = statusFilter === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={cn(
                  'flex min-h-10 w-full items-center justify-between border-b border-border/60 px-3 py-2 text-left text-foreground/80 transition-colors last:border-b-0 hover:bg-muted/20 hover:text-foreground',
                  active && 'bg-foreground/4.5 text-foreground',
                )}
                onClick={() => onStatusChange(item.value)}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'size-2 rounded-full border',
                      active ? 'border-foreground/70 bg-foreground/70' : 'border-border/80 bg-background',
                    )}
                  />
                  <span className="text-[13px] font-medium">{item.label}</span>
                </span>
                <span className={cn('text-[13px] font-medium', active ? 'text-foreground' : 'text-foreground/65')}>
                  {isFacetLoading ? <Skeleton className="h-4 w-6" /> : item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      <FilterDropdown
        label="Thanh toán"
        icon={CreditCardIcon}
        value={paymentMethod}
        options={paymentOptions}
        onChange={onPaymentMethodChange}
      />

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Ngày đặt</p>
        <Popover open={datePopoverOpen} onOpenChange={onDatePopoverOpenChange}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-10 justify-between font-normal shadow-none"
              onClick={onOpenDatePopover}
            >
              <span className="truncate">{dateFilterLabel}</span>
              <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            side="bottom"
            sideOffset={6}
            className="w-(--radix-popover-trigger-width) min-w-80 gap-4 p-4"
          >
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Khoảng ngày đặt</p>
              <DateRangePicker value={draftRange} onChange={onDraftRangeChange} className="w-full" />
            </div>
            <Separator />
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-9" onClick={onResetDraftRange}>
                Đặt lại
              </Button>
              <Button className="h-9" onClick={onApplyDateFilter}>
                Áp dụng
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Giá trị</p>
        <div className="rounded-xl border border-border/60 bg-background/70 p-3">
          <Slider
            value={amountRange}
            min={AMOUNT_MIN_MILLION}
            max={AMOUNT_MAX_MILLION}
            step={5}
            onValueChange={onAmountRangeChange}
            aria-label="Khoảng giá trị đơn hàng"
          />
          <div className="mt-3 flex items-center justify-between text-[13px] font-medium">
            <span>{amountRange[0]} triệu</span>
            <span>{amountRange[1]} triệu</span>
          </div>
        </div>
      </div>

      <Button variant="ghost" className="h-9 justify-start px-2" onClick={onClearAllFilters}>
        <RotateCcwIcon data-icon="inline-start" />
        Đặt lại bộ lọc
      </Button>
    </div>
  );
});

export default function DashboardOrdersPage() {
  const queryClient = useQueryClient();
  const { state, actions } = useOrderListState();
  const {
    search,
    searchInput,
    dateFrom,
    dateTo,
    statusFilter,
    paymentMethod,
    sortParam,
    currentPage,
    pageSize,
    amountMin,
    amountMax,
    amountRange,
    datePopoverOpen,
    draftRange,
    isPending,
    sortRules,
    createdFrom,
    createdTo,
    amountMinValue,
    amountMaxValue,
    activeFilterCount,
    appliedRange,
  } = state;
  const {
    setSearch,
    setSearchInput,
    setStatusFilter,
    setPaymentMethod,
    setSortParam,
    setCurrentPage,
    setPageSize,
    setAmountRange,
    setDatePopoverOpen,
    setDraftRange,
    startTransition,
    openDatePopover,
    applyDateFilter,
    clearAllFilters,
  } = actions;
  const [pendingActionOrderId, setPendingActionOrderId] = useState<number | null>(null);
  const [reasonAction, setReasonAction] = useState<{
    order: AdminOrderListItem;
    status: Extract<NextOrderStatus, 'cancelled' | 'refunded'>;
  } | null>(null);
  const [reasonText, setReasonText] = useState('');

  const facetsQuery = useQuery({
    queryKey: [
      'admin-order-facets',
      search,
      statusFilter,
      paymentMethod,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
    ],
    queryFn: () =>
      getAdminOrderFacets({
        search: search || undefined,
        status: statusFilter !== ALL ? (statusFilter as AdminOrderStatus) : undefined,
        paymentMethod: paymentMethod !== ALL ? (paymentMethod as AdminPaymentMethod) : undefined,
        createdFrom,
        createdTo,
        amountMin: amountMinValue,
        amountMax: amountMaxValue,
      }),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const ordersQuery = useQuery({
    queryKey: [
      'admin-orders',
      search,
      statusFilter,
      paymentMethod,
      dateFrom,
      dateTo,
      amountMin,
      amountMax,
      sortParam,
      currentPage,
      pageSize,
    ],
    queryFn: () =>
      getAdminOrders({
        search: search || undefined,
        status: statusFilter !== ALL ? (statusFilter as AdminOrderStatus) : undefined,
        paymentMethod: paymentMethod !== ALL ? (paymentMethod as AdminPaymentMethod) : undefined,
        createdFrom,
        createdTo,
        amountMin: amountMinValue,
        amountMax: amountMaxValue,
        page: currentPage,
        size: pageSize,
        sort: sortRules.map((r) => ({ field: r.field, dir: r.direction })),
      }),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const refreshOrderQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-order-facets'] }),
    ]);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
      reason,
      note,
    }: {
      orderId: number;
      status: NextOrderStatus;
      reason?: string;
      note?: string;
    }) => updateAdminOrderStatus(orderId, status, { reason, note }),
    onMutate: ({ orderId }) => setPendingActionOrderId(orderId),
    onSuccess: async () => {
      toast.success('Đã cập nhật trạng thái đơn');
      await refreshOrderQueries();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái');
    },
    onSettled: () => setPendingActionOrderId(null),
  });

  const createShipmentMutation = useMutation({
    mutationFn: ({ orderId }: { orderId: number }) => createAdminOrderShipment(orderId, 'ghtk'),
    onMutate: ({ orderId }) => setPendingActionOrderId(orderId),
    onSuccess: async () => {
      toast.success('Đã tạo vận đơn');
      await refreshOrderQueries();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo vận đơn');
    },
    onSettled: () => setPendingActionOrderId(null),
  });

  const statusOptions = facetsQuery.data?.statuses ?? EMPTY_FILTER_OPTIONS;
  const paymentOptions = facetsQuery.data?.paymentMethods ?? EMPTY_FILTER_OPTIONS;
  const allStatusCount = facetsQuery.data?.total ?? 0;
  const orders = ordersQuery.data?.data ?? EMPTY_ORDERS;
  const meta = ordersQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const totalElements = meta?.totalElements ?? 0;
  const shownFrom = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const shownTo = Math.min((currentPage + 1) * pageSize, totalElements);
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.finalAmount), 0);
  const isInitialOrdersLoading = ordersQuery.isLoading;
  const currentSortValue = sortParam;
  const pagination = useSimplePagination({ currentPage, totalPages });
  const statusFilterOptions = useMemo(
    () => [{ value: ALL, label: 'Tất cả', count: allStatusCount }, ...statusOptions],
    [allStatusCount, statusOptions],
  );
  const paymentDropdownOptions = useMemo(
    () => [
      { value: ALL, label: 'Tất cả phương thức' },
      ...paymentOptions.map((option) => ({ value: option.value, label: option.label, count: option.count })),
    ],
    [paymentOptions],
  );
  const dateFilterLabel = appliedRange?.from
    ? appliedRange.to
      ? `${appliedRange.from.toLocaleDateString('vi-VN')} - ${appliedRange.to.toLocaleDateString('vi-VN')}`
      : appliedRange.from.toLocaleDateString('vi-VN')
    : 'Tất cả ngày';
  const clearSearchFilter = useCallback(() => {
    setSearchInput('');
    void setSearch('');
    void setCurrentPage(0);
  }, [setCurrentPage, setSearch, setSearchInput]);
  const changeStatusFilter = useCallback((value: string) => {
    void setStatusFilter(value);
    void setCurrentPage(0);
  }, [setCurrentPage, setStatusFilter]);
  const changePaymentMethod = useCallback((value: string) => {
    void setPaymentMethod(value);
    void setCurrentPage(0);
  }, [setCurrentPage, setPaymentMethod]);
  const resetDraftRange = useCallback(() => setDraftRange(undefined), [setDraftRange]);
  const changeAmountRange = useCallback((value: number[]) => {
    setAmountRange([
      value[0] ?? AMOUNT_MIN_MILLION,
      value[1] ?? AMOUNT_MAX_MILLION,
    ]);
  }, [setAmountRange]);

  function exportCurrentPage() {
    exportOrdersPage(orders, currentPage);
  }

  const handleStatusChange = useCallback((order: AdminOrderListItem, status: NextOrderStatus) => {
    if (status === 'cancelled' || status === 'refunded') {
      setReasonAction({ order, status });
      setReasonText('');
      return;
    }

    updateStatusMutation.mutate({ orderId: order.id, status });
  }, [updateStatusMutation]);

  function submitReasonAction() {
    if (!reasonAction || !reasonText.trim()) return;
    updateStatusMutation.mutate({
      orderId: reasonAction.order.id,
      status: reasonAction.status,
      reason: reasonText.trim(),
    });
    setReasonAction(null);
    setReasonText('');
  }

  const handleCreateShipment = useCallback((order: AdminOrderListItem) => {
    createShipmentMutation.mutate({ orderId: order.id });
  }, [createShipmentMutation]);

  return (
    <>
    <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-3 overflow-hidden">
      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-2.5 lg:flex-row lg:items-center lg:justify-between 2xl:pb-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-card 2xl:size-11">
            <ShoppingCartIcon />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight 2xl:text-2xl">Quản lý đơn hàng</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi thanh toán, xử lý kho và tiến trình giao hàng trong một màn hình.
            </p>
          </div>
        </div>
        <Button className="h-10 w-fit rounded-xl px-4">
          <PlusIcon data-icon="inline-start" />
          Tạo đơn hàng
        </Button>
      </section>

      <div className="flex min-h-0 flex-1 flex-col gap-3 lg:flex-row 2xl:gap-4 min-[1800px]:gap-5">
        <aside className="min-h-0 w-full shrink-0 overflow-y-auto p-1 pb-2 lg:w-56 xl:w-60 2xl:w-65 min-[1800px]:w-72">
          <OrdersFilterSidebar
            searchInput={searchInput}
            statusFilter={statusFilter}
            statusOptions={statusFilterOptions}
            isFacetLoading={facetsQuery.isLoading}
            paymentMethod={paymentMethod}
            paymentOptions={paymentDropdownOptions}
            datePopoverOpen={datePopoverOpen}
            dateFilterLabel={dateFilterLabel}
            draftRange={draftRange}
            amountRange={amountRange}
            onSearchInputChange={setSearchInput}
            onClearSearch={clearSearchFilter}
            onStatusChange={changeStatusFilter}
            onPaymentMethodChange={changePaymentMethod}
            onDatePopoverOpenChange={setDatePopoverOpen}
            onOpenDatePopover={openDatePopover}
            onDraftRangeChange={setDraftRange}
            onResetDraftRange={resetDraftRange}
            onApplyDateFilter={applyDateFilter}
            onAmountRangeChange={changeAmountRange}
            onClearAllFilters={clearAllFilters}
          />
        </aside>

        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <section className="shrink-0 border-b border-dashed border-border/70 bg-background pb-2.5 pt-1 2xl:pb-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between 2xl:gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {isInitialOrdersLoading ? (
                    <>
                      <Skeleton className="h-6 w-16 rounded-md" />
                      <Skeleton className="h-6 w-28 rounded-md" />
                      <Skeleton className="h-6 w-20 rounded-md" />
                    </>
                  ) : (
                    <>
                      <StatusChip>{totalElements} đơn</StatusChip>
                      <StatusChip>{formatVnd(totalAmount)} trang này</StatusChip>
                      {activeFilterCount > 0 ? <StatusChip tone="warning">{activeFilterCount} bộ lọc</StatusChip> : null}
                    </>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Danh sách đang lọc theo trạng thái xử lý, thời gian đặt và phương thức thanh toán.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <MultipleSortPopover
                  value={currentSortValue}
                  fields={sortFields}
                  labels={SORT_LABELS}
                  onChange={(newVal) => {
                    startTransition(() => {
                      void setSortParam(newVal);
                      void setCurrentPage(0);
                    });
                  }}
                />
                <ExportCurrentPageButton disabled={!orders.length} onExport={exportCurrentPage} />
              </div>
            </div>
          </section>

          <div
            className={cn(
              'mt-2.5 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-0 transition-opacity duration-150 2xl:mt-3 2xl:gap-3',
              (ordersQuery.isFetching && !ordersQuery.isLoading) || isPending ? 'opacity-60' : 'opacity-100',
            )}
          >
            {ordersQuery.isError ? (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border bg-card py-16 text-muted-foreground">
                <AlertCircleIcon className="mb-3 size-10 text-destructive/40" />
                <p className="text-sm font-medium text-foreground">Không thể tải dữ liệu</p>
                <p className="mt-1 text-xs">Kiểm tra kết nối và thử lại</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => ordersQuery.refetch()}>
                  Thử lại
                </Button>
              </div>
            ) : ordersQuery.isLoading ? (
              <OrderCardSkeleton count={pageSize} />
            ) : orders.length ? (
              orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isPending={pendingActionOrderId === order.id}
                  onCreateShipment={handleCreateShipment}
                  onStatusChange={handleStatusChange}
                />
              ))
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center rounded-xl border bg-card py-16 text-muted-foreground">
                <PackageIcon className="mb-3 size-10 text-muted-foreground/50" />
                <p className="text-sm font-medium text-foreground">Không tìm thấy đơn hàng nào</p>
                <p className="mt-1 text-xs">Thử đổi từ khóa hoặc đặt lại bộ lọc.</p>
              </div>
            )}
          </div>

          <div className="mt-2.5 shrink-0 border-t border-dashed border-border/70 pt-2.5 2xl:mt-3 2xl:pt-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {isInitialOrdersLoading ? (
                  <Skeleton className="h-5 w-40" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {totalElements > 0 ? `Hiển thị ${shownFrom}-${shownTo} trong ${totalElements} đơn hàng` : '0 kết quả'}
                  </p>
                )}
                <PageSizeDropdown
                  value={pageSize}
                  options={PAGE_SIZES}
                  onChange={(value) => {
                    void setPageSize(value);
                    void setCurrentPage(0);
                  }}
                />
              </div>
              {totalPages > 1 ? (
                <Pagination className="mx-0! ml-auto w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50"
                        disabled={!pagination.canGoPrevious}
                        onClick={() =>
                          startTransition(() => {
                            void setCurrentPage(pagination.previousPage);
                          })
                        }
                      >
                        <ChevronLeftIcon className="size-4" />
                        Trước
                      </button>
                    </PaginationItem>
                    <PaginationItem>
                      <span
                        aria-current="page"
                        className="inline-flex h-8 min-w-24 items-center justify-center rounded-lg border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground"
                      >
                        Trang {pagination.currentPageLabel} / {pagination.totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <button
                        type="button"
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground disabled:pointer-events-none disabled:opacity-50"
                        disabled={!pagination.canGoNext}
                        onClick={() =>
                          startTransition(() => {
                            void setCurrentPage(pagination.nextPage);
                          })
                        }
                      >
                        Sau
                        <ChevronRightIcon className="size-4" />
                      </button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
    <Dialog open={reasonAction !== null} onOpenChange={(open) => {
      if (!open) {
        setReasonAction(null);
        setReasonText('');
      }
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {reasonAction?.status === 'cancelled' ? 'Hủy đơn hàng' : 'Hoàn tiền đơn hàng'}
          </DialogTitle>
          <DialogDescription>
            Nhập lý do để lưu vào lịch sử thao tác và hỗ trợ tra soát sau này.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="order-action-reason">Lý do</Label>
          <Textarea
            id="order-action-reason"
            value={reasonText}
            onChange={(event) => setReasonText(event.target.value)}
            placeholder={reasonAction?.status === 'cancelled' ? 'Ví dụ: Khách yêu cầu hủy đơn' : 'Ví dụ: Khách trả hàng và cần hoàn tiền'}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setReasonAction(null);
              setReasonText('');
            }}
          >
            Đóng
          </Button>
          <Button
            variant={reasonAction?.status === 'cancelled' ? 'destructive' : 'default'}
            disabled={!reasonText.trim() || updateStatusMutation.isPending}
            onClick={submitReasonAction}
          >
            {reasonAction?.status === 'cancelled' ? 'Hủy đơn' : 'Xác nhận hoàn tiền'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
