import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/server';
import type { OrderListItem, OrderListResponse } from '@/types/order';

export const metadata: Metadata = { title: 'Đơn hàng của tôi' };

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
    color: 'bg-cyan-100 text-cyan-700',
    dot: 'bg-cyan-400',
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
  expired: {
    label: 'Hết hạn',
    color: 'bg-orange-100 text-orange-700',
    dot: 'bg-orange-400',
  },
  refunded: {
    label: 'Đã hoàn tiền',
    color: 'bg-rose-100 text-rose-700',
    dot: 'bg-rose-400',
  },
};

const paymentMethodMap: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'VNPay',
  momo: 'MoMo',
  sepay: 'Chuyển khoản VietQR qua SePay',
};

export default async function OrdersPage() {
  const { orders, total } = await getOrders();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Đơn hàng của tôi</h1>
        <span className="text-sm text-slate-400">{total} đơn hàng</span>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Chưa có đơn hàng nào</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Khi bạn hoàn tất mua sắm, đơn hàng sẽ xuất hiện tại đây để tiện theo dõi trạng thái.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusMap[order.status] ?? statusMap.pending;
            const orderCode = order.orderCode || order.orderNumber || `#${order.id}`;
            const itemLines = buildItemLines(order);

            return (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-slate-900">{orderCode}</span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${status.dot}`}
                        aria-hidden="true"
                      />
                      {status.label}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">{formatDateTime(order.createdAt)}</div>
                </div>

                <div className="px-6 py-4">
                  <div className="mb-4 space-y-2">
                    {itemLines.map((item, index) => (
                      <div key={`${order.id}-${index}`} className="flex items-center gap-3">
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
                            {item.name}
                          </div>
                          <div className="text-xs text-slate-400">Số lượng: {item.qty}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="space-y-1 text-xs text-slate-400">
                      <div>
                        Thanh toán:{' '}
                        <span className="font-medium text-slate-600">
                          {paymentMethodMap[order.paymentMethod] ?? order.paymentMethod}
                        </span>
                      </div>
                      {order.receiver && <div>Người nhận: {order.receiver}</div>}
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

async function getOrders() {
  const cookieStore = await cookies();
  const res = await backendFetch('/api/orders', {
    cookieHeader: cookieStore.toString(),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Không thể tải danh sách đơn hàng');
  }

  const body = (await res.json()) as OrderListResponse;
  return {
    orders: body.data ?? [],
    total: body.pagination?.total ?? body.data?.length ?? 0,
  };
}

function buildItemLines(order: OrderListItem) {
  if (order.items && order.items.length > 0) {
    return order.items.map((item, index) => ({
      name: item.name?.trim() || `Sản phẩm ${index + 1}`,
      qty: item.quantity ?? 1,
    }));
  }

  return [
    {
      name:
        order.itemCount && order.itemCount > 1
          ? `${order.itemCount} sản phẩm trong đơn hàng`
          : '1 sản phẩm trong đơn hàng',
      qty: order.itemCount && order.itemCount > 0 ? order.itemCount : 1,
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
