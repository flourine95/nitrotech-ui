'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { cancelOrder } from '@/lib/api/orders';

export function CancelOrderButton({ orderId }: { orderId: number }) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?')) return;

    setIsCancelling(true);
    try {
      await cancelOrder(orderId);
      toast.success('Đã hủy đơn hàng');
      router.refresh();
    } catch {
      toast.error('Không thể hủy đơn hàng');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <button
      type="button"
      className="w-full cursor-pointer rounded-full border border-rose-200 bg-white py-3 text-sm font-semibold text-rose-600 transition-colors duration-200 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={handleCancel}
      disabled={isCancelling}
    >
      {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
    </button>
  );
}
