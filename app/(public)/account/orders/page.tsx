import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/server';

export const metadata: Metadata = { title: 'Đơn hàng của tôi' };

interface OrderListItem {
  id: number;
  orderCode: string | null;
  status: string;
  paymentMethod: string;
  finalAmount: number;
  itemCount: number;
  createdAt: string;
}

interface OrdersResponse {
  data: OrderListItem[];
}

const statusMap: Record<string, { label: string; color: string; dot: string }> = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-amber-100 text-amber-700',
    dot: 'bg-amber-400',
  },
  confirmed: {
    label: 'Đã xác nhận',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
  shipped: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-700',
    dot: 'bg-purple-400',
  },
  delivered: {
    label: 'Đã nhận',
    color: 'bg-green-100 text-green-700',
    dot: 'bg-green-400',
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-slate-100 text-slate-500',
    dot: 'bg-slate-400',
  },
};

const tabs = ['Tất cả', 'Đang giao', 'Đã nhận', 'Đã hủy'];

const paymentMethodLabel: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  momo: 'MoMo',
  sepay: 'Chuyển khoản VietQR qua SePay',
  vnpay: 'VNPay',
};

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Đơn hàng của tôi</h1>
        <span className="text-sm text-slate-400">{orders.length} đơn hàng</span>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-full bg-slate-100 p-1">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-200 ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center text-sm text-slate-500 shadow-sm">
            Bạn chưa có đơn hàng nào.
          </div>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-slate-900">
                  {order.orderCode ?? `#${order.id}`}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusMap[order.status]?.color ?? statusMap.pending.color}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusMap[order.status]?.dot ?? statusMap.pending.dot}`}
                    aria-hidden="true"
                  />
                  {statusMap[order.status]?.label ?? order.status}
                </span>
              </div>
              <div className="text-xs text-slate-400">{formatDate(order.createdAt)}</div>
            </div>

            {/* Items */}
            <div className="px-6 py-4">
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">
                      {order.itemCount} sản phẩm
                    </div>
                    <div className="text-xs text-slate-400">Bấm chi tiết để xem sản phẩm và đánh giá</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <div className="text-xs text-slate-400">
                  Thanh toán:{' '}
                  <span className="font-medium text-slate-600">
                    {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Tổng tiền</div>
                    <div className="text-base font-bold text-slate-900">
                      {formatCurrency(order.finalAmount)}
                    </div>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                  >
                    Chi tiết
                  </Link>
                  {order.status === 'delivered' && (
                    <button className="cursor-pointer rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-slate-700">
                      Mua lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function getOrders() {
  const cookieStore = await cookies();
  const res = await backendFetch('/api/orders?size=10', { cookieHeader: cookieStore.toString() });

  if (!res.ok) return [];

  const body = (await res.json()) as OrdersResponse;
  return body.data;
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short' }).format(new Date(value));
}
