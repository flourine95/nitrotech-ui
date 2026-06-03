import { ProductCard } from '@/components/product-card';
import type { Product } from '@/lib/api/public/products';
import { formatCurrency } from '@/lib/utils/formatting';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Sản phẩm liên quan</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gợi ý từ cùng danh mục, thương hiệu hoặc sản phẩm đang bán.
          </p>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            slug={product.slug}
            name={product.name}
            cat={product.categoryName || ''}
            price={product.priceMin === null ? 'Liên hệ' : formatCurrency(product.priceMin)}
            badge={product.badge || undefined}
            rating={product.rating || 0}
            thumbnail={product.thumbnail}
            reviews={product.reviewCount}
          />
        ))}
      </div>
    </section>
  );
}
