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
            `Đơn hàng chưa đủ điều kiện. Tối thiểu: ${data?.minAmount?.toLocaleString('vi-VN')} ₫`
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
    <div className="sticky top-4 rounded-lg border bg-card p-6">
      <h2 className="text-lg font-semibold">Đơn hàng</h2>

      {/* Cart Items */}
      <div className="mt-4 space-y-3">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="relative size-16 shrink-0 overflow-hidden rounded-md">
              <Image
                src={item.variant.product.thumbnail || '/placeholder.png'}
                alt={item.variant.product.name}
                fill
                className="object-cover"
              />
              <div className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {item.quantity}
              </div>
            </div>
            <div className="flex-1 text-sm">
              <Link
                href={`/products/${item.variant.product.slug}`}
                className="line-clamp-2 font-medium hover:text-primary"
              >
                {item.variant.product.name}
              </Link>
              <p className="mt-0.5 text-xs text-muted-foreground">{item.variant.name}</p>
              <p className="mt-1 font-medium">
                {(item.variant.price * item.quantity).toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Promotion Code */}
      <div className="mt-6 border-t pt-4">
        <Label className="text-sm font-medium">Mã khuyến mãi</Label>
        {appliedPromo ? (
          <div className="mt-2 flex items-center justify-between rounded-md border border-green-500 bg-green-50 px-3 py-2 dark:bg-green-950">
            <div className="flex items-center gap-2">
              <Tag className="size-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                {appliedPromo.code}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-green-600 hover:text-green-700 dark:text-green-400"
              onClick={handleRemovePromo}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="mt-2 flex gap-2">
            <Input
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
              onClick={handleApplyPromo}
              disabled={validatePromoMutation.isPending}
            >
              Áp dụng
            </Button>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 space-y-3 border-t pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tạm tính</span>
          <span className="font-medium">{cart.summary.subtotal.toLocaleString('vi-VN')} ₫</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="font-medium text-green-600">-{discount.toLocaleString('vi-VN')} ₫</span>
          </div>
        )}

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Phí vận chuyển</span>
          <span className="font-medium">
            {cart.summary.shipping === 0
              ? 'Miễn phí'
              : `${cart.summary.shipping.toLocaleString('vi-VN')} ₫`}
          </span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-semibold">Tổng cộng</span>
            <span className="text-xl font-bold text-primary">
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
