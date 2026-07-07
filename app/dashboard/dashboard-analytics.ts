import {
  getAdminOrderFacets,
  getAdminOrders,
  type AdminOrderListItem,
  type AdminOrderStatus,
  type AdminPaymentMethod,
} from '@/lib/api/admin/orders';

export const ORDER_STATUS_LABELS: Record<AdminOrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  refunded: 'Đã hoàn tiền',
  expired: 'Hết hạn',
};

export const PAYMENT_METHOD_LABELS: Record<AdminPaymentMethod, string> = {
  cod: 'COD',
  vnpay: 'VNPay',
  momo: 'MoMo',
  sepay: 'SePay',
};

export interface DashboardBreakdown {
  name: string;
  value: number;
  revenue: number;
  percent: number;
  color: string;
}

export interface DashboardMonth {
  month: string;
  revenue: number;
  orders: number;
}

export interface DashboardAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  currentMonthOrders: number;
  currentMonthRevenue: number;
  deliveredOrders: number;
  pendingOrders: number;
  monthly: DashboardMonth[];
  statusBreakdown: DashboardBreakdown[];
  paymentBreakdown: DashboardBreakdown[];
  recentOrders: AdminOrderListItem[];
  fetchedOrders: number;
}

const REVENUE_STATUSES = new Set<AdminOrderStatus>([
  'confirmed',
  'processing',
  'shipped',
  'delivered',
]);

const STATUS_COLORS: Record<AdminOrderStatus, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
  refunded: '#64748b',
  expired: '#94a3b8',
};

const PAYMENT_COLORS: Record<AdminPaymentMethod, string> = {
  cod: '#2563eb',
  vnpay: '#10b981',
  momo: '#d946ef',
  sepay: '#f59e0b',
};

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [ordersPage, facets] = await Promise.all([
    getAdminOrders({
      page: 0,
      size: 500,
      sort: [{ field: 'createdAt', dir: 'desc' }],
    }),
    getAdminOrderFacets({}),
  ]);

  const orders = ordersPage.data;
  const revenueOrders = orders.filter((order) => REVENUE_STATUSES.has(order.status));
  const totalRevenue = sumRevenue(revenueOrders);
  const currentMonthKey = toMonthKey(new Date());
  const currentMonthOrders = revenueOrders.filter(
    (order) => toMonthKey(new Date(order.createdAt)) === currentMonthKey,
  );

  return {
    totalOrders: facets.total,
    totalRevenue,
    averageOrderValue: revenueOrders.length > 0 ? totalRevenue / revenueOrders.length : 0,
    currentMonthOrders: currentMonthOrders.length,
    currentMonthRevenue: sumRevenue(currentMonthOrders),
    deliveredOrders: orders.filter((order) => order.status === 'delivered').length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length,
    monthly: buildMonthlyData(revenueOrders),
    statusBreakdown: buildStatusBreakdown(orders),
    paymentBreakdown: buildPaymentBreakdown(revenueOrders),
    recentOrders: orders.slice(0, 5),
    fetchedOrders: orders.length,
  };
}

function buildMonthlyData(orders: AdminOrderListItem[]): DashboardMonth[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index), 1);
    return {
      key: toMonthKey(date),
      month: `T${date.getMonth() + 1}`,
      revenue: 0,
      orders: 0,
    };
  });

  const byMonth = new Map(months.map((month) => [month.key, month]));
  orders.forEach((order) => {
    const entry = byMonth.get(toMonthKey(new Date(order.createdAt)));
    if (!entry) return;
    entry.revenue += order.finalAmount;
    entry.orders += 1;
  });

  return months.map(({ month, revenue, orders }) => ({ month, revenue, orders }));
}

function buildStatusBreakdown(orders: AdminOrderListItem[]): DashboardBreakdown[] {
  const total = Math.max(orders.length, 1);
  const byStatus = new Map<AdminOrderStatus, { value: number; revenue: number }>();

  orders.forEach((order) => {
    const current = byStatus.get(order.status) ?? { value: 0, revenue: 0 };
    current.value += 1;
    current.revenue += REVENUE_STATUSES.has(order.status) ? order.finalAmount : 0;
    byStatus.set(order.status, current);
  });

  return Array.from(byStatus.entries())
    .map(([status, item]) => ({
      name: ORDER_STATUS_LABELS[status],
      value: item.value,
      revenue: item.revenue,
      percent: Math.round((item.value / total) * 100),
      color: STATUS_COLORS[status],
    }))
    .sort((a, b) => b.value - a.value);
}

function buildPaymentBreakdown(orders: AdminOrderListItem[]): DashboardBreakdown[] {
  const total = Math.max(orders.length, 1);
  const byPayment = new Map<AdminPaymentMethod, { value: number; revenue: number }>();

  orders.forEach((order) => {
    const current = byPayment.get(order.paymentMethod) ?? { value: 0, revenue: 0 };
    current.value += 1;
    current.revenue += order.finalAmount;
    byPayment.set(order.paymentMethod, current);
  });

  return Array.from(byPayment.entries())
    .map(([method, item]) => ({
      name: PAYMENT_METHOD_LABELS[method],
      value: item.value,
      revenue: item.revenue,
      percent: Math.round((item.value / total) * 100),
      color: PAYMENT_COLORS[method],
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

function sumRevenue(orders: AdminOrderListItem[]): number {
  return orders.reduce((sum, order) => sum + order.finalAmount, 0);
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}
