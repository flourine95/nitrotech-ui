'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Tag, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Cart } from '@/types/cart';
import { validatePromotion } from '@/lib/api/promotions';
import type { PromotionValidationResult } from '@/types/promotion';

interface OrderSummaryProps {
  cart: Cart;
  promotionCode: string;
  onPromotionCodeChange: (code: string) => void;
}

export default function OrderSummary({
  cart,
  promotionCode,
  onPromotionCodeChange,
}: OrderSummaryProps) {
  const [promoInput, setPromoInput] = useState(promotionCode);
  const [appliedPromo, setAppliedPromo] = useState<PromotionValidationResult | null>(null);

  const validatePromoMutation = useMutation({
    mutationFn: (code: string) =>
      validatePromotion({
        code,
        orderAmount: cart.summary.subtotal,
      }),
    onSuccess: (data) => {
      setAppliedPromo(data);
      onPromotionCodeChange(data.code);
      toast.success(`Đã áp dụng mã giảm giá: ${data.code}`);
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string; data?: unknown } };
      const code = err?.error?.code;

      switch (code) {
        case 'PROMOTION_NOT_FOUND':
          toast.error('Mã khuyến mãi không tồn tại hoặc đã hết hạn');
          break;
        case 'PROMOTION_NOT_APPLICABLE': {
          const data = err.error?.data as { minAmount?: number };
          toast.error(
            `Đơn hàng chưa đủ điều kiện. Tối thiểu: ${data?.minAmount?.toLocaleString('vi-VN')} ₫`,
          );
          break;
        }
        case 'PROMOTION_USAGE_LIMIT_REACHED':
          toast.error('Mã khuyến mãi đã hết lượt sử dụng');
          break;
        case 'PROMOTION_USER_LIMIT_REACHED':
          toast.error('Bạn đã sử dụng hết lượt cho mã này');
          break;
        default:
          toast.error(err?.error?.message || 'Mã khuyến mãi không hợp lệ');
      }
    },
  });

  const handleApplyPromo = () => {
    const code = promoInput.trim();
    if (!code) {
      toast.error('Vui lòng nhập mã khuyến mãi');
      return;
    }
    validatePromoMutation.mutate(code);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
    onPromotionCodeChange('');
    toast.success('Đã xóa mã khuyến mãi');
  };

  const discount = appliedPromo?.discountAmount || cart.summary.discount;
  const total = appliedPromo?.finalAmount || cart.summary.total;

  return (
    <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-950">Đơn hàng</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
          {cart.summary.totalItems} sản phẩm
        </span>
      </div>

      {/* Cart Items */}
      <div className="mt-4 space-y-3">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={item.variant.product.thumbnail || '/placeholder.png'}
                alt={item.variant.product.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-sm">
                {item.quantity}
              </div>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <Link
                href={`/products/${item.variant.product.slug}`}
                className="line-clamp-2 leading-5 font-medium text-slate-950 hover:text-primary"
              >
                {item.variant.product.name}
              </Link>
              <p className="mt-0.5 truncate text-xs text-slate-500">{item.variant.name}</p>
              <p className="mt-1 font-semibold text-slate-950">
                {(item.variant.price * item.quantity).toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Promotion Code */}
      <div className="mt-5 border-t border-slate-100 pt-4">
        <Label className="text-sm font-semibold text-slate-950">Mã khuyến mãi</Label>
        {appliedPromo ? (
          <div className="mt-2 flex items-center justify-between rounded-full border border-green-200 bg-green-50 px-3 py-2 dark:bg-green-950">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {appliedPromo.code}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 rounded-full text-green-600 hover:text-green-700 dark:text-green-400"
              onClick={handleRemovePromo}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <Input
              className="rounded-full"
              placeholder="Nhập mã"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyPromo();
                }
              }}
            />
            <Button
              variant="outline"
              className="shrink-0 rounded-full"
              onClick={handleApplyPromo}
              disabled={validatePromoMutation.isPending}
            >
              Áp dụng
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Tạm tính</span>
          <span className="font-semibold text-slate-950">
            {cart.summary.subtotal.toLocaleString('vi-VN')} ₫
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Giảm giá</span>
            <span className="font-medium text-green-600">
              -{discount.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Phí vận chuyển</span>
          <span className="font-semibold text-slate-950">
            {cart.summary.shipping === 0
              ? 'Miễn phí'
              : `${cart.summary.shipping.toLocaleString('vi-VN')} ₫`}
          </span>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-950">Tổng cộng</span>
            <span className="text-xl font-bold tracking-tight text-primary">
              {total.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
