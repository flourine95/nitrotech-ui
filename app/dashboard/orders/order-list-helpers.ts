import type { AdminOrderListItem } from '@/lib/api/admin/orders';
import { downloadCSV, escapeCsv, formatViDate } from '@/lib/utils/formatting';
import { formatDateKey, parseLocalDate } from './date-range-picker';
import { orderStatusConfig, paymentLabels, paymentStatusLabels, shipmentStatusLabels } from './order-display';

export const PAGE_SIZES = [5, 10, 20, 50];
export const AMOUNT_MIN_MILLION = 0;
export const AMOUNT_MAX_MILLION = 100;
export const AMOUNT_MIN_VALUE = AMOUNT_MIN_MILLION * 1_000_000;
export const AMOUNT_MAX_VALUE = AMOUNT_MAX_MILLION * 1_000_000;
export const ALL = 'all';

export const slaStatusLabels: Record<'warning' | 'critical', { label: string; tone: 'warning' | 'danger' }> = {
  warning: { label: 'Sắp quá hạn', tone: 'warning' },
  critical: { label: 'Quá hạn xử lý', tone: 'danger' },
};

export const sortFields = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'finalAmount', label: 'Tổng tiền' },
  { value: 'id', label: 'Mã đơn hàng' },
  { value: 'status', label: 'Trạng thái đơn' },
  { value: 'paymentMethod', label: 'Thanh toán' },
  { value: 'updatedAt', label: 'Cập nhật gần nhất' },
];

export function localDateStartIso(value: string) {
  const date = parseLocalDate(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function localDateEndExclusiveIso(value: string) {
  const date = parseLocalDate(value);
  if (Number.isNaN(date.getTime())) return undefined;
  date.setDate(date.getDate() + 1);
  return date.toISOString();
}

export function toMillion(value: number) {
  return Math.round(value / 1_000_000);
}

export function dateRangeFromParams(dateFrom: string, dateTo: string) {
  if (!dateFrom) return undefined;
  const from = parseLocalDate(dateFrom);
  if (Number.isNaN(from.getTime())) return undefined;
  const to = dateTo ? parseLocalDate(dateTo) : undefined;
  return { from, to: to && !Number.isNaN(to.getTime()) ? to : undefined };
}

export function formatDateRangeParams(range: { from?: Date; to?: Date } | undefined) {
  return {
    from: range?.from && !Number.isNaN(range.from.getTime()) ? formatDateKey(range.from) : '',
    to: range?.to && !Number.isNaN(range.to.getTime()) ? formatDateKey(range.to) : '',
  };
}

export function exportOrdersPage(orders: AdminOrderListItem[], currentPage: number) {
  if (!orders.length) return;

  const header = [
    'Mã đơn',
    'Người nhận',
    'Số điện thoại',
    'Email',
    'Trạng thái',
    'Thanh toán',
    'Trạng thái thanh toán',
    'Trạng thái vận chuyển',
    'Mã vận đơn',
    'Tổng tiền',
    'Số sản phẩm',
    'Ngày đặt',
    'Cập nhật',
  ];
  const rows = orders.map((order) => [
    order.orderCode,
    order.receiver ?? '',
    order.phone ?? '',
    order.email ?? '',
    orderStatusConfig[order.status].label,
    paymentLabels[order.paymentMethod] ?? order.paymentMethod,
    order.paymentStatus ? (paymentStatusLabels[order.paymentStatus]?.label ?? order.paymentStatus) : '',
    order.shipmentStatus ? (shipmentStatusLabels[order.shipmentStatus]?.label ?? order.shipmentStatus) : '',
    order.trackingCode ?? '',
    order.finalAmount,
    order.itemCount,
    formatViDate(order.createdAt),
    formatViDate(order.updatedAt),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
    .join('\n');

  downloadCSV(csv, `orders-page-${currentPage + 1}.csv`);
}
