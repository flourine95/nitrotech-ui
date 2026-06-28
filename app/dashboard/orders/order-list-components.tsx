'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChevronDownIcon, DownloadIcon, MoreHorizontalIcon, type LucideIcon } from 'lucide-react';

import { StatusChip } from '@/components/dashboard/status-chip';
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
import { Skeleton } from '@/components/ui/skeleton';
import type {
  AdminOrderAction,
  AdminOrderListItem,
  AdminOrderStatus,
} from '@/lib/api/admin/orders';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatViDate, formatVnd } from '@/lib/utils/formatting';
import {
  orderStatusConfig,
  paymentLabels,
  progressSteps,
  shipmentStatusLabels,
  type OrderTone,
} from './order-display';
import { slaStatusLabels } from './order-list-helpers';

export type NextOrderStatus = Exclude<AdminOrderStatus, 'pending' | 'expired'>;

export function FilterDropdown({
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

export function ExportCurrentPageButton({
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
      Xuất CSV trang này
    </Button>
  );
}

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
            <DropdownMenuItem onClick={() => onStatusChange(order, 'confirmed')}>
              Xác nhận đơn
            </DropdownMenuItem>
          ) : null}
          {actions.has('create_shipment') ? (
            <DropdownMenuItem onClick={() => onCreateShipment(order)}>Tạo vận đơn</DropdownMenuItem>
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
            <DropdownMenuItem onClick={() => onStatusChange(order, 'refunded')}>
              Hoàn tiền
            </DropdownMenuItem>
          ) : null}
          {actions.has('cancel') ? (
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onStatusChange(order, 'cancelled')}
            >
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
                  active
                    ? 'border-foreground text-foreground'
                    : 'border-border text-muted-foreground',
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
        {progressSteps.map((step, index) => (
          <div key={step.label} className="contents">
            <span>{step.label}</span>
            {index < progressSteps.length - 1 ? <span aria-hidden /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export const OrderCard = memo(function OrderCard({
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
  const status =
    getShipmentAwareListStatus(order.status, order.shipmentStatus) ??
    orderStatusConfig[order.status];
  const slaStatus =
    order.slaStatus === 'warning' || order.slaStatus === 'critical'
      ? slaStatusLabels[order.slaStatus]
      : null;
  const receiver = order.receiver ?? 'Chưa có người nhận';
  const phone = order.phone ?? 'Chưa có SĐT';
  const metaItems = [phone, order.email, `Cập nhật ${formatRelativeTime(order.updatedAt)}`].filter(
    (item): item is string => Boolean(item),
  );

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
            {slaStatus ? (
              <StatusChip tone={slaStatus.tone}>
                {order.slaLabel ? `${slaStatus.label}: ${order.slaLabel}` : slaStatus.label}
              </StatusChip>
            ) : null}
          </div>
          <h2 className="mt-1.5 text-base leading-snug font-semibold 2xl:text-lg">
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

        <div className="flex items-start justify-end gap-3 xl:min-w-40 2xl:min-w-44">
          <div className="text-right">
            <p className="text-lg font-semibold 2xl:text-xl">
              {formatVnd(Number(order.finalAmount))}
            </p>
            <p className="text-sm text-muted-foreground">{formatViDate(order.createdAt)}</p>
            {order.trackingCode ? (
              <p className="mt-1 max-w-36 truncate text-xs font-medium text-muted-foreground">
                {order.trackingCode}
              </p>
            ) : null}
            <MoreActions
              order={order}
              isPending={isPending}
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
            <Button
              variant="outline"
              className="h-9 w-fit shrink-0 justify-self-start 2xl:h-10"
              asChild
            >
              <Link href={`/dashboard/orders/${order.id}`}>{status.action}</Link>
            </Button>
          </div>
          <OrderProgress progress={status.progress} />
        </div>
      </div>
    </article>
  );
});

export function OrderCardSkeleton({ count }: { count: number }) {
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
        <div className="flex items-start justify-end gap-3 xl:min-w-40">
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border p-3 2xl:mt-4 2xl:p-4">
        <div className="grid gap-3 2xl:gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="mt-2 h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-9 w-28 shrink-0 rounded-lg 2xl:h-10" />
          </div>
          <div className="grid gap-2.5">
            <div className="grid grid-cols-[auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto] items-center gap-x-2">
              {Array.from({ length: 4 }).map((_, stepIndex) => (
                <div key={stepIndex} className="contents">
                  <Skeleton className="size-5 rounded-md" />
                  {stepIndex < 3 ? <Skeleton className="h-1 rounded-full" /> : null}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-[auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto_minmax(28px,1fr)_auto] gap-x-2">
              {Array.from({ length: 4 }).map((_, stepIndex) => (
                <div key={stepIndex} className="contents">
                  <Skeleton className="h-3 w-12" />
                  {stepIndex < 3 ? <span aria-hidden /> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  ));
}

function getShipmentAwareListStatus(orderStatus: AdminOrderStatus, shipmentStatus: string | null) {
  if (!shipmentStatus || orderStatus === 'delivered' || orderStatus === 'cancelled') return null;

  const base = shipmentStatusLabels[shipmentStatus];
  const label = base?.label ?? shipmentStatus;
  const tone = base?.tone ?? ('warning' satisfies OrderTone);

  if (shipmentStatus === 'delivery_failed') {
    return {
      label,
      tone,
      progress: 3,
      stateTitle: 'Giao hàng thất bại',
      stateText: 'Đơn vị vận chuyển báo giao thất bại. Cần xử lý giao lại hoặc hoàn hàng.',
      action: 'Xem vận chuyển',
      terminal: true,
    };
  }

  if (
    shipmentStatus === 'waiting_to_return' ||
    shipmentStatus === 'returning' ||
    shipmentStatus === 'return_transporting' ||
    shipmentStatus === 'return_sorting'
  ) {
    return {
      label,
      tone,
      progress: 3,
      stateTitle: label,
      stateText: 'Vận đơn đang trong nhánh hoàn hàng, không còn là giao hàng thành công.',
      action: 'Xem vận chuyển',
      terminal: true,
    };
  }

  if (shipmentStatus === 'returned') {
    return {
      label,
      tone,
      progress: 0,
      stateTitle: 'Đã hoàn hàng',
      stateText: 'Vận đơn đã hoàn về. Đơn cần xử lý theo quy trình hoàn hàng/đối soát.',
      action: 'Xem vận chuyển',
      terminal: true,
    };
  }

  if (shipmentStatus === 'pickup_failed') {
    return {
      label,
      tone,
      progress: 2,
      stateTitle: 'Lấy hàng thất bại',
      stateText: 'Đơn vị vận chuyển chưa lấy được hàng. Cần kiểm tra bàn giao kho.',
      action: 'Xem vận chuyển',
      terminal: true,
    };
  }

  if (shipmentStatus === 'cancel') {
    return {
      label,
      tone,
      progress: 0,
      stateTitle: 'Vận đơn đã hủy',
      stateText: 'Vận đơn không còn hiệu lực. Cần tạo vận đơn mới nếu tiếp tục giao.',
      action: 'Xem vận chuyển',
      terminal: true,
    };
  }

  return null;
}
