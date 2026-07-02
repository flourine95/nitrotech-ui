'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getOrder, verifyVnpayReturn } from '@/lib/api/orders';
import type { Order } from '@/types/order';

type PaymentViewState =
  | 'verifying'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'failed'
  | 'error';

type VnpayReturnContentProps = {
  initialParams: Record<string, string>;
};

const SUCCESS_RESPONSE_CODE = '00';
const CANCELLED_RESPONSE_CODE = '24';
const SUCCESS_TRANSACTION_STATUS = '00';

export default function VnpayReturnContent({ initialParams }: VnpayReturnContentProps) {
  const router = useRouter();
  const [state, setState] = useState<PaymentViewState>('verifying');
  const [message, setMessage] = useState('Đang xác nhận kết quả thanh toán với VNPay...');
  const [order, setOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const query = useMemo(() => new URLSearchParams(initialParams), [initialParams]);
  const responseCode = initialParams.vnp_ResponseCode ?? '';
  const transactionStatus = initialParams.vnp_TransactionStatus ?? '';
  const txnRef = initialParams.vnp_TxnRef ?? '';
  const transactionNo = initialParams.vnp_TransactionNo ?? '';
  const orderId = parseOrderId(txnRef);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!txnRef) {
        if (!cancelled) {
          setState('error');
          setMessage('Thiếu mã đơn hàng từ VNPay. Vui lòng quay lại trang đơn hàng để kiểm tra.');
        }
        return;
      }

      const isSuccess =
        responseCode === SUCCESS_RESPONSE_CODE &&
        transactionStatus === SUCCESS_TRANSACTION_STATUS;

      if (!isSuccess) {
        if (!cancelled) {
          const cancelledByUser = responseCode === CANCELLED_RESPONSE_CODE;
          setState(cancelledByUser ? 'cancelled' : 'failed');
          setMessage(
            cancelledByUser
              ? 'Bạn đã hủy thanh toán trên VNPay. Đơn hàng chưa được thanh toán.'
              : resolveFailureMessage(responseCode, transactionStatus),
          );
        }
        return;
      }

      if (!cancelled) {
        setState('verifying');
        setMessage('Thanh toán đã quay về từ VNPay. Hệ thống đang xác nhận giao dịch...');
      }

      try {
        const verification = await verifyVnpayReturn(query);
        if (cancelled) return;

        const latestOrder = await refreshOrder(orderId);
        if (cancelled) return;

        if (latestOrder) {
          setOrder(latestOrder);
          if (latestOrder.status === 'confirmed') {
            setState('confirmed');
            setMessage('Thanh toán thành công và đơn hàng đã được xác nhận.');
            return;
          }
        }

        setState('pending');
        setMessage(
          verification.message ||
            'Thanh toán đã được ghi nhận. Đơn hàng đang chờ hệ thống xác nhận hoàn tất.',
        );
      } catch (error) {
        if (cancelled) return;

        const latestOrder = await refreshOrder(orderId);
        if (cancelled) return;

        if (latestOrder) {
          setOrder(latestOrder);
          if (latestOrder.status === 'confirmed') {
            setState('confirmed');
            setMessage('Thanh toán thành công và đơn hàng đã được xác nhận.');
            return;
          }
        }

        setState('error');
        setMessage(getErrorMessage(error));
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [orderId, query, responseCode, transactionStatus, txnRef]);

  const handleRefreshOrder = async () => {
    if (!orderId) return;

    setIsRefreshing(true);
    try {
      const latestOrder = await refreshOrder(orderId);
      if (!latestOrder) {
        setMessage('Không thể tải lại đơn hàng. Vui lòng thử lại sau.');
        return;
      }

      setOrder(latestOrder);
      if (latestOrder.status === 'confirmed') {
        setState('confirmed');
        setMessage('Đơn hàng đã được xác nhận thanh toán.');
      } else if (state === 'verifying' || state === 'error') {
        setState('pending');
        setMessage('Đơn hàng vẫn đang chờ hệ thống xác nhận thanh toán.');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const statusMeta = getStatusMeta(state);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="text-center">
          <div
            className={`mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full ${statusMeta.iconWrapClass}`}
          >
            <statusMeta.Icon className={`size-9 ${statusMeta.iconClass}`} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">{statusMeta.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">{message}</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
                Giao dịch VNPay
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                {order ? `Đơn hàng #${order.id}` : 'Đang chờ đối soát'}
              </h2>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${statusMeta.badgeClass}`}
            >
              <statusMeta.Icon className="size-4" />
              {statusMeta.badgeLabel}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoRow label="Mã đơn hàng VNPay" value={txnRef || 'Không có'} />
            <InfoRow label="Mã giao dịch VNPay" value={transactionNo || 'Chưa có'} />
            <InfoRow label="Mã phản hồi" value={responseCode || 'Không có'} />
            <InfoRow label="Trạng thái giao dịch" value={transactionStatus || 'Không có'} />
            {order && (
              <>
                <InfoRow label="Tổng thanh toán" value={formatCurrency(order.finalAmount)} />
                <InfoRow label="Trạng thái đơn hàng" value={formatOrderStatus(order.status)} />
              </>
            )}
          </div>

          {order && (
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Đơn hàng #{order.id}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.items.length} sản phẩm • {formatCurrency(order.finalAmount)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => router.push(`/account/orders/${order.id}`)}
                >
                  Xem đơn hàng
                </Button>
              </div>
            </div>
          )}

          {state === 'pending' && orderId && (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              <div className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">Đơn hàng đang chờ xác nhận cuối cùng.</p>
                  <p className="mt-1">
                    Bạn có thể tải lại trạng thái hoặc mở trang chi tiết đơn hàng để theo dõi cập nhật.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {orderId && (
            <Button
              className="rounded-full"
              variant="outline"
              onClick={() => router.push(`/account/orders/${orderId}`)}
            >
              <ArrowLeft />
              Quay lại đơn hàng
            </Button>
          )}

          {(state === 'verifying' || state === 'pending' || state === 'error') && orderId && (
            <Button
              className="rounded-full"
              variant="outline"
              onClick={() => void handleRefreshOrder()}
              disabled={isRefreshing}
            >
              {isRefreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
              Kiểm tra lại
            </Button>
          )}

          {(state === 'failed' || state === 'cancelled' || state === 'error') && (
            <Button asChild className="rounded-full">
              <Link href="/checkout">Quay lại checkout</Link>
            </Button>
          )}

          {!orderId && (
            <Button asChild className="rounded-full">
              <Link href="/account/orders">Xem danh sách đơn hàng</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function getStatusMeta(state: PaymentViewState) {
  switch (state) {
    case 'confirmed':
      return {
        title: 'Thanh toán thành công',
        badgeLabel: 'Đã xác nhận',
        badgeClass: 'bg-green-50 text-green-700',
        iconWrapClass: 'bg-green-100',
        iconClass: 'text-green-600',
        Icon: CheckCircle2,
      };
    case 'pending':
      return {
        title: 'Đang xác nhận đơn hàng',
        badgeLabel: 'Chờ xác nhận',
        badgeClass: 'bg-amber-50 text-amber-700',
        iconWrapClass: 'bg-amber-100',
        iconClass: 'text-amber-600',
        Icon: Clock3,
      };
    case 'cancelled':
      return {
        title: 'Thanh toán đã bị hủy',
        badgeLabel: 'Đã hủy',
        badgeClass: 'bg-slate-100 text-slate-600',
        iconWrapClass: 'bg-slate-200',
        iconClass: 'text-slate-500',
        Icon: AlertCircle,
      };
    case 'failed':
      return {
        title: 'Thanh toán thất bại',
        badgeLabel: 'Thất bại',
        badgeClass: 'bg-rose-50 text-rose-700',
        iconWrapClass: 'bg-rose-100',
        iconClass: 'text-rose-600',
        Icon: XCircle,
      };
    case 'error':
      return {
        title: 'Không thể xác nhận thanh toán',
        badgeLabel: 'Có lỗi',
        badgeClass: 'bg-rose-50 text-rose-700',
        iconWrapClass: 'bg-rose-100',
        iconClass: 'text-rose-600',
        Icon: AlertCircle,
      };
    case 'verifying':
    default:
      return {
        title: 'Đang xác nhận giao dịch',
        badgeLabel: 'Đang xử lý',
        badgeClass: 'bg-blue-50 text-blue-700',
        iconWrapClass: 'bg-blue-100',
        iconClass: 'text-blue-600',
        Icon: ShieldCheck,
      };
  }
}

async function refreshOrder(orderId: number | null) {
  if (!orderId) return null;

  try {
    const latestOrder = await getOrder(orderId);
    if (latestOrder.status === 'confirmed') {
      return latestOrder;
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      await delay(1500);
      const polledOrder = await getOrder(orderId);
      if (polledOrder.status === 'confirmed') {
        return polledOrder;
      }
      if (attempt === 1) {
        return polledOrder;
      }
    }

    return latestOrder;
  } catch {
    return null;
  }
}

function parseOrderId(value: string) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveFailureMessage(responseCode: string, transactionStatus: string) {
  if (responseCode === CANCELLED_RESPONSE_CODE) {
    return 'Bạn đã hủy thanh toán trên VNPay. Đơn hàng chưa được thanh toán.';
  }

  if (responseCode || transactionStatus) {
    return `Giao dịch VNPay không thành công. Mã phản hồi: ${responseCode || 'N/A'} / ${transactionStatus || 'N/A'}.`;
  }

  return 'Không nhận được trạng thái hợp lệ từ VNPay. Vui lòng kiểm tra lại đơn hàng.';
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const payload = error as {
      message?: string;
      error?: {
        message?: string;
      };
    };

    return (
      payload.error?.message ||
      payload.message ||
      'Không thể xác nhận thanh toán với backend. Vui lòng kiểm tra lại đơn hàng.'
    );
  }

  return 'Không thể xác nhận thanh toán với backend. Vui lòng kiểm tra lại đơn hàng.';
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

function formatOrderStatus(status: Order['status']) {
  const labels: Record<Order['status'], string> = {
    pending: 'Chờ thanh toán',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
  };

  return labels[status] ?? status;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
