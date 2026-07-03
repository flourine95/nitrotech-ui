import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/server';
import type { Product } from '@/lib/api/public/products';
import type { Review, ReviewStats } from '@/lib/api/reviews';
import { ProductDetailMain } from './product-detail-main';
import { ProductDetailTabs } from './product-detail-tabs';
import { RelatedProducts } from './related-products';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
    const res = await backendFetch(`/api/products/${slug}`, { cookieHeader });
    
    if (!res.ok) {
      return { title: 'Sản phẩm' };
    }
    
    const { data: product } = await res.json() as { data: Product };
    return { title: product.name };
  } catch {
    return { title: 'Sản phẩm' };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch product from API
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ');
  
  let product: Product;
  try {
    const res = await backendFetch(`/api/products/${slug}`, { cookieHeader });
    if (!res.ok) {
      notFound();
    }
    const json = await res.json() as { data: Product };
    product = json.data;
  } catch {
    notFound();
  }

  const specs = [
    { label: 'Thương hiệu', value: product.brandName || 'Đang cập nhật' },
    { label: 'Danh mục', value: product.categoryName || 'Đang cập nhật' },
    ...Object.entries(product.specs ?? {}).map(([label, value]) => ({
      label,
      value: String(value),
    })),
  ];

  let relatedProducts: Product[] = [];
  let reviews: Review[] = [];
  let reviewStats: ReviewStats | null = null;
  try {
    const [relatedRes, reviewsRes, statsRes] = await Promise.all([
      backendFetch(`/api/products/${product.id}/related?limit=4`, { cookieHeader }),
      backendFetch(`/api/products/${product.id}/reviews?status=approved&size=20`, { cookieHeader }),
      backendFetch(`/api/products/${product.id}/reviews/stats`, { cookieHeader }),
    ]);
    if (relatedRes.ok) {
      const relatedJson = await relatedRes.json() as { data: Product[] };
      relatedProducts = relatedJson.data;
    }
    if (reviewsRes.ok) {
      const reviewsJson = await reviewsRes.json() as { data: Review[] };
      reviews = reviewsJson.data;
    }
    if (statsRes.ok) {
      const statsJson = await statsRes.json() as { data: ReviewStats };
      reviewStats = statsJson.data;
    }
  } catch {
    relatedProducts = [];
    reviews = [];
    reviewStats = null;
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-2">
          <Breadcrumb>
            <BreadcrumbList className="flex-wrap gap-y-1 text-muted-foreground">
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Trang chủ</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/products">Sản phẩm</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              {product.categoryName && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href={`/products?category=${encodeURIComponent(product.categorySlug ?? product.categoryName)}`}>
                        {product.categoryName}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-60 truncate font-medium">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <ProductDetailMain product={product} />
          <ProductDetailTabs
            productName={product.name}
            description={product.description}
            specs={specs}
            rating={product.rating}
            reviewCount={product.reviewCount || 0}
            reviews={reviews}
            reviewStats={reviewStats}
          />
          <RelatedProducts products={relatedProducts} />
        </div>
      </main>
  );
}
