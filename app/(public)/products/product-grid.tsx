import { toast } from 'sonner';
import { ProductCard } from '@/components/product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import type { Product } from '@/lib/api/public/products';

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
          price={`${p.priceMin?.toLocaleString()}₫`}
          badge={p.badge || undefined}
          rating={p.rating || 0}
          thumbnail={p.thumbnail}
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
