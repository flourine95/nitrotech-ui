'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import { getProduct, type Product, type ProductVariant } from '@/lib/api/public/products';
import { formatCurrency } from '@/lib/utils/formatting';
import { useCartStore } from '@/stores/cart-store';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  isError?: boolean;
}

export function ProductGrid({ products, isLoading, isError = false }: ProductGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addItem } = useCartStore();
  const [addingSlug, setAddingSlug] = useState<string | null>(null);

  async function handleAddToCart(product: Product) {
    setAddingSlug(product.slug);
    try {
      const detail = await getProduct(product.id);
      const variant = firstBuyableVariant(detail.variants ?? []);

      if (!variant) {
        toast.error('Sản phẩm chưa có cấu hình còn hàng');
        router.push(`/products/${product.slug}`);
        return;
      }

      await addItem(variant.id, 1);
      toast.success('Đã thêm vào giỏ hàng', {
        description: product.name,
        action: {
          label: 'Xem giỏ hàng',
          onClick: () => router.push('/cart'),
        },
      });
    } catch (error) {
      const err = error as { error?: { code?: string; message?: string } };
      if (err?.error?.code === 'AUTH_REQUIRED') {
        toast.error('Vui lòng đăng nhập để mua hàng');
        router.push(`/login?from=${encodeURIComponent(pathname)}`);
        return;
      }
      toast.error(err?.error?.message || 'Không thể thêm vào giỏ hàng');
    } finally {
      setAddingSlug(null);
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Không tải được sản phẩm</EmptyTitle>
          <EmptyDescription>Vui lòng thử lại sau hoặc điều chỉnh bộ lọc hiện tại</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (products.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Không tìm thấy sản phẩm</EmptyTitle>
          <EmptyDescription>
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((p) => (
        <ProductCard
          key={p.slug}
          slug={p.slug}
          name={p.name}
          cat={p.categoryName || ''}
          price={p.priceMin === null ? 'Liên hệ' : formatCurrency(p.priceMin)}
          badge={p.badge || undefined}
          rating={p.rating || 0}
          thumbnail={p.thumbnail}
          reviews={p.reviewCount}
          addToCartDisabled={addingSlug === p.slug}
          onAddToCart={() => void handleAddToCart(p)}
          onAddToWishlist={(product) => {
            toast.success('Đã thêm vào yêu thích', { description: product.name });
          }}
        />
      ))}
    </div>
  );
}

function firstBuyableVariant(variants: ProductVariant[]) {
  return variants.find((variant) =>
    variant.active &&
    variant.inStock !== false &&
    (variant.stockQuantity == null || variant.stockQuantity > 0)
  ) ?? null;
}
