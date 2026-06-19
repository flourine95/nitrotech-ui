import {
  CheckCircle2Icon,
  PackageCheckIcon,
  ShoppingCartIcon,
  TruckIcon,
  type LucideIcon,
} from 'lucide-react';

import { statusChipClass } from '@/components/dashboard/status-chip';
import type { AdminOrderStatus, AdminPaymentMethod } from '@/lib/api/admin/orders';

export type OrderTone = 'default' | 'danger' | 'success' | 'warning';

export const orderStatusConfig: Record<
  AdminOrderStatus,
  {
    label: string;
    tone: OrderTone;
    progress: number;
    stateTitle: string;
    stateText: string;
    action: string;
    terminal?: boolean;
  }
> = {
  pending: {
    label: 'Chờ xác nhận',
    tone: 'warning',
    progress: 1,
    stateTitle: 'Đơn mới',
    stateText: 'Đơn đang chờ xác nhận trước khi chuyển sang xử lý kho.',
    action: 'Xem chi tiết',
  },
  confirmed: {
    label: 'Đã xác nhận',
    tone: 'success',
    progress: 1,
    stateTitle: 'Đã xác nhận',
    stateText: 'Đơn đã được xác nhận và sẵn sàng chuyển sang đóng gói.',
    action: 'Tạo vận đơn',
  },
  processing: {
    label: 'Đang xử lý',
    tone: 'default',
    progress: 2,
    stateTitle: 'Đang đóng gói',
    stateText: 'Kho đang lấy hàng, kiểm tra và chuẩn bị bàn giao vận chuyển.',
    action: 'Xem đóng gói',
  },
  shipped: {
    label: 'Đang giao',
    tone: 'default',
    progress: 3,
    stateTitle: 'Đơn đang giao',
    stateText: 'Đơn đã rời kho và đang theo dõi tiến trình vận chuyển.',
    action: 'Theo dõi giao hàng',
  },
  delivered: {
    label: 'Hoàn thành',
    tone: 'success',
    progress: 4,
    stateTitle: 'Đã giao thành công',
    stateText: 'Đơn đã hoàn tất và sẵn sàng đối soát chứng từ.',
    action: 'Mở chứng từ',
  },
  cancelled: {
    label: 'Đã hủy',
    tone: 'danger',
    progress: 0,
    stateTitle: 'Đơn hàng đã bị hủy',
    stateText: 'Đơn không còn trong luồng xử lý vận hành.',
    action: 'Xem lý do',
    terminal: true,
  },
  refunded: {
    label: 'Đã hoàn tiền',
    tone: 'warning',
    progress: 0,
    stateTitle: 'Đã hoàn tiền',
    stateText: 'Thanh toán đã được hoàn trả và đơn đã đóng.',
    action: 'Mở chứng từ',
    terminal: true,
  },
  expired: {
    label: 'Đã hết hạn',
    tone: 'danger',
    progress: 0,
    stateTitle: 'Đơn hết hạn',
    stateText: 'Đơn chưa được xác nhận trong thời hạn xử lý.',
    action: 'Xem chi tiết',
    terminal: true,
  },
};

export const paymentLabels: Record<AdminPaymentMethod | string, string> = {
  cod: 'COD',
  vnpay: 'VNPay',
  momo: 'MoMo',
  sepay: 'SePay',
};

export const paymentDescriptions: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'Cổng thanh toán VNPay',
  momo: 'Ví MoMo',
  sepay: 'Chuyển khoản SePay',
};

export const paymentStatusLabels: Record<string, { label: string; tone: OrderTone }> = {
  pending: { label: 'Chưa thanh toán', tone: 'warning' },
  paid: { label: 'Đã thanh toán', tone: 'success' },
  failed: { label: 'Thanh toán lỗi', tone: 'danger' },
};

export const shipmentProviderLabels: Record<string, string> = {
  ghtk: 'GHTK',
  ghn: 'GHN',
  viettel_post: 'Viettel Post',
  viettelpost: 'Viettel Post',
};

export const shipmentStatusLabels: Record<string, { label: string; tone: OrderTone }> = {
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

export const progressSteps: Array<{ label: string; icon: LucideIcon }> = [
  { label: 'Đặt hàng', icon: ShoppingCartIcon },
  { label: 'Đóng gói', icon: PackageCheckIcon },
  { label: 'Giao hàng', icon: TruckIcon },
  { label: 'Hoàn tất', icon: CheckCircle2Icon },
];

export function toneClass(tone: OrderTone) {
  return statusChipClass(tone);
}

export function toneBg(tone: string) {
  if (tone === 'danger') return 'bg-rose-500/8 border-rose-200 text-rose-800';
  if (tone === 'warning') return 'bg-amber-500/8 border-amber-200 text-amber-800';
  return 'bg-sky-500/8 border-sky-200 text-sky-800';
}
