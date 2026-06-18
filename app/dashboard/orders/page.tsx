'use client';

import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { useDebounce } from 'use-debounce';
import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowDownUpIcon,
  ArrowUpIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PackageIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShoppingCartIcon,
  Trash2Icon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  createAdminOrderShipment,
  getAdminOrderFacets,
  getAdminOrders,
  updateAdminOrderStatus,
  type AdminOrderAction,
  type AdminOrderListItem,
  type AdminOrderStatus,
  type AdminPaymentMethod,
} from '@/lib/api/admin/orders';
import { cn } from '@/lib/utils';
import { downloadCSV, escapeCsv } from '@/lib/utils/formatting';
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
    stateTitle: 'Đơn mới',
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

const paymentStatusLabels: Record<string, { label: string; tone: 'default' | 'danger' | 'success' | 'warning' }> = {
  pending: { label: 'Chưa thanh toán', tone: 'warning' },
  paid: { label: 'Đã thanh toán', tone: 'success' },
  failed: { label: 'Thanh toán lỗi', tone: 'danger' },
};

const shipmentStatusLabels: Record<string, { label: string; tone: 'default' | 'danger' | 'success' | 'warning' }> = {
  pending: { label: 'Chờ vận chuyển', tone: 'default' },
  ready_to_pick: { label: 'Chờ lấy hàng', tone: 'warning' },
  picking: { label: 'Đang lấy hàng', tone: 'warning' },
  picked: { label: 'Đã lấy hàng', tone: 'default' },
  delivering: { label: 'Đang giao', tone: 'default' },
  delivered: { label: 'Đã giao', tone: 'success' },
  delivery_fail: { label: 'Giao thất bại', tone: 'danger' },
  returned: { label: 'Đã hoàn hàng', tone: 'danger' },
  cancel: { label: 'Hủy vận chuyển', tone: 'danger' },
};

const sortFields = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'finalAmount', label: 'Tổng tiền' },
  { value: 'id', label: 'Mã đơn hàng' },
  { value: 'status', label: 'Trạng thái đơn' },
  { value: 'paymentMethod', label: 'Thanh toán' },
  { value: 'updatedAt', label: 'Cập nhật gần nhất' },
];

interface SortRule {
  field: string;
  direction: 'asc' | 'desc';
}

function parseSortParam(param: string): SortRule[] {
  if (!param) return [{ field: 'createdAt', direction: 'desc' }];
  return param.split(';').map((rule) => {
    const [field, dir] = rule.split(',');
    return {
      field: field || 'createdAt',
      direction: (dir === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    };
  });
}

function formatSortParam(rules: SortRule[]): string {
  if (rules.length === 0) return 'createdAt,desc';
  return rules.map((r) => `${r.field},${r.direction}`).join(';');
}

const progressSteps = [
  { label: 'Đặt hàng', icon: ShoppingCartIcon },
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

// Order code formatting is now handled backend-side in order.orderCode

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

function MultipleSortPopover({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const rules = parseSortParam(value);

  function handleRulesChange(newRules: SortRule[]) {
    onChange(formatSortParam(newRules));
  }

  function addRule() {
    const usedFields = new Set(rules.map((r) => r.field));
    const next = sortFields.find((o) => !usedFields.has(o.value));
    if (!next) return;
    handleRulesChange([...rules, { field: next.value, direction: 'desc' }]);
  }

  function updateField(index: number, field: string) {
    handleRulesChange(rules.map((r, i) => (i === index ? { ...r, field } : r)));
  }

  function updateDirection(index: number, direction: 'asc' | 'desc') {
    handleRulesChange(rules.map((r, i) => (i === index ? { ...r, direction } : r)));
  }

  function removeRule(index: number) {
    handleRulesChange(rules.filter((_, i) => i !== index));
  }

  function moveRule(from: number, to: number) {
    const next = [...rules];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    handleRulesChange(next);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full min-w-0 justify-between rounded-xl px-3 font-normal shadow-none sm:w-48 xl:w-56 2xl:w-64 2xl:px-4"
        >
          <span className="flex items-center gap-2 truncate">
            <ArrowDownUpIcon className="size-4 shrink-0 text-muted-foreground" />
            Sắp xếp ({rules.length})
          </span>
          <ChevronDownIcon data-icon="inline-end" className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="flex w-80 flex-col gap-3 rounded-xl p-3.5 2xl:w-96 2xl:p-4"
      >
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-semibold">Tiêu chí sắp xếp</span>
        </div>

        <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
          {rules.map((rule, i) => {
            const usedFields = new Set(rules.filter((_, j) => j !== i).map((r) => r.field));
            return (
              <div key={i} className="flex items-center gap-2">
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => i > 0 && moveRule(i, i - 1)}
                    disabled={i === 0}
                    className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                    aria-label="Lên"
                  >
                    <ArrowUpIcon className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => i < rules.length - 1 && moveRule(i, i + 1)}
                    disabled={i === rules.length - 1}
                    className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                    aria-label="Xuống"
                  >
                    <ArrowDownIcon className="size-3" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <Select value={rule.field} onValueChange={(v) => updateField(i, v)}>
                    <SelectTrigger className="w-full font-normal">
                      <SelectValue placeholder="Chọn cột" />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="z-200">
                      {sortFields.map((field) => (
                        <SelectItem
                          key={field.value}
                          value={field.value}
                          disabled={usedFields.has(field.value)}
                        >
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-28 shrink-0">
                  <Select
                    value={rule.direction}
                    onValueChange={(v) => updateDirection(i, v as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="w-full font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="z-200">
                      <SelectItem value="desc">Giảm dần</SelectItem>
                      <SelectItem value="asc">Tăng dần</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg hover:bg-accent hover:text-destructive"
                  onClick={() => removeRule(i)}
                  aria-label="Xóa tiêu chí"
                >
                  <Trash2Icon className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            className="h-8 gap-1.5 rounded-lg"
            onClick={addRule}
            disabled={rules.length >= sortFields.length}
          >
            <PlusIcon className="size-4" />
            Thêm tiêu chí
          </Button>
          {rules.length > 1 && (
            <Button
              variant="ghost"
              className="h-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={() => handleRulesChange([{ field: 'createdAt', direction: 'desc' }])}
            >
              Đặt lại
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
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

function ExportCurrentPageButton({
  disabled,
  onExport,
}: {
  disabled: boolean;
  onExport: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-10 w-full rounded-xl shadow-none sm:w-fit"
      disabled={disabled}
      onClick={onExport}
    >
      <DownloadIcon data-icon="inline-start" />
      Xuất CSV
    </Button>
  );
}

type NextOrderStatus = Exclude<AdminOrderStatus, 'pending' | 'expired'>;

function MoreActions({
  order,
  isPending,
  onCreateShipment,
  onStatusChange,
}: {
  order: AdminOrderListItem;
  isPending: boolean;
  onCreateShipment: (order: AdminOrderListItem) => void;
  onStatusChange: (order: AdminOrderListItem, status: NextOrderStatus) => void;
}) {
  const actions = new Set<AdminOrderAction>(order.availableActions);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="mt-2"
          disabled={isPending}
          aria-label={`Mở thao tác cho đơn ${order.orderCode}`}
        >
          <MoreHorizontalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/orders/${order.id}`}>Xem chi tiết</Link>
          </DropdownMenuItem>
          {actions.has('confirm') ? (
            <DropdownMenuItem onClick={() => onStatusChange(order, 'confirmed')}>Xác nhận đơn</DropdownMenuItem>
          ) : null}
          {actions.has('create_shipment') ? (
            <DropdownMenuItem onClick={() => onCreateShipment(order)}>Tạo vận đơn</DropdownMenuItem>
          ) : null}
          {actions.has('view_shipment') ? (
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${order.id}`}>Xem vận đơn</Link>
            </DropdownMenuItem>
          ) : null}
          {actions.has('track_shipment') ? (
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/orders/${order.id}`}>Theo dõi giao hàng</Link>
            </DropdownMenuItem>
          ) : null}
          {actions.has('mark_processing') ? (
            <DropdownMenuItem onClick={() => onStatusChange(order, 'processing')}>
              Chuyển sang xử lý
            </DropdownMenuItem>
          ) : null}
          {actions.has('mark_shipped') ? (
            <DropdownMenuItem onClick={() => onStatusChange(order, 'shipped')}>
              Đánh dấu đang giao
            </DropdownMenuItem>
          ) : null}
          {actions.has('mark_delivered') ? (
            <DropdownMenuItem onClick={() => onStatusChange(order, 'delivered')}>
              Đánh dấu đã giao
            </DropdownMenuItem>
          ) : null}
          {actions.has('refund') ? (
            <DropdownMenuItem onClick={() => onStatusChange(order, 'refunded')}>Hoàn tiền</DropdownMenuItem>
          ) : null}
          {actions.has('cancel') ? (
            <DropdownMenuItem variant="destructive" onClick={() => onStatusChange(order, 'cancelled')}>
              Hủy đơn
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function OrderProgress({ progress }: { progress: number }) {
  return (
    <div className="grid gap-2.5">
      <div className="grid grid-cols-[auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto] items-center gap-x-2">
        {progressSteps.map((step, index) => {
          const active = index < progress;
          const complete = index < progress - 1;
          const CurrentIcon = step.icon;
          return (
            <div key={step.label} className="contents">
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-md border bg-background',
                  active ? 'border-foreground text-foreground' : 'border-border text-muted-foreground',
                )}
              >
                <CurrentIcon className="size-3" />
              </span>
              {index < progressSteps.length - 1 ? (
                <span className="h-1 rounded-full bg-border/70">
                  <span className={cn('block h-full rounded-full', complete && 'bg-foreground')} />
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-[auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto] gap-x-2 text-[11px] leading-none text-muted-foreground">
      {progressSteps.map((step, index) => {
        return (
          <div key={step.label} className="contents">
            <span>{step.label}</span>
            {index < progressSteps.length - 1 ? <span aria-hidden /> : null}
          </div>
        );
      })}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  pendingActionOrderId,
  onCreateShipment,
  onStatusChange,
}: {
  order: AdminOrderListItem;
  pendingActionOrderId: number | null;
  onCreateShipment: (order: AdminOrderListItem) => void;
  onStatusChange: (order: AdminOrderListItem, status: NextOrderStatus) => void;
}) {
  const status = statusConfig[order.status];
  const paymentStatus = order.paymentStatus ? paymentStatusLabels[order.paymentStatus] : null;
  const shipmentStatus = order.shipmentStatus ? shipmentStatusLabels[order.shipmentStatus] : null;
  const receiver = order.receiver ?? 'Chưa có người nhận';
  const phone = order.phone ?? 'Chưa có SĐT';
  const metaItems = [
    phone,
    order.email,
    `Cập nhật ${viDate.format(new Date(order.updatedAt))}`,
  ].filter((item): item is string => Boolean(item));

  return (
    <article className="rounded-xl border bg-card p-3 2xl:p-4">
      <div className="grid gap-3 xl:grid-cols-[1fr_auto] 2xl:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/dashboard/orders/${order.id}`}
              className="font-semibold underline-offset-4 hover:underline"
            >
              {order.orderCode}
            </Link>
            <StatusChip tone={status.tone}>{status.label}</StatusChip>
            <StatusChip>{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</StatusChip>
            {paymentStatus ? <StatusChip tone={paymentStatus.tone}>{paymentStatus.label}</StatusChip> : null}
            {shipmentStatus ? <StatusChip tone={shipmentStatus.tone}>{shipmentStatus.label}</StatusChip> : null}
          </div>
          <h2 className="mt-1.5 text-base font-semibold leading-snug 2xl:text-lg">
            {receiver} · {order.itemCount} sản phẩm
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {metaItems.map((item, index) => (
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
            {order.trackingCode ? (
              <p className="mt-1 max-w-36 truncate text-xs font-medium text-muted-foreground">
                {order.trackingCode}
              </p>
            ) : null}
            <MoreActions
              order={order}
              isPending={pendingActionOrderId === order.id}
              onCreateShipment={onCreateShipment}
              onStatusChange={onStatusChange}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-xl border p-3 2xl:mt-4 2xl:p-4">
        <div className="grid gap-3 2xl:gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
            <p className="font-medium">{status.stateTitle}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{status.stateText}</p>
            </div>
            <Button variant="outline" className="h-9 w-fit shrink-0 justify-self-start 2xl:h-10" asChild>
            <Link href={`/dashboard/orders/${order.id}`}>{status.action}</Link>
          </Button>
          </div>
          <OrderProgress progress={status.progress} />
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
  const queryClient = useQueryClient();
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
  const [pendingActionOrderId, setPendingActionOrderId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();
  const [debouncedSearch] = useDebounce(searchInput, 350);
  const [debouncedAmountRange] = useDebounce(amountRange, 350);
  const sortRules = parseSortParam(sortParam);

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

  function exportCurrentPage() {
    if (!orders.length) return;

    const header = [
      'Mã đơn',
      'Người nhận',
      'Số điện thoại',
      'Email',
      'Trạng thái',
      'Thanh toán',
      'Trạng thái thanh toán',
      'Trạng thái vận chuyển',
      'Mã vận đơn',
      'Tổng tiền',
      'Số sản phẩm',
      'Ngày đặt',
      'Cập nhật',
    ];
    const rows = orders.map((order) => [
      order.orderCode,
      order.receiver ?? '',
      order.phone ?? '',
      order.email ?? '',
      statusConfig[order.status].label,
      paymentLabels[order.paymentMethod] ?? order.paymentMethod,
      order.paymentStatus ? (paymentStatusLabels[order.paymentStatus]?.label ?? order.paymentStatus) : '',
      order.shipmentStatus ? (shipmentStatusLabels[order.shipmentStatus]?.label ?? order.shipmentStatus) : '',
      order.trackingCode ?? '',
      order.finalAmount,
      order.itemCount,
      viDate.format(new Date(order.createdAt)),
      viDate.format(new Date(order.updatedAt)),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
      .join('\n');

    downloadCSV(csv, `orders-page-${currentPage + 1}.csv`);
  }

  function handleStatusChange(order: AdminOrderListItem, status: NextOrderStatus) {
    if (status === 'cancelled' || status === 'refunded') {
      const reason = window.prompt(
        status === 'cancelled' ? 'Lý do hủy đơn?' : 'Lý do hoàn tiền?',
      );
      if (!reason) return;
      updateStatusMutation.mutate({ orderId: order.id, status, reason });
      return;
    }

    updateStatusMutation.mutate({ orderId: order.id, status });
  }

  function handleCreateShipment(order: AdminOrderListItem) {
    createShipmentMutation.mutate({ orderId: order.id });
  }

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setAmountRange([toMillion(amountMin), toMillion(amountMax)]);
  }, [amountMin, amountMax]);

  useEffect(() => {
    if (searchInput === '') {
      if (search !== '') {
        void setSearch('');
        void setCurrentPage(0);
      }
      return;
    }
    if (debouncedSearch === search) return;
    void setSearch(debouncedSearch);
    void setCurrentPage(0);
  }, [debouncedSearch, search, searchInput, setCurrentPage, setSearch]);

  useEffect(() => {
    const nextMin = (debouncedAmountRange[0] ?? AMOUNT_MIN_MILLION) * 1_000_000;
    const nextMax = (debouncedAmountRange[1] ?? AMOUNT_MAX_MILLION) * 1_000_000;
    if (nextMin === amountMin && nextMax === amountMax) return;
    void setAmountMin(nextMin);
    void setAmountMax(nextMax);
    void setCurrentPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAmountRange]);

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
        <aside className="min-h-0 w-full shrink-0 overflow-y-auto p-1 pb-2 lg:w-56 xl:w-60 2xl:w-65 min-[1800px]:w-72">
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
              {searchInput ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => {
                    setSearchInput('');
                    void setSearch('');
                    void setCurrentPage(0);
                  }}
                  className="absolute inset-y-0 right-1 my-auto size-7"
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
                <MultipleSortPopover
                  value={currentSortValue}
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
                  pendingActionOrderId={pendingActionOrderId}
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
