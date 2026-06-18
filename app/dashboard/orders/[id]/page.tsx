'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CheckCircle2Icon,
  ClipboardIcon,
  MailIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  PhoneIcon,
  RefreshCwIcon,
  ShoppingCartIcon,
  TruckIcon,
  UserRoundIcon,
  XCircleIcon,
} from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  getAdminOrder,
  getAdminOrderShipment,
  type AdminOrderStatus,
} from '@/lib/api/admin/orders';
import { getAuditLogs, type AuditLogEntry } from '@/lib/api/admin/audit-logs';

// ─── Formatters ──────────────────────────────────────────────────────────────
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const viDate = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
const viDateTime = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit',
});

// ─── Status configs ───────────────────────────────────────────────────────────
const statusConfig: Record<
  AdminOrderStatus,
  { label: string; tone: string; progress: number; stageTitle: string; stageText: string; terminal?: boolean }
> = {
  pending: {
    label: 'Chờ xác nhận', tone: 'warning', progress: 1,
    stageTitle: 'Đơn mới',
    stageText: 'Đơn đang chờ xác nhận trước khi chuyển sang xử lý kho.',
  },
  confirmed: {
    label: 'Đã xác nhận', tone: 'success', progress: 1,
    stageTitle: 'Đã xác nhận',
    stageText: 'Đơn đã được xác nhận và sẵn sàng chuyển sang đóng gói.',
  },
  processing: {
    label: 'Đang xử lý', tone: 'default', progress: 2,
    stageTitle: 'Đang đóng gói',
    stageText: 'Kho đang lấy hàng, kiểm tra và chuẩn bị bàn giao vận chuyển.',
  },
  shipped: {
    label: 'Đang giao', tone: 'default', progress: 3,
    stageTitle: 'Đơn đang giao',
    stageText: 'Đơn đã rời kho và đang theo dõi tiến trình vận chuyển.',
  },
  delivered: {
    label: 'Hoàn thành', tone: 'success', progress: 4,
    stageTitle: 'Đã giao thành công',
    stageText: 'Đơn đã hoàn tất và sẵn sàng đối soát chứng từ.',
  },
  cancelled: {
    label: 'Đã hủy', tone: 'danger', progress: 0,
    stageTitle: 'Đơn hàng đã bị hủy',
    stageText: 'Đơn không còn trong luồng xử lý vận hành.',
    terminal: true,
  },
  refunded: {
    label: 'Đã hoàn tiền', tone: 'warning', progress: 0,
    stageTitle: 'Đã hoàn tiền',
    stageText: 'Thanh toán đã được hoàn trả và đơn đã đóng.',
    terminal: true,
  },
  expired: {
    label: 'Đã hết hạn', tone: 'danger', progress: 0,
    stageTitle: 'Đơn hết hạn',
    stageText: 'Đơn chưa được xác nhận trong thời hạn xử lý.',
    terminal: true,
  },
};

const paymentLabels: Record<string, string> = {
  cod: 'COD',
  vnpay: 'VNPay',
  momo: 'MoMo',
  sepay: 'SePay',
};

const paymentDescriptions: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'Cổng thanh toán VNPay',
  momo: 'Ví MoMo',
  sepay: 'Chuyển khoản SePay',
};

const shipmentProviderLabels: Record<string, string> = {
  ghtk: 'GHTK',
  ghn: 'GHN',
  viettel_post: 'Viettel Post',
  viettelpost: 'Viettel Post',
};

const paymentStatusMap: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Chưa thanh toán', tone: 'warning' },
  paid: { label: 'Đã thanh toán', tone: 'success' },
  failed: { label: 'Thanh toán thất bại', tone: 'danger' },
};

const shipmentStatusMap: Record<string, { label: string; tone: string }> = {
  pending: { label: 'Chờ xử lý', tone: 'default' },
  ready_to_pick: { label: 'Chờ lấy hàng', tone: 'warning' },
  picking: { label: 'Đang lấy hàng', tone: 'warning' },
  money_collect_picking: { label: 'Đang lấy & thu tiền', tone: 'warning' },
  picked: { label: 'Đã lấy hàng', tone: 'default' },
  storing: { label: 'Đang lưu kho', tone: 'default' },
  transporting: { label: 'Đang vận chuyển', tone: 'default' },
  sorting: { label: 'Đang phân loại', tone: 'default' },
  delivering: { label: 'Đang giao hàng', tone: 'default' },
  money_collect_delivering: { label: 'Đang giao & thu tiền', tone: 'warning' },
  delivered: { label: 'Đã giao thành công', tone: 'success' },
  delivery_fail: { label: 'Giao thất bại', tone: 'danger' },
  waiting_to_return: { label: 'Chờ hoàn hàng', tone: 'warning' },
  return: { label: 'Đang hoàn hàng', tone: 'danger' },
  returned: { label: 'Đã hoàn hàng', tone: 'danger' },
  cancel: { label: 'Đã hủy', tone: 'danger' },
  exception: { label: 'Ngoại lệ', tone: 'danger' },
};

// ─── Pipeline steps ───────────────────────────────────────────────────────────
const pipelineSteps = [
  { label: 'Đặt hàng', icon: ShoppingCartIcon },
  { label: 'Đóng gói', icon: PackageIcon },
  { label: 'Giao hàng', icon: TruckIcon },
  { label: 'Hoàn tất', icon: CheckCircle2Icon },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toneClass(tone: string) {
  if (tone === 'success') return 'border-transparent bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12';
  if (tone === 'warning') return 'border-transparent bg-amber-500/12 text-amber-700 hover:bg-amber-500/12';
  if (tone === 'danger') return 'border-transparent bg-rose-500/12 text-rose-700 hover:bg-rose-500/12';
  return 'border-transparent bg-sky-500/12 text-sky-700 hover:bg-sky-500/12';
}

function toneBg(tone: string) {
  if (tone === 'danger') return 'bg-rose-500/8 border-rose-200 text-rose-800';
  if (tone === 'warning') return 'bg-amber-500/8 border-amber-200 text-amber-800';
  return 'bg-sky-500/8 border-sky-200 text-sky-800';
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}

function MoneyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 text-sm', strong && 'text-base font-semibold')}>
      <span className={cn(!strong && 'text-muted-foreground')}>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Pipeline({ progress }: { progress: number }) {
  return (
    <div className="grid gap-3">
      {/* Desktop */}
      <div className="hidden grid-cols-[auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto] items-center gap-x-3 md:grid">
        {pipelineSteps.map((step, i) => {
          const active = i < progress;
          const complete = i < progress - 1;
          const Icon = step.icon;
          return (
            <div key={step.label} className="contents">
              <div className={cn('flex size-7 items-center justify-center rounded-md border bg-background', active ? 'border-foreground text-foreground' : 'border-border text-muted-foreground')}>
                <Icon className="size-3.5" />
              </div>
              {i < pipelineSteps.length - 1 && (
                <div className="h-1 rounded-full bg-border/70">
                  <div className={cn('h-full rounded-full transition-all', complete && 'bg-foreground')} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="hidden grid-cols-[auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto_minmax(40px,1fr)_auto] gap-x-3 text-[11px] font-medium text-muted-foreground md:grid">
        {pipelineSteps.map((step, i) => (
          <div key={step.label} className="contents">
            <span>{step.label}</span>
            {i < pipelineSteps.length - 1 && <span aria-hidden />}
          </div>
        ))}
      </div>
      {/* Mobile */}
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {pipelineSteps.map((step, i) => {
          const active = i < progress;
          const complete = i < progress - 1;
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1">
                <div className={cn('flex size-5 shrink-0 items-center justify-center rounded-md border', active ? 'border-foreground text-foreground' : 'border-border text-muted-foreground')}>
                  <Icon className="size-2.5" />
                </div>
                {i < pipelineSteps.length - 1 && (
                  <div className="h-1 flex-1 rounded-full bg-border/70">
                    <div className={cn('h-full rounded-full', complete && 'bg-foreground')} />
                  </div>
                )}
              </div>
              <span className="truncate text-[11px] leading-none text-muted-foreground">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalloutBanner({ tone, title, text }: { tone: string; title: string; text: string }) {
  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-5', toneBg(tone))}>
      {tone === 'danger' ? (
        <XCircleIcon className="mt-0.5 size-5 shrink-0" />
      ) : tone === 'warning' ? (
        <RefreshCwIcon className="mt-0.5 size-5 shrink-0" />
      ) : (
        <AlertCircleIcon className="mt-0.5 size-5 shrink-0" />
      )}
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-sm opacity-80">{text}</p>
      </div>
    </div>
  );
}

function auditSummary(log: AuditLogEntry) {
  const beforeStatus = typeof log.beforeData?.status === 'string' ? log.beforeData.status : null;
  const afterStatus = typeof log.afterData?.status === 'string' ? log.afterData.status : null;
  const reason = typeof log.metadata?.reason === 'string' ? log.metadata.reason : null;
  const note = typeof log.metadata?.note === 'string' ? log.metadata.note : null;

  if (log.action === 'ORDER_STATUS_UPDATED') {
    const from = beforeStatus ? (statusConfig[beforeStatus as AdminOrderStatus]?.label ?? beforeStatus) : null;
    const to = afterStatus ? (statusConfig[afterStatus as AdminOrderStatus]?.label ?? afterStatus) : null;
    return {
      title: from && to ? `Đổi trạng thái từ ${from} sang ${to}` : 'Cập nhật trạng thái đơn',
      detail: reason ?? note,
    };
  }

  return {
    title: log.action,
    detail: reason ?? note,
  };
}

function DetailSkeleton() {
  return (
    <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-4 overflow-hidden">
      <section className="shrink-0 border-b border-dashed border-border/70 pb-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="grid gap-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>
        </div>
      </section>
      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-36 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

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
  const shipment = shipmentData?.shipment ?? null;
  const logs = shipmentData?.logs ?? [];
  const auditLogs = auditQuery.data?.data ?? [];
  const cfg = statusConfig[order.status] ?? statusConfig.pending;
  const isTerminal = cfg.terminal === true;
  const paymentLabel = paymentLabels[order.paymentMethod] ?? order.paymentMethod.toUpperCase();
  const paymentDescription = paymentDescriptions[order.paymentMethod] ?? 'Phương thức thanh toán';
  const shipmentProvider = shipment
    ? (shipmentProviderLabels[shipment.provider.toLowerCase()] ?? shipment.provider.toUpperCase())
    : null;
  const customerShippingFee = Number(order.shippingFee);
  const carrierShippingFee = shipment ? Number(shipment.fee) : null;

  async function copyTracking(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Đã copy mã vận đơn');
  }

  const shipStatusInfo = shipment ? (shipmentStatusMap[shipment.status] ?? { label: shipment.status, tone: 'default' }) : null;

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-4 overflow-hidden">

      {/* ── Header ── */}
      <section className="shrink-0 border-b border-dashed border-border/70 pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          {/* Left: Back + title */}
          <div className="flex min-w-0 items-start gap-3">
            <Button variant="outline" size="icon" className="size-9 shrink-0 rounded-xl shadow-none" asChild>
              <Link href="/dashboard/orders" aria-label="Quay lại danh sách đơn hàng">
                <ArrowLeftIcon />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight">Mã đơn: {order.orderCode}</h1>
                <Badge className={cn('h-6 rounded-md px-2 font-semibold shadow-sm', toneClass(cfg.tone))}>
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
            <Button className="h-9 rounded-xl">
              <PencilIcon data-icon="inline-start" />
              Cập nhật
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-9 rounded-xl shadow-none" aria-label="Tùy chọn đơn hàng">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6} className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>In phiếu đóng gói</DropdownMenuItem>
                  <DropdownMenuItem>Xuất hóa đơn</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive focus:text-destructive">Hủy đơn hàng</DropdownMenuItem>
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
            <CalloutBanner tone={cfg.tone} title={cfg.stageTitle} text={cfg.stageText} />
          ) : (
            <div className="rounded-xl border bg-muted/20 p-5">
              <div className="mb-4">
                <p className="text-sm font-semibold">{cfg.stageTitle}</p>
                <p className="text-sm text-muted-foreground">{cfg.stageText}</p>
              </div>
              <Pipeline progress={cfg.progress} />
            </div>
          )}

          {/* Order meta info */}
          <section className="border-b border-border/70 pb-8">
            <div className="grid gap-5 px-1">
              <div>
                <h2 className="text-base font-semibold">Thông tin đơn hàng</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">Ngày tạo, phương thức thanh toán và các thông tin liên quan.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoRow label="Ngày đặt">{viDate.format(new Date(order.createdAt))}</InfoRow>
                <InfoRow label="Cập nhật gần nhất">{viDate.format(new Date(order.updatedAt))}</InfoRow>
                <InfoRow label="Phương thức thanh toán">{paymentLabel}</InfoRow>
                {order.promotionCode && (
                  <InfoRow label="Mã khuyến mãi">
                    <span className="font-mono text-sm">{order.promotionCode}</span>
                  </InfoRow>
                )}
                {order.note && (
                  <InfoRow label="Ghi chú của khách">{order.note}</InfoRow>
                )}
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
                  <div key={item.id} className="grid gap-3 border-b border-dashed border-border/70 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[minmax(0,1.8fr)_64px_100px_120px] sm:items-start">
                    {/* Product name + image */}
                    <div className="flex min-w-0 items-center gap-3">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="size-14 shrink-0 rounded-xl border object-cover" />
                      ) : (
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border bg-muted/30 text-muted-foreground">
                          <PackageIcon className="size-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium leading-snug">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.sku ?? '—'}</p>
                      </div>
                    </div>
                    <InfoRow label="SL">{item.quantity} cái</InfoRow>
                    <InfoRow label="Đơn giá">{vnd.format(Number(item.unitPrice))}</InfoRow>
                    <InfoRow label="Thành tiền">{vnd.format(Number(item.subtotal))}</InfoRow>
                  </div>
                ))}
              </div>

              {/* Money summary */}
              <div className="ml-auto grid w-full max-w-sm gap-3 pt-1">
                <MoneyRow label="Tạm tính" value={vnd.format(Number(order.totalAmount))} />
                <MoneyRow
                  label="Phí khách trả"
                  value={customerShippingFee === 0 ? 'Miễn phí' : vnd.format(customerShippingFee)}
                />
                <MoneyRow
                  label="Giảm giá"
                  value={Number(order.discountAmount) > 0 ? `-${vnd.format(Number(order.discountAmount))}` : '—'}
                />
                <Separator />
                <MoneyRow label="Tổng cộng" value={vnd.format(Number(order.finalAmount))} strong />
              </div>
            </div>
          </section>

          {/* Shipment logs timeline */}
          {logs.length > 0 && (
            <section className="pb-2">
              <div className="grid gap-5 px-1">
                <div>
                  <h2 className="text-base font-semibold">Lịch sử vận chuyển</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">Hành trình cập nhật từ đơn vị vận chuyển.</p>
                </div>
                <div className="grid gap-0">
                  {logs.map((log, i) => {
                    const mapped = shipmentStatusMap[log.status];
                    const label = mapped?.label ?? log.status;
                    const isLast = i === logs.length - 1;
                    return (
                      <div key={log.id} className="flex gap-3">
                        {/* Connector */}
                        <div className="flex flex-col items-center">
                          <div className={cn('mt-1.5 size-2 shrink-0 rounded-full', i === 0 ? 'bg-foreground' : 'bg-border')} />
                          {!isLast && <div className="w-px flex-1 bg-border/60 my-1" />}
                        </div>
                        {/* Content */}
                        <div className={cn('min-w-0 pb-4', isLast && 'pb-0')}>
                          <p className="text-sm font-medium leading-tight">{label}</p>
                          {log.location && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{log.location}</p>
                          )}
                          {log.note && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{log.note}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {viDateTime.format(new Date(log.createdAt))}
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
                          <div className={cn('mt-1.5 size-2 shrink-0 rounded-full', i === 0 ? 'bg-foreground' : 'bg-border')} />
                          {!isLast && <div className="my-1 w-px flex-1 bg-border/60" />}
                        </div>
                        <div className={cn('min-w-0 pb-4', isLast && 'pb-0')}>
                          <p className="text-sm font-medium leading-tight">{summary.title}</p>
                          {summary.detail && (
                            <p className="mt-0.5 text-xs text-muted-foreground">{summary.detail}</p>
                          )}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {log.actorEmail ?? log.actorType} · {viDateTime.format(new Date(log.createdAt))}
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

          {/* Payment */}
          <section className="rounded-xl border bg-card p-5">
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">Thanh toán</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {paymentDescription}
                  </p>
                </div>
                {order.payment && (() => {
                  const ps = paymentStatusMap[order.payment.status] ?? { label: order.payment.status, tone: 'default' };
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
                {order.payment?.paidAt && (
                  <MoneyRow label="Thanh toán lúc" value={viDateTime.format(new Date(order.payment.paidAt))} />
                )}
                {!order.payment?.paidAt && (
                  <p className="text-sm text-muted-foreground">
                    Chưa ghi nhận thời điểm thanh toán.
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Customer */}
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
                  <div className="min-w-0 grid gap-1.5 text-sm">
                    <p className="font-medium truncate">{order.user.name}</p>
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

          {/* Shipping address */}
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

          {/* Shipment */}
          <section className="rounded-xl border bg-card p-5">
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">Vận chuyển</h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {shipmentQuery.isLoading ? 'Đang tải...' : shipmentProvider ?? 'Chưa tạo vận đơn'}
                  </p>
                </div>
                {shipStatusInfo && (
                  <Badge className={cn('h-6 shrink-0 rounded-md px-2 text-xs font-semibold shadow-sm', toneClass(shipStatusInfo.tone))}>
                    {shipStatusInfo.label}
                  </Badge>
                )}
              </div>

              {shipmentQuery.isLoading ? (
                <div className="grid gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : shipment ? (
                <div className="grid gap-2.5 text-sm">
                  {shipment.trackingCode && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-sm">Tracking</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1.5 rounded-lg px-2 font-mono text-xs"
                        onClick={() => copyTracking(shipment.trackingCode!)}
                      >
                        {shipment.trackingCode}
                        <ClipboardIcon className="size-3" />
                      </Button>
                    </div>
                  )}
                  {carrierShippingFee !== null && carrierShippingFee > 0 && (
                    <MoneyRow label="Phí hãng báo" value={vnd.format(carrierShippingFee)} />
                  )}
                  {shipment.estimatedAt && (
                    <MoneyRow label="Dự kiến giao" value={viDate.format(new Date(shipment.estimatedAt))} />
                  )}
                  {shipment.shippedAt && (
                    <MoneyRow label="Ngày giao vận" value={viDate.format(new Date(shipment.shippedAt))} />
                  )}
                  {shipment.deliveredAt && (
                    <MoneyRow label="Đã giao lúc" value={viDateTime.format(new Date(shipment.deliveredAt))} />
                  )}
                </div>
              ) : (
                <Button className="h-9 w-full rounded-lg">
                  <TruckIcon data-icon="inline-start" />
                  Tạo vận đơn
                </Button>
              )}
            </div>
          </section>
          </div>
        </aside>
      </section>
    </div>
  );
}
