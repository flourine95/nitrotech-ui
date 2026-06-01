import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { ChevronRight } from 'lucide-react';
import { backendFetch } from '@/lib/api/server';
import type { Product } from '@/lib/api/public/products';
import { ProductActions } from './product-actions';
import { ProductImagePlaceholder } from '@/components/product-image-placeholder';
import { ProductRating } from '@/components/product-rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cloudinaryImage } from '@/lib/utils/cloudinary';

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

const reviewsData = [
  {
    name: 'Trần Thị Lan Anh',
    role: 'Graphic Designer',
    rating: 5,
    date: '15/03/2025',
    text: 'Sản phẩm chất lượng tuyệt vời, giao hàng nhanh. Rất hài lòng với lần mua này tại NitroTech.',
  },
  {
    name: 'Nguyễn Văn Hùng',
    role: 'Developer',
    rating: 5,
    date: '02/03/2025',
    text: 'Hàng chính hãng, đóng gói cẩn thận. Giá tại NitroTech tốt hơn nhiều chỗ khác.',
  },
  {
    name: 'Lê Minh Châu',
    role: 'Content Creator',
    rating: 4,
    date: '20/02/2025',
    text: 'Hiệu năng xuất sắc, đáng đồng tiền. Nhân viên tư vấn nhiệt tình, hỗ trợ tốt.',
  },
];

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

  // Mock data for now (will be replaced with API later)
  const mockSpecs = [
    { label: 'Thương hiệu', value: product.brandName || 'N/A' },
    { label: 'Danh mục', value: product.categoryName || 'N/A' },
    { label: 'SKU', value: product.slug },
  ];
  
  // Add specs from product.specs if available
  const specs = product.specs 
    ? [...mockSpecs, ...Object.entries(product.specs).map(([label, value]) => ({ label, value }))]
    : mockSpecs;

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-3 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          <Link href="/products" className="transition-colors hover:text-foreground">
            Sản phẩm
          </Link>
          <ChevronRight className="size-3.5" aria-hidden="true" />
          {product.categoryName && (
            <>
              <Link
                href={`/products?category=${encodeURIComponent(product.categorySlug ?? product.categoryName)}`}
                className="transition-colors hover:text-foreground"
              >
                {product.categoryName}
              </Link>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </>
          )}
          <span className="max-w-52 truncate font-medium text-foreground">{product.name}</span>
        </div>
      </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Product main */}
          <div className="mb-16 grid gap-12 lg:grid-cols-2">
            {/* Images */}
            <div>
              <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
                {product.thumbnail ? (
                  <Image
                    src={cloudinaryImage(product.thumbnail, 'f_auto,q_auto,w_1200')}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <ProductImagePlaceholder size="lg" className="w-48" />
                )}
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Button
                    key={i}
                    variant={i === 1 ? 'outline' : 'ghost'}
                    size="icon"
                    className="aspect-square flex-1 rounded-2xl"
                    aria-label={`Ảnh ${i}`}
                  >
                    <ProductImagePlaceholder size="sm" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                {product.badge && (
                  <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    {product.badge}
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">SKU: {product.slug}</span>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
                {product.name}
              </h1>
              {product.description && (
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              )}

              {/* Rating */}
              <div className="mb-5 flex items-center gap-3">
                <ProductRating rating={product.rating || 0} showReviews={false} />
                <span className="text-sm font-semibold text-foreground">{product.rating || 0}</span>
                <span className="text-sm text-muted-foreground">{product.reviewCount || 0} đánh giá</span>
                <span className="text-sm font-medium text-green-600">
                  {product.active ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>

              {/* Price + Variants + Colors + Qty + CTAs + Trust — client */}
              <ProductActions
                slug={product.slug}
                price={product.priceMin ? `${product.priceMin.toLocaleString()}₫` : 'Liên hệ'}
                old={product.priceMax && product.priceMax > (product.priceMin || 0) ? `${product.priceMax.toLocaleString()}₫` : ''}
                discount={product.priceMax && product.priceMin && product.priceMax > product.priceMin ? `-${Math.round((1 - product.priceMin / product.priceMax) * 100)}%` : ''}
                variants={product.variants?.map(v => v.name) || []}
                colors={[]}
                stockCount={product.variantCount || 0}
                warranty="12 tháng chính hãng"
              />
            </div>
          </div>
          {/* Specs */}
          <div className="mb-16">
            <div className="mb-8 flex gap-1 border-b border-border">
              {['Thông số kỹ thuật', `Đánh giá (${product.reviewCount || 0})`, 'Mô tả'].map((tab, i) => (
                <Button
                  key={tab}
                  variant="ghost"
                  className={`-mb-px rounded-none border-b-2 px-5 py-3 ${i === 0 ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}
                >
                  {tab}
                </Button>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <table className="w-full text-sm">
                <caption className="sr-only">Thông số kỹ thuật {product.name}</caption>
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={s.label} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/30'}>
                      <td className="w-44 border-r border-border px-6 py-3.5 font-medium text-muted-foreground">
                        {s.label}
                      </td>
                      <td className="px-6 py-3.5 text-foreground">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Đánh giá từ khách hàng</h2>
              <Button variant="outline" className="rounded-full">
                Viết đánh giá
              </Button>
            </div>
            <div className="mb-6 flex items-center gap-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="text-center">
                <div className="text-5xl font-bold text-foreground">{product.rating || 0}</div>
                <div className="my-2 flex justify-center">
                  <ProductRating rating={product.rating || 0} showReviews={false} />
                </div>
                <div className="text-xs text-muted-foreground">{product.reviewCount || 0} đánh giá</div>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  [5, 80],
                  [4, 15],
                  [3, 3],
                  [2, 1],
                  [1, 1],
                ].map(([star, pct]) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="w-4 text-xs text-muted-foreground">{star}</span>
                    <ProductRating rating={1} showReviews={false} size="sm" />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-yellow-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-muted-foreground">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {reviewsData.map((r) => (
                <article
                  key={r.name}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
                        aria-hidden="true"
                      >
                        {r.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{r.name}</div>
                        <div className="text-xs text-muted-foreground">{r.role}</div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <div className="mb-2">
                    <ProductRating rating={r.rating} showReviews={false} size="sm" />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Related - Hidden for now since we don't have related products from API */}
        </div>
      </main>
  );
}
