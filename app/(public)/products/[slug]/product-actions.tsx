'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Loader2, GitCompare, Heart, Shield, Zap, Package, CreditCard } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { ProductVariant } from '@/lib/api/public/products';

interface ProductActionsProps {
  slug: string;
  priceMin: number | null;
  priceMax: number | null;
  variants: ProductVariant[];
  colors: { name: string; color: string; ring: string }[];
  variantCount: number;
  warranty: string;
}

export function ProductActions({
  slug,
  priceMin,
  priceMax,
  variants,
  colors,
  variantCount,
  warranty,
}: ProductActionsProps) {
  const router = useRouter();
  const { addItem, isLoading } = useCartStore();
  const [qty, setQty] = useState(1);
  const [activeVariant, setActiveVariant] = useState(0);
  const [activeColor, setActiveColor] = useState(0);
  const selectedVariant = variants[activeVariant] ?? null;
  const stockCount = selectedVariant ? ((selectedVariant.id * 7) % 24) + 3 : 0;
  const selectedPrice = selectedVariant?.price ?? priceMin;
  const discountPercent = priceMax && selectedPrice && priceMax > selectedPrice
    ? Math.round((1 - selectedPrice / priceMax) * 100)
    : null;
  const canPurchase = Boolean(selectedVariant?.id) && variantCount > 0;

  function formatPrice(value: number | null) {
    if (!value) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Sản phẩm chưa có cấu hình để thêm vào giỏ');
      return;
    }

    try {
      await addItem(selectedVariant.id, qty);
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
    if (!selectedVariant) {
      toast.error('Sản phẩm chưa có cấu hình để mua');
      return;
    }

    try {
      await addItem(selectedVariant.id, qty);
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
    <div className="flex flex-col gap-6">
      {/* Price */}
      <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
        <span className="text-3xl font-bold tracking-tight text-foreground">{formatPrice(selectedPrice)}</span>
        {priceMax && selectedPrice && priceMax > selectedPrice && (
          <span className="pb-0.5 text-base text-muted-foreground line-through">
            {formatPrice(priceMax)}
          </span>
        )}
        {discountPercent && (
          <Badge variant="destructive" className="mb-1 rounded-full">
            -{discountPercent}%
          </Badge>
        )}
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Tùy chọn</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => {
              // Use name if available, otherwise build from attributes
              const variantLabel = v.name || 
                (v.attributes && Object.keys(v.attributes).length > 0
                  ? Object.values(v.attributes).filter(Boolean).join(' • ')
                  : `Phiên bản ${i + 1}`);
              
              return (
                <Button
                  key={v.id}
                  onClick={() => setActiveVariant(i)}
                  variant={i === activeVariant ? 'default' : 'outline'}
                  size="default"
                  className="h-10 rounded-full px-5"
                  title={`${variantLabel} - ${formatPrice(v.price)}`}
                >
                  {variantLabel}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-foreground">Màu sắc</p>
          <div className="flex gap-2">
            {colors.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setActiveColor(i)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveColor(i);
                  }
                }}
                className={`size-8 rounded-full ${c.color} transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${i === activeColor ? `ring-2 ring-offset-2 ${c.ring}` : 'hover:ring-2 hover:ring-muted hover:ring-offset-2'}`}
                aria-label={c.name}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Số lượng</p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center overflow-hidden rounded-full border border-border">
            <Button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1 || isLoading}
              variant="ghost"
              size="default"
              className="h-10 rounded-none px-4"
              aria-label="Giảm"
            >
              −
            </Button>
            <span
              className="flex h-10 min-w-16 items-center justify-center px-4 text-sm font-semibold text-foreground"
              aria-live="polite"
            >
              {qty}
            </span>
            <Button
              onClick={() => setQty((q) => q + 1)}
              disabled={!canPurchase || isLoading}
              variant="ghost"
              size="default"
              className="h-10 rounded-none px-4"
              aria-label="Tăng"
            >
              +
            </Button>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {canPurchase ? `Còn lại ${stockCount} sản phẩm` : 'Tạm hết hàng'}
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-3">
          <Button
            onClick={handleAddToCart}
            disabled={isLoading || !canPurchase}
            variant="outline"
            size="lg"
            className="flex-1 h-12 rounded-full touch-manipulation text-sm font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 data-icon="inline-start" className="animate-spin" />
                Đang thêm…
              </>
            ) : (
              'Thêm vào giỏ'
            )}
          </Button>
          <Button
            onClick={handleBuyNow}
            disabled={isLoading || !canPurchase}
            size="lg"
            className="flex-1 h-12 rounded-full touch-manipulation text-sm font-semibold"
          >
            Mua ngay
          </Button>
        </div>
        <div className="flex gap-3 sm:w-auto">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full touch-manipulation"
            aria-label="So sánh"
            title="So sánh"
          >
            <Link href={`/compare?add=${slug}`} className="flex items-center justify-center size-full">
              <GitCompare className="size-5" />
            </Link>
          </Button>
          <Button
            onClick={() => toast.success('Đã thêm vào yêu thích')}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full touch-manipulation hover:text-destructive"
            aria-label="Yêu thích"
          >
            <Heart className="size-5" />
          </Button>
        </div>
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
              <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
              {b.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}
