'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeftIcon, PackageIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { OrderStatus } from '@/lib/api/orders';

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderDetail {
  id: number;
  code: string;
  status: OrderStatus;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    ward: string;
    district: string;
    city: string;
  };
  items: Array<{
    id: number;
    productName: string;
    variantName: string | null;
    quantity: number;
    price: number;
    thumbnail: string | null;
  }>;
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  note: string | null;
  paymentMethod: string;
  timeline: Array<{
    status: OrderStatus;
    label: string;
    time: string | null;
    done: boolean;
  }>;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ORDER: OrderDetail = {
  id: 1,
  code: '#ORD-2550',
  status: 'SHIPPING',
  createdAt: '2025-04-15T09:23:00Z',
  customer: {
    name: 'Nguyễn Văn An',
    email: 'nguyenvanan@gmail.com',
    phone: '0901 234 567',
  },
  shippingAddress: {
    street: '123 Nguyễn Huệ',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city: 'TP. Hồ Chí Minh',
  },
  items: [
    {
      id: 1,
      productName: 'MacBook Pro M4 14"',
      variantName: '16GB / 512GB / Space Black',
      quantity: 1,
      price: 42990000,
      thumbnail: null,
    },
    {
      id: 2,
      productName: 'Apple Magic Mouse',
      variantName: 'Space Gray',
      quantity: 1,
      price: 1990000,
      thumbnail: null,
    },
  ],
  subtotal: 44980000,
  shippingFee: 0,
  discount: 0,
  totalAmount: 44980000,
  note: 'Giao giờ hành chính, gọi trước 30 phút.',
  paymentMethod: 'Chuyển khoản ngân hàng',
  timeline: [
    { status: 'PENDING',   label: 'Chờ xác nhận', time: '2025-04-15T09:23:00Z', done: true },
    { status: 'CONFIRMED', label: 'Đã xác nhận',  time: '2025-04-15T10:05:00Z', done: true },
    { status: 'SHIPPING',  label: 'Đang giao',    time: '2025-04-16T08:30:00Z', done: true },
    { status: 'COMPLETED', label: 'Hoàn thành',   time: null,                   done: false },
  ],
};

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  PENDING:   { label: 'Chờ xác nhận', variant: 'secondary' },
  CONFIRMED: { label: 'Đã xác nhận',  variant: 'outline' },
  SHIPPING:  { label: 'Đang giao',    variant: 'default' },
  COMPLETED: { label: 'Hoàn thành',   variant: 'secondary' },
  CANCELLED: { label: 'Đã hủy',       variant: 'destructive' },
};

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPING',  'CANCELLED'],
  SHIPPING:  ['COMPLETED', 'CANCELLED'],
};

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

// ─── Timeline icon ────────────────────────────────────────────────────────────

function TimelineIcon({ status, done }: { status: OrderStatus; done: boolean }) {
  if (!done) return <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-border bg-background" />;
  const icons: Record<OrderStatus, React.ReactNode> = {
    PENDING:   <ClockIcon className="h-4 w-4" />,
    CONFIRMED: <CheckCircleIcon className="h-4 w-4" />,
    SHIPPING:  <TruckIcon className="h-4 w-4" />,
    COMPLETED: <CheckCircleIcon className="h-4 w-4" />,
    CANCELLED: <XCircleIcon className="h-4 w-4" />,
  };
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
      {icons[status]}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  // In production: fetch order by params.id
  // const { data: order } = useQuery({ queryKey: ['order', params.id], queryFn: () => getOrder(Number(params.id)) });
  const order = MOCK_ORDER;

  const cfg = statusConfig[order.status];
  const nextStatuses = NEXT_STATUSES[order.status] ?? [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
            <Link href="/dashboard/orders" aria-label="Quay lại">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <Link href="/dashboard/orders" className="hover:text-foreground">Đơn hàng</Link>
          <span>/</span>
          <span className="font-medium text-foreground">{order.code}</span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={cfg.variant}>{cfg.label}</Badge>
          {nextStatuses.length > 0 && (
            <Select>
              <SelectTrigger className="h-9 w-44">
                <SelectValue placeholder="Cập nhật trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {nextStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusConfig[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Body — 2 columns on large screens */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

        {/* Left column */}
        <div className="flex flex-col gap-6">

          {/* Items */}
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
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                          <PackageIcon className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.productName}</p>
                          {item.variantName && (
                            <p className="text-xs text-muted-foreground">{item.variantName}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">{item.quantity}</TableCell>
                    <TableCell className="text-right text-muted-foreground">{vnd.format(item.price)}</TableCell>
                    <TableCell className="text-right font-medium">{vnd.format(item.price * item.quantity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Totals */}
            <div className="border-t px-5 py-4">
              <div className="ml-auto max-w-xs space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span>{vnd.format(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span>{order.shippingFee === 0 ? 'Miễn phí' : vnd.format(order.shippingFee)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giảm giá</span>
                    <span className="text-destructive">-{vnd.format(order.discount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Tổng cộng</span>
                  <span>{vnd.format(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-md border bg-card px-5 py-4">
            <h2 className="mb-4 text-sm font-semibold">Lịch sử đơn hàng</h2>
            <div className="space-y-0">
              {order.timeline.map((step, i) => (
                <div key={step.status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <TimelineIcon status={step.status} done={step.done} />
                    {i < order.timeline.length - 1 && (
                      <div className={`mt-1 mb-1 w-0.5 flex-1 ${step.done ? 'bg-primary' : 'bg-border'}`} style={{ minHeight: 24 }} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.label}
                    </p>
                    {step.time && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(step.time).toLocaleString('vi-VN')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Order info */}
          <div className="rounded-md border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold">Thông tin đơn hàng</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Mã đơn</span>
                <span className="font-mono font-medium">{order.code}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Ngày đặt</span>
                <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Thanh toán</span>
                <span>{order.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="rounded-md border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold">Khách hàng</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-muted-foreground">{order.customer.email}</p>
              <p className="text-muted-foreground">{order.customer.phone}</p>
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-md border bg-card px-5 py-4">
            <h2 className="mb-3 text-sm font-semibold">Địa chỉ giao hàng</h2>
            <div className="space-y-0.5 text-sm text-muted-foreground">
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.ward}, {order.shippingAddress.district}</p>
              <p>{order.shippingAddress.city}</p>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="rounded-md border bg-card px-5 py-4">
              <h2 className="mb-2 text-sm font-semibold">Ghi chú</h2>
              <p className="text-sm text-muted-foreground">{order.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
