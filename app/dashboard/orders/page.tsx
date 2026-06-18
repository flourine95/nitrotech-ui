'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import type { DateRange } from 'react-day-picker';
import { useDebounce } from 'use-debounce';
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PackageIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShoppingCartIcon,
  TruckIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { usePagination } from '@/hooks/use-pagination';
import {
  getAdminOrderFacets,
  getAdminOrders,
  type AdminOrderListItem,
  type AdminOrderStatus,
  type AdminPaymentMethod,
} from '@/lib/api/admin/orders';
import { cn } from '@/lib/utils';
import { DateRangePicker, formatDateKey, parseLocalDate } from './date-range-picker';

const PAGE_SIZES = [5, 10, 20, 50];
const AMOUNT_MIN_MILLION = 0;
const AMOUNT_MAX_MILLION = 100;
const AMOUNT_MIN_VALUE = AMOUNT_MIN_MILLION * 1_000_000;
const AMOUNT_MAX_VALUE = AMOUNT_MAX_MILLION * 1_000_000;
const ALL = 'all';

const statusConfig: Record<
  AdminOrderStatus,
  {
    label: string;
    tone: 'default' | 'danger' | 'success' | 'warning';
    progress: number;
    stateTitle: string;
    stateText: string;
    action: string;
  }
> = {
  pending: {
    label: 'Chờ xác nhận',
    tone: 'warning',
    progress: 1,
    stateTitle: 'Báo giá mới',
    stateText: 'Đơn đang chờ xác nhận trước khi chuyển sang xử lý kho.',
    action: 'Xem chi tiết',
  },
  confirmed: {
    label: 'Đã xác nhận',
    tone: 'success',
    progress: 1,
    stateTitle: 'Đã xác nhận',
    stateText: 'Đơn đã được xác nhận và sẵn sàng chuyển sang đóng gói.',
    action: 'Tạo vận đơn',
  },
  processing: {
    label: 'Đang xử lý',
    tone: 'default',
    progress: 2,
    stateTitle: 'Đang đóng gói',
    stateText: 'Kho đang lấy hàng, kiểm tra và chuẩn bị bàn giao vận chuyển.',
    action: 'Xem đóng gói',
  },
  shipped: {
    label: 'Đang giao',
    tone: 'default',
    progress: 3,
    stateTitle: 'Đơn đang giao',
    stateText: 'Đơn đã rời kho và đang theo dõi tiến trình vận chuyển.',
    action: 'Theo dõi giao hàng',
  },
  delivered: {
    label: 'Hoàn thành',
    tone: 'success',
    progress: 4,
    stateTitle: 'Đã giao thành công',
    stateText: 'Đơn đã hoàn tất và sẵn sàng đối soát chứng từ.',
    action: 'Mở chứng từ',
  },
  cancelled: {
    label: 'Đã hủy',
    tone: 'danger',
    progress: 1,
    stateTitle: 'Đơn đã hủy',
    stateText: 'Đơn không còn trong luồng xử lý vận hành.',
    action: 'Xem lý do',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    tone: 'warning',
    progress: 4,
    stateTitle: 'Đã hoàn tiền',
    stateText: 'Thanh toán đã được hoàn trả và đơn đã đóng.',
    action: 'Mở chứng từ',
  },
  expired: {
    label: 'Đã hết hạn',
    tone: 'danger',
    progress: 1,
    stateTitle: 'Đơn hết hạn',
    stateText: 'Đơn chưa được xác nhận trong thời hạn xử lý.',
    action: 'Xem chi tiết',
  },
};

const paymentLabels: Record<AdminPaymentMethod, string> = {
  cod: 'COD',
  vnpay: 'VNPay',
  momo: 'MoMo',
  sepay: 'SePay',
};

const sortOptions = [
  { label: 'Gần đây nhất', field: 'createdAt', dir: 'desc' as const },
  { label: 'Cũ nhất', field: 'createdAt', dir: 'asc' as const },
  { label: 'Giá trị cao nhất', field: 'finalAmount', dir: 'desc' as const },
  { label: 'Giá trị thấp nhất', field: 'finalAmount', dir: 'asc' as const },
  { label: 'Mã đơn mới nhất', field: 'id', dir: 'desc' as const },
];

const progressSteps = [
  { label: 'Báo giá', icon: FileTextIcon },
  { label: 'Đóng gói', icon: PackageCheckIcon },
  { label: 'Giao hàng', icon: TruckIcon },
  { label: 'Hoàn tất', icon: CheckCircle2Icon },
];

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const viDate = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function localDateStartIso(value: string) {
  return parseLocalDate(value).toISOString();
}

function localDateEndExclusiveIso(value: string) {
  const date = parseLocalDate(value);
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

function orderCode(id: number) {
  return `SO-${id.toString().padStart(3, '0')}`;
}

function toMillion(value: number) {
  return Math.round(value / 1_000_000);
}

function chipClass(tone?: string) {
  if (tone === 'success') return 'border-transparent bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12';
  if (tone === 'warning') return 'border-transparent bg-amber-500/12 text-amber-700 hover:bg-amber-500/12';
  if (tone === 'danger') return 'border-transparent bg-rose-500/12 text-rose-700 hover:bg-rose-500/12';
  return 'border-transparent bg-sky-500/12 text-sky-700 hover:bg-sky-500/12';
}

function StatusChip({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <Badge className={cn('h-6 rounded-md px-2 font-semibold shadow-sm', chipClass(tone))}>
      {children}
    </Badge>
  );
}

function FilterDropdown({
  label,
  icon: Icon,
  value,
  options,
  onChange,
}: {
  label: string;
  icon: LucideIcon;
  value: string;
  options: Array<{ value: string; label: string; count?: number }>;
  onChange: (value: string) => void;
}) {
  const selected = options.find((option) => option.value === value)?.label ?? label;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{label}</p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-10 w-full justify-between font-normal shadow-none">
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="shrink-0 text-muted-foreground" />
              <span className="truncate">{selected}</span>
            </span>
            <ChevronDownIcon data-icon="inline-end" className="shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="w-(--radix-dropdown-menu-trigger-width)"
        >
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <span className="flex w-full items-center justify-between gap-3">
                  <span>{option.label}</span>
                  {option.count !== undefined ? (
                    <span className="text-xs text-muted-foreground">{option.count}</span>
                  ) : null}
                </span>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (option: (typeof sortOptions)[number]) => void;
}) {
  const selected = sortOptions.find((option) => `${option.field},${option.dir}` === value) ?? sortOptions[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full min-w-0 justify-between rounded-xl px-3 font-normal shadow-none sm:w-48 xl:w-56 2xl:w-64 2xl:px-4"
        >
          <span className="truncate">{selected.label}</span>
          <ChevronDownIcon data-icon="inline-end" className="shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-(--radix-dropdown-menu-trigger-width)"
      >
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue) => {
            const option = sortOptions.find((item) => `${item.field},${item.dir}` === nextValue);
            if (option) onChange(option);
          }}
        >
          {sortOptions.map((option) => (
            <DropdownMenuRadioItem key={`${option.field},${option.dir}`} value={`${option.field},${option.dir}`}>
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PageSizeDropdown({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 min-w-24 justify-between rounded-lg px-2.5 font-normal shadow-none"
        >
          <span>{value} / trang</span>
          <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" sideOffset={6} className="w-32">
        <DropdownMenuRadioGroup value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
          {PAGE_SIZES.map((size) => (
            <DropdownMenuRadioItem key={size} value={String(size)}>
              {size} / trang
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ToolbarActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full rounded-xl p-0 shadow-none sm:size-10 sm:shrink-0"
          aria-label="Mở tùy chọn danh sách"
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-48">
        <DropdownMenuGroup>
          <DropdownMenuItem>Xuất danh sách</DropdownMenuItem>
          <DropdownMenuItem>Tùy chỉnh hiển thị</DropdownMenuItem>
          <DropdownMenuItem>Làm mới bộ lọc</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MoreActions({ orderId }: { orderId: number }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-2"
          aria-label={`Mở thao tác cho đơn ${orderCode(orderId)}`}
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/orders/${orderId}`}>Xem chi tiết</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Cập nhật trạng thái</DropdownMenuItem>
          <DropdownMenuItem>In đơn hàng</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OrderProgress({ progress }: { progress: number }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {progressSteps.map((step, index) => {
        const active = index < progress;
        const CurrentIcon = step.icon;
        return (
          <div key={step.label} className="flex min-w-0 flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full',
                  active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
                )}
              >
                <CurrentIcon className="size-3" />
              </span>
              {index < progressSteps.length - 1 ? (
                <span
                  className={cn(
                    'h-1 min-w-0 flex-1 rounded-full',
                    index < progress - 1 ? 'bg-foreground' : 'bg-muted',
                  )}
                />
              ) : null}
            </div>
            <span className="truncate text-center text-[11px] leading-none text-muted-foreground">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: AdminOrderListItem }) {
  const status = statusConfig[order.status];
  const receiver = order.receiver ?? 'Chưa có người nhận';
  const phone = order.phone ?? 'Chưa có SĐT';

  return (
    <article className="rounded-xl border bg-card p-3 2xl:p-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto] 2xl:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{orderCode(order.id)}</span>
            <StatusChip tone={status.tone}>{status.label}</StatusChip>
            <StatusChip>{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</StatusChip>
          </div>
          <h2 className="mt-1.5 text-base font-semibold leading-snug 2xl:text-lg">
            {receiver} · {order.itemCount} sản phẩm
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {[phone, `Khách #${order.userId}`, `Cập nhật ${viDate.format(new Date(order.updatedAt))}`].map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                {index > 0 ? <span className="size-1 rounded-full bg-border" /> : null}
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 xl:min-w-40 xl:justify-end 2xl:min-w-44">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-muted/40 text-muted-foreground">
            <PackageIcon className="size-5" />
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold 2xl:text-xl">{vnd.format(Number(order.finalAmount))}</p>
            <p className="text-sm text-muted-foreground">{viDate.format(new Date(order.createdAt))}</p>
            <MoreActions orderId={order.id} />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border p-3 2xl:mt-4 2xl:p-4">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-end 2xl:gap-4">
          <div className="min-w-0">
            <p className="font-medium">{status.stateTitle}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{status.stateText}</p>
            <div className="mt-3">
              <OrderProgress progress={status.progress} />
            </div>
          </div>
          <Button variant="outline" className="h-9 w-fit justify-self-start 2xl:h-10 xl:justify-self-end" asChild>
            <Link href={`/dashboard/orders/${order.id}`}>{status.action}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function OrderCardSkeleton({ count }: { count: number }) {
  return Array.from({ length: count }).map((_, index) => (
    <article key={index} className="rounded-xl border bg-card p-3 2xl:p-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-24 rounded-md" />
          </div>
          <Skeleton className="mt-3 h-5 w-64" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>
        <div className="flex items-start justify-between gap-3 xl:min-w-40">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-3 h-28 rounded-xl" />
    </article>
  ));
}

export default function DashboardOrdersPage() {
  const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
  const [dateFrom, setDateFrom] = useQueryState('createdFrom', parseAsString.withDefault(''));
  const [dateTo, setDateTo] = useQueryState('createdTo', parseAsString.withDefault(''));
  const [statusFilter, setStatusFilter] = useQueryState('status', parseAsString.withDefault(ALL));
  const [paymentMethod, setPaymentMethod] = useQueryState('paymentMethod', parseAsString.withDefault(ALL));
  const [sortParam, setSortParam] = useQueryState('sort', parseAsString.withDefault('createdAt,desc'));
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [pageSize, setPageSize] = useQueryState('size', parseAsInteger.withDefault(10));
  const [amountMin, setAmountMin] = useQueryState('amountMin', parseAsInteger.withDefault(AMOUNT_MIN_VALUE));
  const [amountMax, setAmountMax] = useQueryState('amountMax', parseAsInteger.withDefault(AMOUNT_MAX_VALUE));

  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined);
  const [searchInput, setSearchInput] = useState(search);
  const [amountRange, setAmountRange] = useState([toMillion(amountMin), toMillion(amountMax)]);
  const [isPending, startTransition] = useTransition();
  const [debouncedSearch] = useDebounce(searchInput, 350);
  const [debouncedAmountRange] = useDebounce(amountRange, 350);
  const [sortBy = 'createdAt', sortDir = 'desc'] = sortParam.split(',');

  const createdFrom = dateFrom ? localDateStartIso(dateFrom) : undefined;
  const createdTo = dateTo ? localDateEndExclusiveIso(dateTo) : undefined;
  const hasAmountFilter = amountMin > AMOUNT_MIN_VALUE || amountMax < AMOUNT_MAX_VALUE;
  const amountMinValue = hasAmountFilter ? amountMin : undefined;
  const amountMaxValue = hasAmountFilter ? amountMax : undefined;
  const activeFilterCount =
    (statusFilter !== ALL ? 1 : 0) +
    (paymentMethod !== ALL ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (hasAmountFilter ? 1 : 0);

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
        sort: [{ field: sortBy, dir: sortDir as 'asc' | 'desc' }],
      }),
    placeholderData: keepPreviousData,
    staleTime: 20_000,
  });

  const statusOptions = facetsQuery.data?.statuses ?? [];
  const paymentOptions = facetsQuery.data?.paymentMethods ?? [];
  const allStatusCount = facetsQuery.data?.total ?? 0;
  const orders = ordersQuery.data?.data ?? [];
  const meta = ordersQuery.data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const totalElements = meta?.totalElements ?? 0;
  const shownFrom = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const shownTo = Math.min((currentPage + 1) * pageSize, totalElements);
  const totalAmount = orders.reduce((sum, order) => sum + Number(order.finalAmount), 0);
  const currentSortValue = sortParam;
  const appliedRange: DateRange | undefined = dateFrom
    ? { from: parseLocalDate(dateFrom), to: dateTo ? parseLocalDate(dateTo) : undefined }
    : undefined;

  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: currentPage + 1,
    totalPages,
    paginationItemsToDisplay: 5,
  });

  function openDatePopover() {
    setDraftRange(
      dateFrom
        ? { from: parseLocalDate(dateFrom), to: dateTo ? parseLocalDate(dateTo) : undefined }
        : undefined,
    );
    setDatePopoverOpen(true);
  }

  function applyDateFilter() {
    void setDateFrom(draftRange?.from ? formatDateKey(draftRange.from) : '');
    void setDateTo(draftRange?.to ? formatDateKey(draftRange.to) : '');
    void setCurrentPage(0);
    setDatePopoverOpen(false);
  }

  function clearAllFilters() {
    startTransition(() => {
      void setSearch('');
      setSearchInput('');
      void setStatusFilter(ALL);
      void setPaymentMethod(ALL);
      void setDateFrom('');
      void setDateTo('');
      void setAmountMin(AMOUNT_MIN_VALUE);
      void setAmountMax(AMOUNT_MAX_VALUE);
      setAmountRange([AMOUNT_MIN_MILLION, AMOUNT_MAX_MILLION]);
      void setSortParam('createdAt,desc');
      void setCurrentPage(0);
    });
  }

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setAmountRange([toMillion(amountMin), toMillion(amountMax)]);
  }, [amountMin, amountMax]);

  useEffect(() => {
    if (debouncedSearch === search) return;
    void setSearch(debouncedSearch);
    void setCurrentPage(0);
  }, [debouncedSearch, search, setCurrentPage, setSearch]);

  useEffect(() => {
    const nextMin = (debouncedAmountRange[0] ?? AMOUNT_MIN_MILLION) * 1_000_000;
    const nextMax = (debouncedAmountRange[1] ?? AMOUNT_MAX_MILLION) * 1_000_000;
    if (nextMin === amountMin && nextMax === amountMax) return;
    void setAmountMin(nextMin);
    void setAmountMax(nextMax);
    void setCurrentPage(0);
  }, [amountMax, amountMin, debouncedAmountRange, setAmountMax, setAmountMin, setCurrentPage]);

  return (
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
        <aside className="min-h-0 w-full shrink-0 overflow-y-auto pr-1 pb-2 lg:w-56 xl:w-60 2xl:w-65 min-[1800px]:w-72">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm đơn bán hàng..."
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                }}
                className="h-10 pl-10 pr-9 2xl:h-11"
              />
              {search ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => {
                    void setSearch('');
                    setSearchInput('');
                    void setCurrentPage(0);
                  }}
                  className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                >
                  <XIcon />
                </Button>
              ) : null}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Trạng thái đơn</p>
              <div className="overflow-hidden rounded-xl border border-border/60 bg-background/70">
                {[{ value: ALL, label: 'Tất cả', count: allStatusCount }, ...statusOptions].map((item) => {
                  const active = statusFilter === item.value;
                  return (
                    <button
                      key={item.value}
                      className={cn(
                        'flex min-h-10 w-full items-center justify-between border-b border-border/60 px-3 py-2 text-left text-foreground/80 transition-colors last:border-b-0 hover:bg-muted/20 hover:text-foreground',
                        active && 'bg-foreground/4.5 text-foreground',
                      )}
                      onClick={() => {
                        void setStatusFilter(item.value);
                        void setCurrentPage(0);
                      }}
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
                        {facetsQuery.isLoading && item.value === ALL ? '...' : item.count}
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
              options={[
                { value: ALL, label: 'Tất cả phương thức' },
                ...paymentOptions.map((option) => ({ value: option.value, label: option.label, count: option.count })),
              ]}
              onChange={(value) => {
                void setPaymentMethod(value);
                void setCurrentPage(0);
              }}
            />

            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">Ngày đặt</p>
              <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-10 justify-between font-normal shadow-none"
                    onClick={openDatePopover}
                  >
                    <span className="truncate">
                      {appliedRange?.from
                        ? appliedRange.to
                          ? `${appliedRange.from.toLocaleDateString('vi-VN')} - ${appliedRange.to.toLocaleDateString('vi-VN')}`
                          : appliedRange.from.toLocaleDateString('vi-VN')
                        : 'Tất cả ngày'}
                    </span>
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
                    <DateRangePicker value={draftRange} onChange={setDraftRange} className="w-full" />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="h-9" onClick={() => setDraftRange(undefined)}>
                      Đặt lại
                    </Button>
                    <Button className="h-9" onClick={applyDateFilter}>
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
                  onValueChange={(value) => {
                    setAmountRange([
                      value[0] ?? AMOUNT_MIN_MILLION,
                      value[1] ?? AMOUNT_MAX_MILLION,
                    ]);
                  }}
                  aria-label="Khoảng giá trị đơn hàng"
                />
                <div className="mt-3 flex items-center justify-between text-[13px] font-medium">
                  <span>{amountRange[0]} triệu</span>
                  <span>{amountRange[1]} triệu</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" className="h-9 justify-start px-2" onClick={clearAllFilters}>
              <RotateCcwIcon data-icon="inline-start" />
              Đặt lại bộ lọc
            </Button>
          </div>
        </aside>

        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <section className="shrink-0 border-b border-dashed border-border/70 bg-background pb-2.5 pt-1 2xl:pb-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between 2xl:gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusChip>{totalElements} đơn</StatusChip>
                  <StatusChip>{vnd.format(totalAmount)} trang này</StatusChip>
                  {activeFilterCount > 0 ? <StatusChip tone="warning">{activeFilterCount} bộ lọc</StatusChip> : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Danh sách đang lọc theo trạng thái xử lý, thời gian đặt và phương thức thanh toán.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                <SortDropdown
                  value={currentSortValue}
                  onChange={(option) => {
                    startTransition(() => {
                      void setSortParam(`${option.field},${option.dir}`);
                      void setCurrentPage(0);
                    });
                  }}
                />
                <ToolbarActions />
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
              orders.map((order) => <OrderCard key={order.id} order={order} />)
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
                <p className="text-sm text-muted-foreground">
                  {totalElements > 0 ? `Hiển thị ${shownFrom}-${shownTo} trong ${totalElements} đơn hàng` : '0 kết quả'}
                </p>
                <PageSizeDropdown
                  value={pageSize}
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
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 0}
                        onClick={() =>
                          startTransition(() => {
                            void setCurrentPage(Math.max(0, currentPage - 1));
                          })
                        }
                      >
                        <ChevronLeftIcon />
                        Trước
                      </Button>
                    </PaginationItem>
                    {showLeftEllipsis ? (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : null}
                    {pages.map((page) => (
                      <PaginationItem key={page}>
                        <Button
                          size="sm"
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
                    {showRightEllipsis ? (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : null}
                    <PaginationItem>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() =>
                          startTransition(() => {
                            void setCurrentPage(Math.min(totalPages - 1, currentPage + 1));
                          })
                        }
                      >
                        Sau
                        <ChevronRightIcon />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
