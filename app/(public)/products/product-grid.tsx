import { toast } from 'sonner';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { Product } from '@/lib/api/products';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductGrid({ products, isLoading }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
      </div>
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
          price={`${p.priceMin?.toLocaleString()}₫`}
          badge={p.badge || undefined}
          rating={p.rating || 0}
          reviews={p.reviewCount}
          onAddToCart={(product) => {
            toast.success('Đã thêm vào giỏ hàng', { description: product.name });
          }}
          onAddToWishlist={(product) => {
            toast.success('Đã thêm vào yêu thích', { description: product.name });
          }}
        />
      ))}
    </div>
  );
}
