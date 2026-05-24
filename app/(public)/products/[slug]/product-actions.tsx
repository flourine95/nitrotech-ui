'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, GitCompare, Heart, Shield, Zap, Package, CreditCard } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductActionsProps {
  slug: string;
  price: string;
  old: string;
  discount: string;
  variants: string[];
  colors: { name: string; color: string; ring: string }[];
  stockCount: number;
  warranty: string;
}

export function ProductActions({
  slug,
  price,
  old,
  discount,
  variants,
  colors,
  stockCount,
  warranty,
}: ProductActionsProps) {
  const router = useRouter();
  const { addItem, isLoading } = useCartStore();
  const [qty, setQty] = useState(1);
  const [activeVariant, setActiveVariant] = useState(0);
  const [activeColor, setActiveColor] = useState(0);

  // TODO: Replace with real variantId from API
  // For now, generate a mock variantId based on slug and variant index
  const getVariantId = () => {
    // This is a temporary solution until backend is ready
    // In production, this should come from the product API
    const baseId = slug.split('-').reduce((acc, part) => acc + part.charCodeAt(0), 0);
    return baseId + activeVariant + activeColor;
  };

  const handleAddToCart = async () => {
    try {
      const variantId = getVariantId();
      await addItem(variantId, qty);
      toast.success('Đã thêm vào giỏ hàng', {
        description: `${qty} × sản phẩm`,
        action: {
          label: 'Xem giỏ hàng',
          onClick: () => router.push('/cart'),
        },
      });
    } catch (error) {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;

      switch (code) {
        case 'VARIANT_NOT_FOUND':
          toast.error('Sản phẩm không tồn tại');
          break;
        case 'INSUFFICIENT_STOCK':
          toast.error('Không đủ hàng trong kho');
          break;
        case 'VARIANT_INACTIVE':
          toast.error('Sản phẩm không còn bán');
          break;
        default:
          toast.error(err?.error?.message || 'Thêm vào giỏ hàng thất bại');
      }
    }
  };

  const handleBuyNow = async () => {
    try {
      const variantId = getVariantId();
      await addItem(variantId, qty);
      router.push('/checkout');
    } catch (error) {
      const err = error as { error?: { code?: string; message?: string } };
      toast.error(err?.error?.message || 'Có lỗi xảy ra');
    }
  };

  const trustBadges = [
    { icon: Shield, text: warranty },
    { icon: Zap, text: 'Giao trong 2 giờ' },
    { icon: Package, text: 'Đổi trả trong 30 ngày' },
    { icon: CreditCard, text: 'Trả góp 0% lãi suất' },
  ];

  return (
    <>
      {/* Price */}
      <div className="mb-6 flex items-baseline gap-3 rounded-2xl border border-border bg-muted/30 p-4">
        <span className="text-3xl font-bold text-foreground">{price}</span>
        <span className="text-lg text-muted-foreground line-through">{old}</span>
        <Badge variant="destructive" className="rounded-full">
          {discount}
        </Badge>
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-foreground">Cấu hình</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <Button
                key={v}
                onClick={() => setActiveVariant(i)}
                variant={i === activeVariant ? 'default' : 'outline'}
                size="sm"
                className="rounded-full"
              >
                {v}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div className="mb-6">
          <p className="mb-2 text-sm font-semibold text-foreground">Màu sắc</p>
          <div className="flex gap-2">
            {colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setActiveColor(i)}
                className={`size-8 rounded-full ${c.color} transition-all ${i === activeColor ? `ring-2 ring-offset-2 ${c.ring}` : 'hover:ring-2 hover:ring-muted hover:ring-offset-2'}`}
                aria-label={c.name}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mb-6">
        <p className="mb-2 text-sm font-semibold text-foreground">Số lượng</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-full border border-border">
            <Button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              variant="ghost"
              size="sm"
              className="rounded-none px-4"
              aria-label="Giảm"
            >
              −
            </Button>
            <span
              className="min-w-12 px-4 text-center text-sm font-semibold text-foreground"
              aria-live="polite"
            >
              {qty}
            </span>
            <Button
              onClick={() => setQty((q) => Math.min(stockCount, q + 1))}
              variant="ghost"
              size="sm"
              className="rounded-none px-4"
              aria-label="Tăng"
            >
              +
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">Còn {stockCount} sản phẩm</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="mb-6 flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          variant="secondary"
          className="flex-1 rounded-full"
        >
          {isLoading ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Đang thêm...
            </>
          ) : (
            'Thêm vào giỏ'
          )}
        </Button>
        <Button
          onClick={handleBuyNow}
          disabled={isLoading}
          className="flex-1 rounded-full bg-blue-600 hover:bg-blue-500"
        >
          Mua ngay
        </Button>
        <Button
          asChild
          variant="outline"
          size="icon"
          className="rounded-full"
          aria-label="So sánh"
          title="So sánh"
        >
          <Link href={`/compare?add=${slug}`}>
            <GitCompare className="size-5" />
          </Link>
        </Button>
        <Button
          onClick={() => toast.success('Đã thêm vào yêu thích')}
          variant="outline"
          size="icon"
          className="rounded-full hover:text-rose-500"
          aria-label="Yêu thích"
        >
          <Heart className="size-5" />
        </Button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-3">
        {trustBadges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.text}
              className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 p-3 text-xs text-muted-foreground"
            >
              <Icon className="size-4 shrink-0 text-blue-600" />
              {b.text}
            </div>
          );
        })}
      </div>
    </>
  );
}
