'use client';

import { ClipboardIcon, MailIcon, PhoneIcon, TruckIcon, UserRoundIcon } from 'lucide-react';

import { MoneyRow } from '@/components/dashboard/money-row';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminOrder, OrderShipmentData } from '@/lib/api/admin/orders';
import { cn } from '@/lib/utils';
import { formatViDate, formatViDateTime, formatVnd } from '@/lib/utils/formatting';
import {
  paymentDescriptions,
  paymentStatusLabels,
  shipmentProviderLabels,
  shipmentStatusLabels,
  toneClass,
} from '../order-display';

export function OrderPaymentPanel({ order }: { order: AdminOrder }) {
  const paymentDescription = paymentDescriptions[order.paymentMethod] ?? 'Phương thức thanh toán';

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Thanh toán</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{paymentDescription}</p>
          </div>
          {order.payment && (() => {
            const ps = paymentStatusLabels[order.payment.status] ?? { label: order.payment.status, tone: 'default' };
            return (
              <Badge className={cn('h-6 shrink-0 rounded-md px-2 text-xs font-semibold shadow-sm', toneClass(ps.tone))}>
                {ps.label}
              </Badge>
            );
          })()}
          {!order.payment && order.paymentMethod === 'cod' && (
            <Badge className={cn('h-6 shrink-0 rounded-md px-2 text-xs font-semibold shadow-sm', toneClass('default'))}>
              COD
            </Badge>
          )}
        </div>
        <Separator />
        <div className="grid gap-2.5">
          {order.payment?.paidAt ? (
            <MoneyRow label="Thanh toán lúc" value={formatViDateTime(order.payment.paidAt)} />
          ) : (
            <p className="text-sm text-muted-foreground">Chưa ghi nhận thời điểm thanh toán.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export function OrderCustomerPanel({ order }: { order: AdminOrder }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="grid gap-4">
        <h2 className="text-base font-semibold">Khách hàng</h2>
        {order.user ? (
          <div className="flex items-start gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarImage src={order.user.avatar ?? undefined} alt={order.user.name} />
              <AvatarFallback className="text-sm font-semibold">
                {order.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 gap-1.5 text-sm">
              <p className="truncate font-medium">{order.user.name}</p>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <MailIcon className="size-3.5 shrink-0" />
                <span className="truncate text-xs">{order.user.email}</span>
              </div>
              {order.user.phone && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <PhoneIcon className="size-3.5 shrink-0" />
                  <span className="text-xs">{order.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <UserRoundIcon className="size-4 text-muted-foreground" />
              <span className="font-medium">{order.shippingAddress.receiver}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PhoneIcon className="size-4" />
              <span>{order.shippingAddress.phone}</span>
            </div>
            <p className="text-xs text-muted-foreground">Khách hàng #{order.userId}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function OrderShippingAddressPanel({ order }: { order: AdminOrder }) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="grid gap-4">
        <h2 className="text-base font-semibold">Địa chỉ giao hàng</h2>
        <div className="grid gap-1 text-sm leading-6 text-muted-foreground">
          <span className="font-medium text-foreground">{order.shippingAddress.receiver}</span>
          <span>{order.shippingAddress.phone}</span>
          <span>{order.shippingAddress.street}</span>
          <span>{order.shippingAddress.ward}, {order.shippingAddress.district}</span>
          <span>{order.shippingAddress.province}</span>
        </div>
      </div>
    </section>
  );
}

export function OrderShipmentPanel({
  shipmentData,
  isLoading,
  isCreating,
  onCreateShipment,
  onCopyTracking,
}: {
  shipmentData: OrderShipmentData | null;
  isLoading: boolean;
  isCreating: boolean;
  onCreateShipment: () => void;
  onCopyTracking: (text: string) => void;
}) {
  const shipment = shipmentData?.shipment ?? null;
  const shipmentProvider = shipment
    ? (shipmentProviderLabels[shipment.provider.toLowerCase()] ?? shipment.provider.toUpperCase())
    : null;
  const carrierShippingFee = shipment ? Number(shipment.fee) : null;
  const shipStatusInfo = shipment ? (shipmentStatusLabels[shipment.status] ?? { label: shipment.status, tone: 'default' }) : null;

  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="grid gap-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Vận chuyển</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isLoading ? 'Đang tải...' : shipmentProvider ?? 'Chưa tạo vận đơn'}
            </p>
          </div>
          {shipStatusInfo && (
            <Badge className={cn('h-6 shrink-0 rounded-md px-2 text-xs font-semibold shadow-sm', toneClass(shipStatusInfo.tone))}>
              {shipStatusInfo.label}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : shipment ? (
          <div className="grid gap-2.5 text-sm">
            {shipment.trackingCode && (
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-muted-foreground">Tracking</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 rounded-lg px-2 font-mono text-xs"
                  onClick={() => onCopyTracking(shipment.trackingCode!)}
                >
                  {shipment.trackingCode}
                  <ClipboardIcon data-icon="inline-end" />
                </Button>
              </div>
            )}
            {carrierShippingFee !== null && carrierShippingFee > 0 && (
              <MoneyRow label="Phí hãng báo" value={formatVnd(carrierShippingFee)} />
            )}
            {shipment.estimatedAt && (
              <MoneyRow label="Dự kiến giao" value={formatViDate(shipment.estimatedAt)} />
            )}
            {shipment.shippedAt && (
              <MoneyRow label="Ngày giao vận" value={formatViDate(shipment.shippedAt)} />
            )}
            {shipment.deliveredAt && (
              <MoneyRow label="Đã giao lúc" value={formatViDateTime(shipment.deliveredAt)} />
            )}
          </div>
        ) : (
          <Button
            className="h-9 w-full rounded-lg"
            disabled={isCreating}
            onClick={onCreateShipment}
          >
            <TruckIcon data-icon="inline-start" />
            Tạo vận đơn
          </Button>
        )}
      </div>
    </section>
  );
}
