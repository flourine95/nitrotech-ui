'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  MoreHorizontalIcon,
  PackageIcon,
  TruckIcon,
  XCircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { InfoRow } from '@/components/dashboard/info-row';
import { MoneyRow } from '@/components/dashboard/money-row';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  createAdminOrderShipment,
  getAdminOrder,
  getAdminOrderShipment,
  simulateAdminShipmentEvent,
  updateAdminOrderStatus,
  type AdminOrderStatus,
} from '@/lib/api/admin/orders';
import { getAuditLogs } from '@/lib/api/admin/audit-logs';
import { formatViDate, formatViDateTime, formatVnd } from '@/lib/utils/formatting';
import {
  orderStatusConfig,
  type OrderTone,
  paymentLabels,
  getGhtkWebhookStatusLabel,
  shipmentStatusLabels,
  toneClass,
} from '../order-display';
import {
  OrderActionPanel,
  OrderCalloutBanner,
  DetailSkeleton,
  OrderPipeline,
} from './order-detail-components';
import { auditSummary } from './order-detail-helpers';
import {
  OrderCustomerPanel,
  OrderPaymentPanel,
  OrderShipmentPanel,
  OrderShippingAddressPanel,
} from './order-detail-panels';

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const [reasonAction, setReasonAction] = useState<{
    status: Extract<NextOrderStatus, 'cancelled' | 'refunded'>;
    label: string;
  } | null>(null);
  const [reasonText, setReasonText] = useState('');

  const orderQuery = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => getAdminOrder(id),
    enabled: !isNaN(id),
  });

  const shipmentQuery = useQuery({
    queryKey: ['admin-order-shipment', id],
    queryFn: () => getAdminOrderShipment(id),
    enabled: !isNaN(id),
  });

  const auditQuery = useQuery({
    queryKey: ['audit-logs', 'order', id],
    queryFn: () =>
      getAuditLogs({
        resourceType: 'ORDER',
        resourceId: String(id),
        sortBy: 'createdAt',
        sortDir: 'desc',
        size: 10,
      }),
    enabled: !isNaN(id),
  });

  const createShipmentMutation = useMutation({
    mutationFn: () => createAdminOrderShipment(id, 'ghtk'),
    onSuccess: async () => {
      toast.success('Đã tạo vận đơn');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order-shipment', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order-facets'] }),
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không thể tạo vận đơn');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      status,
      reason,
      note,
    }: {
      status: NextOrderStatus;
      reason?: string;
      note?: string;
    }) => updateAdminOrderStatus(id, status, { reason, note }),
    onSuccess: async () => {
      toast.success('Đã cập nhật trạng thái đơn');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order-shipment', id] }),
        queryClient.invalidateQueries({ queryKey: ['audit-logs', 'order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order-facets'] }),
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật trạng thái');
    },
  });

  const simulateShipmentMutation = useMutation({
    mutationFn: ({ shipmentId, status }: { shipmentId: number; status: string }) =>
      simulateAdminShipmentEvent(shipmentId, {
        status,
        location: 'Staging demo',
        note: `Simulated ${status} event from admin order detail`,
      }),
    onSuccess: async () => {
      toast.success('Đã giả lập cập nhật vận chuyển');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order-shipment', id] }),
        queryClient.invalidateQueries({ queryKey: ['audit-logs', 'order', id] }),
        queryClient.invalidateQueries({ queryKey: ['admin-orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin-order-facets'] }),
      ]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Không thể giả lập vận chuyển');
    },
  });

  if (orderQuery.isLoading) return <DetailSkeleton />;

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <div className="flex h-[calc(100dvh-6.5rem)] w-full flex-col items-center justify-center gap-3 text-muted-foreground">
        <AlertCircleIcon className="size-10 text-destructive/40" />
        <p className="text-sm font-medium text-foreground">Không tìm thấy đơn hàng</p>
        <p className="text-xs">ID không hợp lệ hoặc đơn hàng không tồn tại.</p>
        <Button variant="outline" size="sm" className="mt-1" asChild>
          <Link href="/dashboard/orders">Quay lại danh sách</Link>
        </Button>
      </div>
    );
  }

  const order = orderQuery.data;
  const shipmentData = shipmentQuery.data ?? null;
  const logs = shipmentData?.logs ?? [];
  const auditLogs = auditQuery.data?.data ?? [];
  const paymentLabel = paymentLabels[order.paymentMethod] ?? order.paymentMethod.toUpperCase();
  const customerShippingFee = Number(order.shippingFee);
  const shipment = shipmentData?.shipment ?? null;
  const cfg =
    getShipmentAwareDisplayConfig(order.status, shipment?.status ?? null) ??
    orderStatusConfig[order.status] ??
    orderStatusConfig.pending;
  const isTerminal = cfg.terminal === true;
  const simulationEnabled = process.env.NEXT_PUBLIC_ENABLE_SHIPMENT_SIMULATION === 'true';
  const simulationOptions =
    simulationEnabled && shipment ? getShipmentSimulationOptions(shipment.status) : [];
  const operationalActions = getOperationalActions({
    status: order.status,
    hasShipment: Boolean(shipment),
    shipmentStatus: shipment?.status ?? null,
    isCreatingShipment: createShipmentMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    onCreateShipment: () => createShipmentMutation.mutate(),
    onStatusChange: (status) => {
      if (status === 'cancelled' || status === 'refunded') {
        setReasonAction({
          status,
          label: status === 'cancelled' ? 'Hủy đơn hàng' : 'Hoàn tiền đơn hàng',
        });
        setReasonText('');
        return;
      }

      updateStatusMutation.mutate({ status });
    },
  });

  async function copyTracking(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Đã copy mã vận đơn');
  }

  return (
    <>
      <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-4 overflow-hidden">
        {/* ── Header ── */}
        <section className="shrink-0 border-b border-dashed border-border/70 pb-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
            {/* Left: Back + title */}
            <div className="flex min-w-0 items-start gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 rounded-xl shadow-none"
                asChild
              >
                <Link href="/dashboard/orders" aria-label="Quay lại danh sách đơn hàng">
                  <ArrowLeftIcon />
                </Link>
              </Button>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight">
                    Mã đơn: {order.orderCode}
                  </h1>
                  <Badge
                    className={cn(
                      'h-6 rounded-md px-2 font-semibold shadow-sm',
                      toneClass(cfg.tone),
                    )}
                  >
                    {cfg.label}
                  </Badge>
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Chi tiết đơn bán hàng, tiến trình xử lý, thanh toán, khách hàng và vận chuyển.
                </p>
              </div>
            </div>
            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-9 rounded-xl shadow-none"
                    aria-label="Tùy chọn đơn hàng"
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={6} className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuItem disabled>In phiếu đóng gói</DropdownMenuItem>
                    <DropdownMenuItem disabled>Xuất hóa đơn</DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
                      Hủy đơn hàng
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <section className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* Main column */}
          <main className="flex min-h-0 min-w-0 flex-col gap-8 overflow-y-auto pr-1">
            {/* Pipeline OR Terminal callout */}
            {isTerminal ? (
              <OrderCalloutBanner tone={cfg.tone} title={cfg.stateTitle} text={cfg.stateText} />
            ) : (
              <div className="rounded-xl border bg-muted/20 p-5">
                <div className="mb-4">
                  <p className="text-sm font-semibold">{cfg.stateTitle}</p>
                  <p className="text-sm text-muted-foreground">{cfg.stateText}</p>
                </div>
                <OrderPipeline progress={cfg.progress} />
              </div>
            )}

            {operationalActions.length > 0 ? (
              <OrderActionPanel
                title="Hành động tiếp theo"
                text="Chỉ hiển thị các thao tác phù hợp với trạng thái hiện tại để hạn chế cập nhật nhầm."
                actions={operationalActions}
              />
            ) : null}

            {/* Order meta info */}
            <section className="border-b border-border/70 pb-8">
              <div className="grid gap-5 px-1">
                <div>
                  <h2 className="text-base font-semibold">Thông tin đơn hàng</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Ngày tạo, phương thức thanh toán và các thông tin liên quan.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoRow label="Ngày đặt">{formatViDate(order.createdAt)}</InfoRow>
                  <InfoRow label="Cập nhật gần nhất">{formatViDate(order.updatedAt)}</InfoRow>
                  <InfoRow label="Phương thức thanh toán">{paymentLabel}</InfoRow>
                  {order.promotionCode && (
                    <InfoRow label="Mã khuyến mãi">
                      <span className="font-mono text-sm">{order.promotionCode}</span>
                    </InfoRow>
                  )}
                  {order.note && <InfoRow label="Ghi chú của khách">{order.note}</InfoRow>}
                </div>
              </div>
            </section>

            {/* Products */}
            <section className="border-b border-border/70 pb-8">
              <div className="grid gap-5 px-1">
                <div>
                  <h2 className="text-base font-semibold">Sản phẩm đã đặt</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Line-item và tổng tiền cho đơn bán hàng hiện tại.
                  </p>
                </div>

                <div className="grid gap-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 border-b border-dashed border-border/70 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1.8fr)_64px_100px_120px] sm:items-start"
                    >
                      {/* Product name + image */}
                      <div className="flex min-w-0 items-center gap-3">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            width={56}
                            height={56}
                            unoptimized
                            className="size-14 shrink-0 rounded-xl border object-cover"
                          />
                        ) : (
                          <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
                            <PackageIcon className="size-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="leading-snug font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.sku ?? '—'}</p>
                        </div>
                      </div>
                      <InfoRow label="SL">{item.quantity} cái</InfoRow>
                      <InfoRow label="Đơn giá">{formatVnd(Number(item.unitPrice))}</InfoRow>
                      <InfoRow label="Thành tiền">{formatVnd(Number(item.subtotal))}</InfoRow>
                    </div>
                  ))}
                </div>

                {/* Money summary */}
                <div className="ml-auto grid w-full max-w-sm gap-3 pt-1">
                  <MoneyRow label="Tạm tính" value={formatVnd(Number(order.totalAmount))} />
                  <MoneyRow
                    label="Phí khách trả"
                    value={customerShippingFee === 0 ? 'Miễn phí' : formatVnd(customerShippingFee)}
                  />
                  <MoneyRow
                    label="Giảm giá"
                    value={
                      Number(order.discountAmount) > 0
                        ? `-${formatVnd(Number(order.discountAmount))}`
                        : '—'
                    }
                  />
                  <Separator />
                  <MoneyRow label="Tổng cộng" value={formatVnd(Number(order.finalAmount))} strong />
                </div>
              </div>
            </section>

            {/* Shipment logs timeline */}
            {logs.length > 0 && (
              <section className="pb-2">
                <div className="grid gap-5 px-1">
                  <div>
                    <h2 className="text-base font-semibold">Lịch sử vận chuyển</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Hành trình cập nhật từ đơn vị vận chuyển.
                    </p>
                  </div>
                  <div className="grid gap-0">
                    {logs.map((log, i) => {
                      const mapped = shipmentStatusLabels[log.status];
                      const ghtkEventLabel = shipment?.provider === 'ghtk' && log.source === 'WEBHOOK'
                        ? getGhtkWebhookStatusLabel(log.rawStatus)
                        : undefined;
                      const label = ghtkEventLabel ?? mapped?.label ?? log.status;
                      const isLast = i === logs.length - 1;
                      return (
                        <div key={log.id} className="flex gap-3">
                          {/* Connector */}
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'mt-1.5 size-2 shrink-0 rounded-full',
                                i === 0 ? 'bg-foreground' : 'bg-border',
                              )}
                            />
                            {!isLast && <div className="my-1 w-px flex-1 bg-border/60" />}
                          </div>
                          {/* Content */}
                          <div className={cn('min-w-0 pb-4', isLast && 'pb-0')}>
                            <p className="text-sm leading-tight font-medium">{label}</p>
                            {log.location && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{log.location}</p>
                            )}
                            {log.note && (
                              <p className="mt-0.5 text-xs text-muted-foreground">{log.note}</p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {formatViDateTime(log.occurredAt ?? log.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {auditLogs.length > 0 && (
              <section className="pb-2">
                <div className="grid gap-5 px-1">
                  <div>
                    <h2 className="text-base font-semibold">Lịch sử thao tác</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Các thay đổi trạng thái và thao tác quản trị trên đơn hàng.
                    </p>
                  </div>
                  <div className="grid gap-0">
                    {auditLogs.map((log, i) => {
                      const summary = auditSummary(log);
                      const isLast = i === auditLogs.length - 1;
                      return (
                        <div key={log.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={cn(
                                'mt-1.5 size-2 shrink-0 rounded-full',
                                i === 0 ? 'bg-foreground' : 'bg-border',
                              )}
                            />
                            {!isLast && <div className="my-1 w-px flex-1 bg-border/60" />}
                          </div>
                          <div className={cn('min-w-0 pb-4', isLast && 'pb-0')}>
                            <p className="text-sm leading-tight font-medium">{summary.title}</p>
                            {summary.detail && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {summary.detail}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted-foreground">
                              {log.actorEmail ?? log.actorType} · {formatViDateTime(log.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </main>

          {/* Aside */}
          <aside className="flex max-h-full min-h-0 self-start overflow-y-auto rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-col gap-4">
              <OrderPaymentPanel order={order} />
              <OrderCustomerPanel order={order} />
              <OrderShippingAddressPanel order={order} />
              <OrderShipmentPanel
                shipmentData={shipmentData}
                isLoading={shipmentQuery.isLoading}
                isCreating={createShipmentMutation.isPending}
                onCreateShipment={() => createShipmentMutation.mutate()}
                onCopyTracking={copyTracking}
                simulationOptions={simulationOptions}
                isSimulating={simulateShipmentMutation.isPending}
                onSimulateShipmentEvent={
                  shipment
                    ? (status) =>
                        simulateShipmentMutation.mutate({ shipmentId: shipment.id, status })
                    : undefined
                }
              />
            </div>
          </aside>
        </section>
      </div>
      <Dialog
        open={reasonAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReasonAction(null);
            setReasonText('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reasonAction?.label}</DialogTitle>
            <DialogDescription>
              Nhập lý do để lưu vào lịch sử thao tác và hỗ trợ tra soát sau này.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="order-detail-action-reason">Lý do</Label>
            <Textarea
              id="order-detail-action-reason"
              value={reasonText}
              onChange={(event) => setReasonText(event.target.value)}
              placeholder={
                reasonAction?.status === 'cancelled'
                  ? 'Ví dụ: Khách yêu cầu hủy đơn'
                  : 'Ví dụ: Đơn đã hoàn tiền sau đối soát'
              }
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
              onClick={() => {
                if (!reasonAction || !reasonText.trim()) return;
                updateStatusMutation.mutate({
                  status: reasonAction.status,
                  reason: reasonText.trim(),
                });
                setReasonAction(null);
                setReasonText('');
              }}
            >
              {reasonAction?.status === 'cancelled' ? 'Hủy đơn' : 'Xác nhận hoàn tiền'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getShipmentSimulationOptions(status: string) {
  const labels: Record<string, string> = {
    ready_to_pick: 'Chờ lấy hàng',
    picked: 'Đã lấy hàng',
    storing: 'Đang lưu kho',
    transporting: 'Đang vận chuyển',
    sorting: 'Đang phân loại',
    delivering: 'Đang giao hàng',
    delivered: 'Đã giao thành công',
    delivery_failed: 'Giao thất bại',
    waiting_to_return: 'Chờ hoàn hàng',
    returning: 'Đang hoàn hàng',
    returned: 'Đã hoàn hàng',
    cancel: 'Hủy vận đơn',
  };
  const transitions: Record<string, string[]> = {
    unknown: ['ready_to_pick'],
    ready_to_pick: ['picked', 'cancel'],
    picked: ['storing', 'transporting', 'delivering', 'delivery_failed', 'cancel'],
    storing: ['transporting', 'sorting', 'delivering', 'delivery_failed'],
    transporting: ['sorting', 'delivering', 'delivery_failed'],
    sorting: ['delivering', 'delivery_failed'],
    delivering: ['delivered', 'delivery_failed', 'waiting_to_return'],
    money_collect_delivering: ['delivered', 'delivery_failed', 'waiting_to_return'],
    delivery_failed: ['delivering', 'waiting_to_return', 'returning'],
    waiting_to_return: ['returning'],
    return: ['return_transporting'],
    returning: ['return_transporting', 'returned'],
    return_transporting: ['return_sorting', 'returned'],
    return_sorting: ['returned'],
  };

  return (transitions[status] ?? []).map((value) => ({
    status: value,
    label: labels[value] ?? value,
  }));
}

type NextOrderStatus = Exclude<AdminOrderStatus, 'pending' | 'expired'>;

function getOperationalActions({
  status,
  hasShipment,
  shipmentStatus,
  isCreatingShipment,
  isUpdatingStatus,
  onCreateShipment,
  onStatusChange,
}: {
  status: AdminOrderStatus;
  hasShipment: boolean;
  shipmentStatus: string | null;
  isCreatingShipment: boolean;
  isUpdatingStatus: boolean;
  onCreateShipment: () => void;
  onStatusChange: (status: NextOrderStatus) => void;
}) {
  const pending = isCreatingShipment || isUpdatingStatus;
  const actions: Array<{
    label: string;
    icon?: typeof CheckCircle2Icon;
    variant?: 'default' | 'outline' | 'destructive';
    disabled?: boolean;
    pending?: boolean;
    onClick: () => void;
  }> = [];

  if (status === 'pending') {
    actions.push({
      label: 'Xác nhận đơn',
      icon: CheckCircle2Icon,
      pending: isUpdatingStatus,
      onClick: () => onStatusChange('confirmed'),
    });
  }

  if (status === 'confirmed') {
    actions.push({
      label: 'Chuyển sang xử lý',
      icon: CheckCircle2Icon,
      pending: isUpdatingStatus,
      onClick: () => onStatusChange('processing'),
    });
  }

  if ((status === 'confirmed' || status === 'processing') && !hasShipment) {
    actions.push({
      label: 'Tạo vận đơn',
      icon: TruckIcon,
      variant: status === 'processing' ? 'default' : 'outline',
      pending: isCreatingShipment,
      onClick: onCreateShipment,
    });
  }

  if (status === 'processing') {
    actions.push({
      label: 'Đánh dấu đang giao',
      icon: TruckIcon,
      variant: hasShipment ? 'default' : 'outline',
      disabled: !hasShipment,
      pending: isUpdatingStatus,
      onClick: () => onStatusChange('shipped'),
    });
  }

  if (status === 'shipped' && canMarkDeliveredFromShipment(shipmentStatus)) {
    actions.push({
      label: 'Đánh dấu đã giao',
      icon: CheckCircle2Icon,
      pending: isUpdatingStatus,
      onClick: () => onStatusChange('delivered'),
    });
  }

  if (status === 'pending' || status === 'confirmed' || status === 'processing') {
    actions.push({
      label: 'Hủy đơn',
      icon: XCircleIcon,
      variant: 'destructive',
      disabled: pending,
      onClick: () => onStatusChange('cancelled'),
    });
  }

  return actions;
}

function canMarkDeliveredFromShipment(status: string | null) {
  if (!status) return true;
  return [
    'delivering',
    'money_collect_delivering',
    'transporting',
    'sorting',
    'picked',
    'storing',
  ].includes(status);
}

function getShipmentAwareDisplayConfig(
  orderStatus: AdminOrderStatus,
  shipmentStatus: string | null,
) {
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
      stateText:
        'Đơn vị vận chuyển báo giao thất bại. Không nên đánh dấu đã giao cho đến khi có lượt giao lại thành công.',
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
      stateText: 'Vận đơn đã rời luồng giao hàng thành công và đang trong quá trình hoàn hàng.',
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
      stateText:
        'Vận đơn đã hoàn về. Đơn hàng cần được xử lý theo quy trình hoàn hàng/đối soát, không phải hoàn tất giao hàng.',
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
      stateText:
        'Đơn vị vận chuyển chưa lấy được hàng. Cần kiểm tra lại bàn giao kho hoặc tạo lịch lấy hàng mới.',
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
      stateText:
        'Vận đơn không còn hiệu lực. Nếu vẫn cần giao hàng, hãy tạo vận đơn mới trước khi tiếp tục xử lý.',
      action: 'Xem vận chuyển',
      terminal: true,
    };
  }

  return null;
}
