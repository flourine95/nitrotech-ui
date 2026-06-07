'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Shield, Zap, Package, CreditCard } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { Button } from '@/components/ui/button';
import type { ProductVariant } from '@/lib/api/public/products';
import { formatCurrency } from '@/lib/utils/formatting';

const ATTRIBUTE_LABELS: Record<string, string> = {
  configuration: 'Cấu hình',
  color: 'Màu sắc',
  capacity: 'Dung lượng',
  speed: 'Tốc độ',
  interface: 'Chuẩn kết nối',
  size: 'Kích thước',
  refreshRate: 'Tần số quét',
  resolution: 'Độ phân giải',
  layout: 'Layout',
  switch: 'Switch',
  connection: 'Kết nối',
  memory: 'Bộ nhớ',
  cooling: 'Tản nhiệt',
  edition: 'Phiên bản',
  warranty: 'Bảo hành',
  option: 'Tùy chọn',
};

interface ProductActionsProps {
  priceMin: number | null;
  variants: ProductVariant[];
  warranty: string;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

export function ProductActions({
  priceMin,
  variants,
  warranty,
  onVariantChange,
}: ProductActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { cart, addItem, fetchCart, isLoading } = useCartStore();
  const [qty, setQty] = useState(1);
  const variantOptions = buildVariantOptions(variants);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() => {
    const firstVariant = variants[0]?.attributes ?? {};
    return Object.fromEntries(variantOptions.map((option) => [option.key, firstVariant[option.key]]).filter(([, value]) => value));
  });
  const selectedVariant = findVariantByAttributes(variants, selectedAttributes);
  const selectedPrice = selectedVariant?.price ?? priceMin;
  const selectedStock = selectedVariant?.stockQuantity;
  const quantityInCart = selectedVariant
    ? cart?.items.find((item) => item.variantId === selectedVariant.id)?.quantity ?? 0
    : 0;
  const availableToAdd = typeof selectedStock === 'number'
    ? Math.max(0, selectedStock - quantityInCart)
    : null;
  const canPurchase = Boolean(
    selectedVariant?.id &&
    selectedVariant.active &&
    (availableToAdd == null || availableToAdd > 0)
  );

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    onVariantChange?.(selectedVariant);
  }, [onVariantChange, selectedVariant]);

  useEffect(() => {
    if (availableToAdd !== null) {
      setQty((current) => Math.min(Math.max(1, current), Math.max(1, availableToAdd)));
    }
  }, [availableToAdd]);

  function handleAttributeChange(key: string, value: string) {
    const nextAttributes = { ...selectedAttributes, [key]: value };
    const nextVariant = findVariantByAttributes(variants, nextAttributes);
    setSelectedAttributes(nextVariant?.attributes ?? nextAttributes);
    if (typeof nextVariant?.stockQuantity === 'number') {
      const nextQuantityInCart = cart?.items.find((item) => item.variantId === nextVariant.id)?.quantity ?? 0;
      const nextAvailableToAdd = Math.max(0, nextVariant.stockQuantity - nextQuantityInCart);
      setQty((current) => Math.min(current, Math.max(1, nextAvailableToAdd)));
    }
  }

  const handleAddToCart = async () => {
    if (!canPurchase || !selectedVariant) {
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
        case 'AUTH_REQUIRED':
          toast.error('Vui lòng đăng nhập để thêm sản phẩm vào giỏ');
          router.push(`/login?from=${encodeURIComponent(pathname)}`);
          break;
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
    if (!canPurchase || !selectedVariant) {
      toast.error('Sản phẩm chưa có cấu hình để mua');
      return;
    }

    try {
      await addItem(selectedVariant.id, qty);
      router.push('/checkout');
    } catch (error) {
      const err = error as { error?: { code?: string; message?: string } };
      if (err?.error?.code === 'AUTH_REQUIRED') {
        toast.error('Vui lòng đăng nhập để mua hàng');
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
        return;
      }
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
      <div>
        <span className="text-3xl font-bold tracking-tight text-foreground">
          {selectedPrice === null ? 'Liên hệ' : formatCurrency(selectedPrice)}
        </span>
      </div>

      {variantOptions.map((option) => (
        <div key={option.key}>
          <p className="mb-2 text-sm font-semibold text-foreground">
            {ATTRIBUTE_LABELS[option.key] ?? option.key}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => (
              <Button
                key={value}
                type="button"
                onClick={() => handleAttributeChange(option.key, value)}
                variant={value === selectedAttributes[option.key] ? 'default' : 'outline'}
                size="default"
                className="h-auto rounded-full px-4 py-3 font-semibold data-[variant=default]:bg-primary data-[variant=default]:text-primary-foreground data-[variant=default]:hover:bg-primary/90"
              >
                {value}
              </Button>
            ))}
          </div>
        </div>
      ))}

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
              disabled={!canPurchase || isLoading || (availableToAdd !== null && qty >= availableToAdd)}
              variant="ghost"
              size="default"
              className="h-10 rounded-none px-4"
              aria-label="Tăng"
            >
              +
            </Button>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {stockLabel(selectedVariant, quantityInCart, availableToAdd)}
          </span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading || !canPurchase}
          variant="outline"
          size="lg"
          className="h-auto flex-1 rounded-full border-primary/25 px-4 py-3 font-semibold text-primary hover:border-primary/40 hover:bg-primary/5"
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
          disabled={isLoading || !canPurchase}
          size="lg"
          className="h-auto flex-1 rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Mua ngay
        </Button>
      </div>

      {/* Trust badges */}
      <div className="rounded-2xl border border-border bg-muted/25 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {trustBadges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.text} className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-primary ring-1 ring-border">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="text-sm font-medium leading-snug text-foreground">{b.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function buildVariantOptions(variants: ProductVariant[]) {
  const keys = Array.from(new Set(variants.flatMap((variant) => Object.keys(variant.attributes ?? {}))));
  return keys.map((key) => ({
    key,
    values: Array.from(new Set(variants.map((variant) => variant.attributes?.[key]).filter(Boolean))),
  }));
}

function findVariantByAttributes(variants: ProductVariant[], selectedAttributes: Record<string, string>) {
  return variants.find((variant) =>
    Object.entries(selectedAttributes).every(([key, value]) => variant.attributes?.[key] === value)
  ) ?? null;
}

function stockLabel(variant: ProductVariant | null, quantityInCart: number, availableToAdd: number | null) {
  if (!variant) return 'Vui lòng chọn cấu hình';
  if (variant.stockQuantity == null) return 'Đang cập nhật tồn kho';
  if (variant.stockQuantity <= 0) return 'Tạm hết hàng';
  if (availableToAdd === 0) return `Bạn đã có ${quantityInCart} sản phẩm trong giỏ`;
  if (quantityInCart > 0 && availableToAdd !== null) {
    return `Còn có thể thêm ${availableToAdd} sản phẩm`;
  }
  if (variant.lowStock) return `Chỉ còn ${variant.stockQuantity} sản phẩm`;
  return `Còn ${variant.stockQuantity} sản phẩm`;
}
