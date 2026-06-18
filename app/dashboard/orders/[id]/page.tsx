'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardIcon,
  FileTextIcon,
  MailIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  PhoneIcon,
  StoreIcon,
  TruckIcon,
  UserRoundIcon,
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const viDate = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

const pipelineSteps = [
  { label: 'Báo giá', icon: FileTextIcon },
  { label: 'Đóng gói', icon: PackageIcon },
  { label: 'Giao hàng', icon: TruckIcon },
  { label: 'Hoàn tất', icon: CheckCircle2Icon },
];

const mockOrders = [
  {
    id: '652',
    code: 'SO-652',
    invoice: 'INV-00652',
    title: 'Đơn bán hàng SO-652',
    status: 'Một phần',
    statusTone: 'warning',
    stageTitle: 'Sản phẩm đang đóng gói',
    stageText: 'Kho đang kiểm hàng, dán tem QA và chuẩn bị bàn giao cho GHTK.',
    progress: 2,
    source: 'Đại lý',
    orderDate: '2026-03-24',
    dueDate: '2026-04-10',
    assignTo: 'Huy Phạm',
    assignInitials: 'HP',
    paymentTerm: 'Thanh toán khi nhận hàng',
    location: 'Đà Nẵng',
    paymentMethod: 'COD',
    receivedAmount: 4800000,
    shippingFee: 35000,
    discount: 300000,
    tax: 0,
    customer: {
      name: 'Lê Hoàng Nam',
      type: 'Đại lý',
      phone: '+84 912 555 014',
      email: 'nam.le@daily-nitro.vn',
      avatar: 'https://i.pravatar.cc/120?u=le-hoang-nam',
    },
    address: {
      receiver: 'Lê Hoàng Nam',
      phone: '+84 912 555 014',
      street: '28 Nguyễn Văn Linh',
      ward: 'Phường Bình Hiên',
      district: 'Quận Hải Châu',
      province: 'Đà Nẵng',
    },
    shipment: {
      provider: 'GHTK',
      trackingCode: 'GHTK652926',
      status: 'Chờ lấy hàng',
      estimatedAt: '2026-03-29',
      fee: 35000,
    },
    items: [
      {
        id: 1,
        name: 'Cloud Silk Toner / Army / XL',
        sku: 'SKU-TONER-7723',
        quantity: 1,
        unitPrice: 4800000,
        tax: '0%',
        image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=160&auto=format&fit=crop',
      },
      {
        id: 2,
        name: 'Barrier Repair Drops / Core / M',
        sku: 'SKU-TREAT-6612',
        quantity: 2,
        unitPrice: 3750000,
        tax: '0%',
        image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=160&auto=format&fit=crop',
      },
    ],
    notes: [
      {
        author: 'Huy Phạm',
        initials: 'HP',
        time: '17 giờ trước',
        text: 'Khách yêu cầu giữ nguyên hóa đơn và gọi xác nhận trước khi đơn vị vận chuyển đến lấy hàng.',
      },
      {
        author: 'Linh Đỗ',
        initials: 'LĐ',
        time: '2 ngày trước',
        text: 'Địa chỉ giao hàng đã đối chiếu với thông tin đại lý. Kho đã giữ đủ số lượng cho đơn này.',
      },
    ],
  },
  {
    id: '654',
    code: 'SO-654',
    invoice: 'INV-00654',
    title: 'Đơn bán hàng SO-654',
    status: 'Chưa trả',
    statusTone: 'danger',
    stageTitle: 'Báo giá mới',
    stageText: 'Báo giá mới đang chờ duyệt trước khi chuyển sang đóng gói.',
    progress: 1,
    source: 'Website',
    orderDate: '2026-03-28',
    dueDate: '2026-04-10',
    assignTo: 'Huy Phạm',
    assignInitials: 'HP',
    paymentTerm: 'Thanh toán ngay',
    location: 'TP. Hồ Chí Minh',
    paymentMethod: 'VNPay',
    receivedAmount: 0,
    shippingFee: 0,
    discount: 0,
    tax: 0,
    customer: {
      name: 'Nguyễn Minh Anh',
      type: 'Website',
      phone: '+84 903 555 018',
      email: 'minhanh@example.com',
      avatar: 'https://i.pravatar.cc/120?u=nguyen-minh-anh',
    },
    address: {
      receiver: 'Nguyễn Minh Anh',
      phone: '+84 903 555 018',
      street: '102 Lê Lợi',
      ward: 'Phường Bến Thành',
      district: 'Quận 1',
      province: 'TP. Hồ Chí Minh',
    },
    shipment: null,
    items: [
      {
        id: 1,
        name: 'Radiance Ritual Set / Ocean Blue / S',
        sku: 'SKU-SKIN-4006',
        quantity: 1,
        unitPrice: 5250000,
        tax: '0%',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=160&auto=format&fit=crop',
      },
    ],
    notes: [
      {
        author: 'Huy Phạm',
        initials: 'HP',
        time: '3 giờ trước',
        text: 'Chờ khách xác nhận phương thức thanh toán trước khi tạo vận đơn.',
      },
    ],
  },
];

function toneClass(tone: string) {
  if (tone === 'success') return 'border-transparent bg-emerald-500/12 text-emerald-700 hover:bg-emerald-500/12';
  if (tone === 'warning') return 'border-transparent bg-amber-500/12 text-amber-700 hover:bg-amber-500/12';
  if (tone === 'danger') return 'border-transparent bg-rose-500/12 text-rose-700 hover:bg-rose-500/12';
  return 'border-transparent bg-muted text-foreground hover:bg-muted';
}

function statusLabel(progress: number) {
  return pipelineSteps[Math.max(0, Math.min(progress - 1, pipelineSteps.length - 1))]?.label ?? 'Báo giá';
}

function InfoBlock({
  label,
  children,
  icon: Icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-sm font-medium">
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
        {children}
      </div>
    </div>
  );
}

function MoneyRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 text-sm', strong && 'text-lg font-semibold')}>
      <span className={cn(!strong && 'text-muted-foreground')}>{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Pipeline({ progress }: { progress: number }) {
  return (
    <div className="grid gap-3">
      <div className="hidden grid-cols-[auto_minmax(48px,1fr)_auto_minmax(48px,1fr)_auto_minmax(48px,1fr)_auto] items-center gap-x-4 md:grid">
        {pipelineSteps.map((step, index) => {
          const active = index < progress;
          const complete = index < progress - 1;
          const Icon = step.icon;
          return (
            <div key={step.label} className="contents">
              <div
                className={cn(
                  'flex size-7 items-center justify-center rounded-md border bg-background',
                  active ? 'border-foreground text-foreground' : 'border-border text-muted-foreground',
                )}
              >
                <Icon className="size-3.5" />
              </div>
              {index < pipelineSteps.length - 1 ? (
                <div className="h-1 rounded-full bg-border/70">
                  <div className={cn('h-full rounded-full', complete && 'bg-foreground')} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="hidden grid-cols-[auto_minmax(48px,1fr)_auto_minmax(48px,1fr)_auto_minmax(48px,1fr)_auto] gap-x-4 text-[11px] font-medium text-muted-foreground md:grid">
        {pipelineSteps.map((step, index) => (
          <div key={step.label} className="contents">
            <span>{step.label}</span>
            {index < pipelineSteps.length - 1 ? <span aria-hidden="true" /> : null}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {pipelineSteps.map((step, index) => {
          const active = index < progress;
          const complete = index < progress - 1;
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-md border bg-background',
                    active ? 'border-foreground text-foreground' : 'border-border text-muted-foreground',
                  )}
                >
                  <Icon className="size-2.5" />
                </div>
                {index < pipelineSteps.length - 1 ? (
                  <div className="h-1 min-w-0 flex-1 rounded-full bg-border/70">
                    <div className={cn('h-full rounded-full', complete && 'bg-foreground')} />
                  </div>
                ) : null}
              </div>
              <span className="truncate text-center text-[11px] leading-none text-muted-foreground">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const order = mockOrders.find((item) => item.id === params.id || item.code.toLowerCase() === params.id?.toLowerCase()) ?? mockOrders[0];
  const subtotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal + order.shippingFee + order.tax - order.discount;
  const remaining = Math.max(total - order.receivedAmount, 0);

  async function copyTracking(text: string) {
    await navigator.clipboard.writeText(text);
    toast.success('Đã copy mã vận đơn');
  }

  return (
    <div className="flex h-[calc(100dvh-6.5rem)] w-full max-w-none flex-col gap-4 overflow-hidden">
      <section className="shrink-0 border-b border-dashed border-border/70 pb-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button variant="outline" size="icon" className="size-9 shrink-0 rounded-xl shadow-none" asChild>
              <Link href="/dashboard/orders" aria-label="Quay lại danh sách đơn hàng">
                <ArrowLeftIcon />
              </Link>
            </Button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight 2xl:text-2xl">Mã đơn: {order.code}</h1>
                <Badge className={cn('h-6 rounded-md px-2 font-semibold shadow-sm', toneClass(order.statusTone))}>
                  {order.status}
                </Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Chi tiết đơn bán hàng với tiến trình xử lý, thanh toán, khách hàng và vận chuyển trong một màn hình.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" className="h-9 rounded-xl shadow-none">
              {statusLabel(order.progress)}
            </Button>
            <Button variant="outline" size="icon" className="size-9 rounded-xl shadow-none" disabled aria-label="Đơn trước">
              <ChevronLeftIcon />
            </Button>
            <Button variant="outline" size="icon" className="size-9 rounded-xl shadow-none" aria-label="Đơn sau">
              <ChevronRightIcon />
            </Button>
            <Button className="h-9 rounded-xl">
              <PencilIcon data-icon="inline-start" />
              Cập nhật
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-9 rounded-xl shadow-none" aria-label="Mở tùy chọn đơn hàng">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6} className="w-48">
                <DropdownMenuGroup>
                  <DropdownMenuItem>In phiếu đóng gói</DropdownMenuItem>
                  <DropdownMenuItem>Xuất hóa đơn</DropdownMenuItem>
                  <DropdownMenuItem>Hủy đơn hàng</DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto pr-1">
          <div className="rounded-xl border bg-muted/20 p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold">{order.stageTitle}</p>
              <p className="text-sm text-muted-foreground">{order.stageText}</p>
            </div>
            <Pipeline progress={order.progress} />
          </div>

          <section className="rounded-xl border bg-card p-5">
            <div className="grid gap-6">
              <div>
                <h2 className="text-lg font-semibold">Thông tin đơn hàng</h2>
                <p className="mt-1 text-sm text-muted-foreground">Phân công xử lý, nguồn đơn và điều kiện thanh toán.</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                <InfoBlock label="Nguồn" icon={StoreIcon}>{order.source}</InfoBlock>
                <InfoBlock label="Ngày đặt">{viDate.format(new Date(order.orderDate))}</InfoBlock>
                <InfoBlock label="Hạn xử lý">{viDate.format(new Date(order.dueDate))}</InfoBlock>
                <InfoBlock label="Phụ trách" icon={UserRoundIcon}>
                  <Avatar className="size-6">
                    <AvatarFallback>{order.assignInitials}</AvatarFallback>
                  </Avatar>
                  <span>{order.assignTo}</span>
                </InfoBlock>
                <InfoBlock label="Điều kiện thanh toán">{order.paymentTerm}</InfoBlock>
                <InfoBlock label="Khu vực">{order.location}</InfoBlock>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <div className="grid gap-6">
              <div>
                <h2 className="text-lg font-semibold">Sản phẩm đã đặt</h2>
                <p className="mt-1 text-sm text-muted-foreground">Line-item và tổng tiền cho đơn bán hàng hiện tại.</p>
              </div>
              <div className="grid gap-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-4 border-b border-dashed border-border/70 pb-4 last:border-b-0 last:pb-0 lg:grid-cols-[minmax(0,1.8fr)_72px_110px_80px_130px] lg:items-start"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border bg-muted/30">
                        <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.sku}</p>
                      </div>
                    </div>
                    <InfoBlock label="SL">{item.quantity} cái</InfoBlock>
                    <InfoBlock label="Đơn giá">{vnd.format(item.unitPrice)}</InfoBlock>
                    <InfoBlock label="Thuế">{item.tax}</InfoBlock>
                    <InfoBlock label="Thành tiền">{vnd.format(item.unitPrice * item.quantity)}</InfoBlock>
                  </div>
                ))}
              </div>
              <div className="ml-auto grid w-full max-w-sm gap-3">
                <MoneyRow label="Tạm tính" value={vnd.format(subtotal)} />
                <MoneyRow label="Phí vận chuyển" value={order.shippingFee === 0 ? 'Miễn phí' : vnd.format(order.shippingFee)} />
                <MoneyRow label="Giảm giá" value={order.discount > 0 ? `-${vnd.format(order.discount)}` : '-'} />
                <Separator />
                <MoneyRow label="Tổng cộng" value={vnd.format(total)} strong />
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-5">
            <div className="grid gap-4">
              <div>
                <h2 className="text-lg font-semibold">Ghi chú nội bộ</h2>
                <p className="mt-1 text-sm text-muted-foreground">Bối cảnh phối hợp giữa kho, CSKH và vận hành.</p>
              </div>
              <Textarea className="min-h-24 resize-none rounded-xl" placeholder="Thêm ghi chú cho đơn hàng" />
              <div className="rounded-xl border bg-muted/10">
                {order.notes.map((note, index) => (
                  <div key={`${note.author}-${note.time}`} className={cn('px-5 py-4', index < order.notes.length - 1 && 'border-b')}>
                    <div className="flex items-start gap-3">
                      <Avatar className="size-10">
                        <AvatarFallback>{note.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <p className="font-medium">{note.author}</p>
                          <p className="text-sm text-muted-foreground">{note.time}</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{note.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <aside className="flex min-h-0 min-w-0 flex-col gap-4 overflow-y-auto rounded-xl border bg-muted/30 p-4 xl:self-start">
          <section className="rounded-xl border bg-background p-5">
            <div className="grid gap-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Thanh toán</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Hóa đơn #{order.invoice}</p>
                </div>
                <Button variant="link" className="h-auto p-0 text-muted-foreground">Xem hóa đơn</Button>
              </div>
              <Separator />
              <div className="grid gap-3">
                <MoneyRow label="Đã nhận" value={vnd.format(order.receivedAmount)} />
                <MoneyRow label="Còn lại" value={vnd.format(remaining)} />
                <MoneyRow label="Tổng thanh toán" value={vnd.format(total)} />
              </div>
              <Button variant="outline" className="h-10 rounded-lg shadow-none">Ghi nhận thanh toán</Button>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-5">
            <div className="grid gap-5">
              <h2 className="text-lg font-semibold">Khách hàng</h2>
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                  <AvatarFallback>{order.customer.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.type}</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <PhoneIcon className="mt-0.5 size-4 text-muted-foreground" />
                  <span>{order.customer.phone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MailIcon className="mt-0.5 size-4 text-muted-foreground" />
                  <span className="min-w-0 break-all">{order.customer.email}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-5">
            <div className="grid gap-4">
              <h2 className="text-lg font-semibold">Địa chỉ giao hàng</h2>
              <div className="grid gap-1 text-sm leading-6 text-muted-foreground">
                <span className="font-medium text-foreground">{order.address.receiver}</span>
                <span>{order.address.phone}</span>
                <span>{order.address.street}</span>
                <span>{order.address.ward}, {order.address.district}</span>
                <span>{order.address.province}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-background p-5">
            <div className="grid gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Vận chuyển</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{order.shipment ? order.shipment.provider : 'Chưa tạo vận đơn'}</p>
                </div>
                {order.shipment ? (
                  <Badge className="border-transparent bg-sky-500/12 text-sky-700 shadow-sm hover:bg-sky-500/12">
                    {order.shipment.status}
                  </Badge>
                ) : null}
              </div>
              {order.shipment ? (
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Tracking</span>
                    <Button variant="ghost" size="sm" onClick={() => copyTracking(order.shipment!.trackingCode)}>
                      <span className="font-mono">{order.shipment.trackingCode}</span>
                      <ClipboardIcon data-icon="inline-end" />
                    </Button>
                  </div>
                  <MoneyRow label="Phí vận chuyển" value={vnd.format(order.shipment.fee)} />
                  <MoneyRow label="Dự kiến giao" value={viDate.format(new Date(order.shipment.estimatedAt))} />
                </div>
              ) : (
                <Button className="h-10 rounded-lg">
                  <TruckIcon data-icon="inline-start" />
                  Tạo vận đơn
                </Button>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
