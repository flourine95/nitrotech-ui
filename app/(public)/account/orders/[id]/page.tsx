import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/server';
import { CancelOrderButton } from './cancel-order-button';

export const metadata: Metadata = { title: 'Chi tiết đơn hàng' };

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface ApiOrderItem {
  id: number;
  variantId: number;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface ApiOrder {
  id: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingAddress: {
    receiver: string;
    phone: string;
    province: string;
    provinceCode?: string;
    district: string;
    districtCode?: string;
    ward: string;
    wardCode?: string;
    street: string;
  };
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  promotionCode: string | null;
  note: string | null;
  items: ApiOrderItem[];
  createdAt: string;
  updatedAt: string;
}

const statusMap: Record<OrderStatus, { label: string; color: string; dot: string }> = {
  pending: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  confirmed: { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
  shipped: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-400' },
  delivered: { label: 'Đã giao', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  cancelled: { label: 'Đã hủy', color: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' },
};

const paymentMethodLabel: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'VNPay',
  momo: 'MoMo',
  sepay: 'Chuyển khoản VietQR qua SePay',
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  const status = statusMap[order.status] ?? statusMap.pending;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Link
              href="/account/orders"
              className="cursor-pointer text-slate-400 transition-colors duration-150 hover:text-slate-700"
              aria-label="Quay lại danh sách đơn hàng"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Đơn hàng #{order.id}</h1>
          </div>
          <p className="text-sm text-slate-400">Đặt ngày {formatDateTime(order.createdAt)}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium ${status.color}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} aria-hidden="true" />
          {status.label}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-slate-900">Sản phẩm đã đặt</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 px-6 py-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                    <svg
                      viewBox="0 0 40 30"
                      className="h-auto w-10 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="2" y="2" width="36" height="26" rx="2" />
                      <rect x="5" y="5" width="30" height="20" rx="1" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">SKU: {item.sku}</div>
                    <div className="mt-0.5 text-xs text-slate-400">Số lượng: {item.quantity}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {formatCurrency(item.unitPrice)} / sản phẩm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-900">Trạng thái đơn hàng</h2>
            <ol className="relative">
              {buildTimeline(order).map((step, i, steps) => (
                <li key={step.label} className={`flex gap-4 ${i < steps.length - 1 ? 'pb-5' : ''}`}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        step.done ? 'bg-green-500' : 'bg-slate-200'
                      }`}
                    >
                      {step.done && (
                        <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current text-white">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    {i < steps.length - 1 && (
                      <div
                        className={`mt-1 w-px flex-1 ${step.done ? 'bg-green-300' : 'bg-slate-200'}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="pb-1">
                    <div
                      className={`text-sm font-medium ${
                        step.done ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">{step.time}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Thanh toán</h2>
            <div className="space-y-2.5 text-sm">
              <SummaryRow label="Tạm tính" value={formatCurrency(order.totalAmount)} />
              <SummaryRow
                label="Vận chuyển"
                value={order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                valueClassName={order.shippingFee === 0 ? 'text-green-600' : undefined}
              />
              {order.discountAmount > 0 && (
                <SummaryRow
                  label="Giảm giá"
                  value={`-${formatCurrency(order.discountAmount)}`}
                  valueClassName="text-rose-600"
                />
              )}
              <div className="flex justify-between border-t border-slate-100 pt-2.5">
                <span className="font-bold text-slate-900">Tổng cộng</span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(order.finalAmount)}
                </span>
              </div>
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">
              Thanh toán: {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}
            </div>
            {order.paymentMethod === 'sepay' && (
              <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm">
                <span className="text-slate-500">Nội dung chuyển khoản: </span>
                <span className="font-semibold text-slate-950">
                  NT{String(order.id).padStart(6, '0')}
                </span>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Địa chỉ giao hàng</h2>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">{order.shippingAddress.receiver}</div>
              <div>{order.shippingAddress.phone}</div>
              <div>{order.shippingAddress.street}</div>
              <div>
                {[
                  order.shippingAddress.ward,
                  order.shippingAddress.district,
                  order.shippingAddress.province,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </div>
            </div>
          </div>

          {order.note && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-900">Ghi chú</h2>
              <p className="text-sm leading-6 text-slate-600">{order.note}</p>
            </div>
          )}

          {order.status === 'pending' && <CancelOrderButton orderId={order.id} />}
        </div>
      </div>
    </div>
  );
}

async function getOrder(id: string): Promise<ApiOrder> {
  const cookieStore = await cookies();
  const res = await backendFetch(`/api/orders/${id}`, { cookieHeader: cookieStore.toString() });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error('Không thể tải đơn hàng');

  const body = (await res.json()) as { data: ApiOrder };
  return body.data;
}

function SummaryRow({
  label,
  value,
  valueClassName = 'text-slate-900',
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

function buildTimeline(order: ApiOrder) {
  const created = formatDateTime(order.createdAt);
  return [
    { label: 'Đặt hàng thành công', time: created, done: true },
    {
      label: order.paymentMethod === 'sepay' ? 'Đã xác nhận thanh toán' : 'Đã xác nhận đơn hàng',
      time: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status)
        ? formatDateTime(order.updatedAt)
        : 'Đang chờ',
      done: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status),
    },
    {
      label: 'Đang xử lý',
      time: order.status === 'processing' ? formatDateTime(order.updatedAt) : 'Chưa bắt đầu',
      done: ['processing', 'shipped', 'delivered'].includes(order.status),
    },
    {
      label: 'Đang giao hàng',
      time: order.status === 'shipped' ? formatDateTime(order.updatedAt) : 'Chưa bắt đầu',
      done: ['shipped', 'delivered'].includes(order.status),
    },
    {
      label: order.status === 'cancelled' ? 'Đã hủy' : 'Giao hàng thành công',
      time: ['cancelled', 'delivered'].includes(order.status)
        ? formatDateTime(order.updatedAt)
        : 'Chưa bắt đầu',
      done: ['cancelled', 'delivered'].includes(order.status),
    },
  ];
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

function parseApiDate(value: string) {
  const normalized = value.replace(/(\.\d{3})\d+/, '$1');
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(normalized);
  return new Date(hasTimezone ? normalized : `${normalized}Z`);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parseApiDate(value));
}
