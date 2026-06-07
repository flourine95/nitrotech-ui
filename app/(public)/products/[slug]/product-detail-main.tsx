'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { GitCompare, Heart } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/api/public/products';
import { Button } from '@/components/ui/button';
import { ProductRating } from '@/components/product-rating';
import { ProductActions } from './product-actions';
import { ProductGallery } from './product-gallery';

interface ProductDetailMainProps {
  product: Product;
}

export function ProductDetailMain({ product }: ProductDetailMainProps) {
  const [selectedVariantImage, setSelectedVariantImage] = useState<string | null>(null);

  const handleVariantChange = useCallback((variant: ProductVariant | null) => {
    setSelectedVariantImage(variant?.imageUrl ?? null);
  }, []);

  return (
    <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ProductGallery
        name={product.name}
        thumbnail={product.thumbnail}
        images={product.images ?? []}
        selectedImage={selectedVariantImage}
        onSelectedImageChange={setSelectedVariantImage}
        priority
      />

      <div className="relative min-w-0">
        <div className="absolute top-0 right-0 flex gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="group size-9 rounded-full"
            aria-label="So sánh"
            title="So sánh"
          >
            <Link href={`/compare?add=${product.slug}`}>
              <GitCompare data-icon className="group-hover:text-blue-600" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="group size-9 rounded-full"
            aria-label="Yêu thích"
            title="Yêu thích"
          >
            <Heart data-icon className="group-hover:text-destructive" />
          </Button>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-foreground break-words sm:text-3xl">
          {product.name}
        </h1>
        {product.shortDescription && (
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            {product.shortDescription}
          </p>
        )}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <ProductRating rating={product.rating || 0} showReviews={false} />
          <span className="text-sm font-semibold text-foreground">{product.rating || 0}</span>
          <span className="text-sm text-muted-foreground">{product.reviewCount || 0} đánh giá</span>
        </div>

        <ProductActions
          priceMin={product.priceMin}
          variants={product.variants ?? []}
          warranty="12 tháng chính hãng"
          onVariantChange={handleVariantChange}
        />
      </div>
    </div>
  );
}
