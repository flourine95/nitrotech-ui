'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClipboardIcon,
  ClockIcon,
  Loader2Icon,
  PackageIcon,
  RefreshCwIcon,
  TruckIcon,
  XCircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiException } from '@/lib/api/client';
import {
  createAdminOrderShipment,
  getAdminOrder,
  getAdminOrderShipment,
  type AdminOrder,
  type AdminOrderStatus,
  type OrderShipmentData,
  type ShipmentData,
  type ShipmentLogData,
} from '@/lib/api/admin/orders';

const ORDER_STATUS: Record<AdminOrderStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Chờ xác nhận', variant: 'secondary' },
  confirmed: { label: 'Đã xác nhận', variant: 'outline' },
  processing: { label: 'Đang xử lý', variant: 'default' },
  shipped: { label: 'Đang giao', variant: 'default' },
  delivered: { label: 'Hoàn thành', variant: 'secondary' },
  cancelled: { label: 'Đã hủy', variant: 'destructive' },
  refunded: { label: 'Đã hoàn tiền', variant: 'outline' },
};

const SHIPMENT_STATUS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  ready_to_pick: { label: 'Chờ lấy hàng', variant: 'outline' },
  picked: { label: 'Đã lấy hàng', variant: 'default' },
  storing: { label: 'Đang lưu kho', variant: 'default' },
  transporting: { label: 'Đang trung chuyển', variant: 'default' },
  sorting: { label: 'Đang phân loại', variant: 'default' },
  delivering: { label: 'Đang giao', variant: 'default' },
  delivered: { label: 'Giao thành công', variant: 'secondary' },
  returning: { label: 'Đang hoàn', variant: 'outline' },
  returned: { label: 'Đã hoàn', variant: 'outline' },
  pickup_failed: { label: 'Lấy hàng thất bại', variant: 'destructive' },
  delivery_failed: { label: 'Giao thất bại', variant: 'destructive' },
  cancel: { label: 'Đã hủy', variant: 'destructive' },
};

const PROVIDERS = [
  { value: 'ghtk', label: 'GHTK' },
  { value: 'ghn', label: 'GHN' },
];

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

function errorMessage(error: unknown) {
  return error instanceof ApiException ? error.error.message : 'Có lỗi xảy ra';
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleString('vi-VN');
}

function orderCode(order: AdminOrder) {
  return `#ORD-${order.id.toString().padStart(4, '0')}`;
}

function shipmentStatusMeta(status: string) {
  return SHIPMENT_STATUS[status] ?? { label: status, variant: 'outline' as const };
}

function TimelineIcon({ status }: { status: string }) {
  if (status === 'delivered') {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <CheckCircleIcon className="size-4" />
      </div>
    );
  }
  if (status === 'cancel' || status.endsWith('_failed')) {
    return (
      <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <XCircleIcon className="size-4" />
      </div>
    );
  }
  return (
    <div className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <ClockIcon className="size-4" />
    </div>
  );
}

function OrderSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-72" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-96 rounded-md" />
        <Skeleton className="h-80 rounded-md" />
      </div>
    </div>
  );
}

function ShipmentPanel({
  order,
  shipmentData,
  creating,
  onCreate,
  onCopy,
}: {
  order: AdminOrder;
  shipmentData: OrderShipmentData | undefined;
  creating: boolean;
  onCreate: (provider: string) => void;
  onCopy: (text: string) => void;
}) {
  const [provider, setProvider] = useState('ghtk');
  const shipment = shipmentData?.shipment ?? null;
  const canCreate = order.status === 'confirmed' && !shipment;
  const disabledReason = shipment
    ? 'Đơn hàng đã có vận đơn.'
    : order.status !== 'confirmed'
      ? 'Chỉ có thể tạo vận đơn khi đơn hàng đã được xác nhận.'
      : null;

  return (
    <div className="rounded-md border bg-card">
      <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Vận chuyển</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Tạo vận đơn và theo dõi webhook từ đơn vị vận chuyển.</p>
        </div>
        {shipment ? <ShipmentStatusBadge status={shipment.status} /> : null}
      </div>

      {shipment ? (
        <div className="space-y-5 p-5">
          <ShipmentSnapshot shipment={shipment} onCopy={onCopy} />
          <ShipmentTimeline logs={shipmentData?.logs ?? []} />
        </div>
      ) : (
        <div className="space-y-3 p-5">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="h-9 sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button disabled={!canCreate || creating} onClick={() => onCreate(provider)}>
              {creating ? <Loader2Icon className="animate-spin" /> : <TruckIcon />}
              Tạo vận đơn
            </Button>
          </div>
          {disabledReason ? <p className="text-xs text-muted-foreground">{disabledReason}</p> : null}
        </div>
      )}
    </div>
  );
}

function ShipmentStatusBadge({ status }: { status: string }) {
  const meta = shipmentStatusMeta(status);
  return <Badge variant={meta.variant}>{meta.label}</Badge>;
}

function ShipmentSnapshot({ shipment, onCopy }: { shipment: ShipmentData; onCopy: (text: string) => void }) {
  return (
    <div className="grid gap-3 text-sm sm:grid-cols-2">
      <InfoRow label="Đơn vị" value={shipment.provider.toUpperCase()} />
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">Tracking</span>
        {shipment.trackingCode ? (
          <Button variant="ghost" size="sm" onClick={() => onCopy(shipment.trackingCode!)}>
            <span className="font-mono">{shipment.trackingCode}</span>
            <ClipboardIcon />
          </Button>
        ) : (
          <span>Chưa có</span>
        )}
      </div>
      <InfoRow label="Phí vận chuyển" value={vnd.format(Number(shipment.fee ?? 0))} />
      <InfoRow label="Dự kiến giao" value={formatDateTime(shipment.estimatedAt)} />
      <InfoRow label="Ngày lấy hàng" value={formatDateTime(shipment.shippedAt)} />
      <InfoRow label="Ngày giao" value={formatDateTime(shipment.deliveredAt)} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function ShipmentTimeline({ logs }: { logs: ShipmentLogData[] }) {
  if (!logs.length) {
    return <p className="text-sm text-muted-foreground">Chưa có lịch sử vận chuyển.</p>;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold">Timeline vận chuyển</h3>
      <div className="space-y-0">
        {logs.map((log, index) => {
          const meta = shipmentStatusMeta(log.status);
          return (
            <div key={log.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <TimelineIcon status={log.status} />
                {index < logs.length - 1 ? <div className="my-1 w-0.5 flex-1 bg-border" style={{ minHeight: 24 }} /> : null}
              </div>
              <div className="min-w-0 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{meta.label}</p>
                  <Badge variant="outline">{log.source}</Badge>
                  {log.rawStatus ? <span className="font-mono text-xs text-muted-foreground">{log.rawStatus}</span> : null}
                </div>
                {log.location ? <p className="mt-0.5 text-xs text-muted-foreground">{log.location}</p> : null}
                {log.note ? <p className="mt-1 text-sm text-muted-foreground">{log.note}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(log.createdAt)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = Number(params.id);
  const queryClient = useQueryClient();

  const orderQuery = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: () => getAdminOrder(orderId),
    enabled: Number.isFinite(orderId),
  });

  const shipmentQuery = useQuery({
    queryKey: ['admin-order-shipment', orderId],
    queryFn: () => getAdminOrderShipment(orderId),
    enabled: Number.isFinite(orderId),
  });

  const createShipmentMutation = useMutation({
    mutationFn: (provider: string) => createAdminOrderShipment(orderId, provider),
    onSuccess: async () => {
      toast.success('Đã tạo vận đơn');
      await shipmentQuery.refetch();
      await queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });

  const order = orderQuery.data;
  const totals = useMemo(() => {
    if (!order) return { subtotal: 0, shippingFee: 0, discount: 0, final: 0 };
    return {
      subtotal: Number(order.totalAmount ?? 0),
      shippingFee: Number(order.shippingFee ?? 0),
      discount: Number(order.discountAmount ?? 0),
      final: Number(order.finalAmount ?? 0),
    };
  }, [order]);

  async function copyTracking(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Đã copy mã vận đơn');
  }

  if (orderQuery.isLoading) {
    return <OrderSkeleton />;
  }

  if (orderQuery.isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-md border bg-card py-16">
        <XCircleIcon className="size-10 text-destructive/60" />
        <p className="text-sm font-medium">Không thể tải đơn hàng</p>
        <Button variant="outline" onClick={() => orderQuery.refetch()}>
          <RefreshCwIcon />
          Thử lại
        </Button>
      </div>
    );
  }

  const orderStatus = ORDER_STATUS[order.status];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href="/dashboard/orders" aria-label="Quay lại">
              <ArrowLeftIcon />
            </Link>
          </Button>
          <Link href="/dashboard/orders" className="hover:text-foreground">Đơn hàng</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{orderCode(order)}</span>
        </div>
        <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-6">
          <div className="rounded-md border bg-card">
            <div className="border-b px-5 py-4">
              <h2 className="text-sm font-semibold">Sản phẩm</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-center">Số lượng</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <PackageIcon className="size-5 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.sku ? <p className="text-xs text-muted-foreground">{item.sku}</p> : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{item.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{vnd.format(Number(item.unitPrice))}</TableCell>
                    <TableCell className="text-right font-medium">{vnd.format(Number(item.subtotal))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="border-t px-5 py-4">
              <div className="ml-auto max-w-xs space-y-2">
                <InfoRow label="Tạm tính" value={vnd.format(totals.subtotal)} />
                <InfoRow label="Phí vận chuyển" value={totals.shippingFee === 0 ? 'Miễn phí' : vnd.format(totals.shippingFee)} />
                {totals.discount > 0 ? <InfoRow label="Giảm giá" value={`-${vnd.format(totals.discount)}`} /> : null}
                <Separator />
                <InfoRow label="Tổng cộng" value={vnd.format(totals.final)} />
              </div>
            </div>
          </div>

          <ShipmentPanel
            order={order}
            shipmentData={shipmentQuery.data}
            creating={createShipmentMutation.isPending}
            onCreate={(provider) => createShipmentMutation.mutate(provider)}
            onCopy={copyTracking}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-md border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold">Thông tin đơn hàng</h2>
            <div className="space-y-2 text-sm">
              <InfoRow label="Mã đơn" value={orderCode(order)} />
              <InfoRow label="Ngày đặt" value={formatDateTime(order.createdAt)} />
              <InfoRow label="Thanh toán" value={order.paymentMethod.toUpperCase()} />
            </div>
          </div>

          <div className="rounded-md border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold">Người nhận</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.shippingAddress.receiver}</p>
              <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
            </div>
          </div>

          <div className="rounded-md border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold">Địa chỉ giao hàng</h2>
            <div className="space-y-0.5 text-sm text-muted-foreground">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.ward}, {order.shippingAddress.district}</p>
              <p>{order.shippingAddress.province}</p>
            </div>
          </div>

          {order.note ? (
            <div className="rounded-md border bg-card px-5 py-4">
              <h2 className="mb-2 text-sm font-semibold">Ghi chú</h2>
              <p className="text-sm text-muted-foreground">{order.note}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
