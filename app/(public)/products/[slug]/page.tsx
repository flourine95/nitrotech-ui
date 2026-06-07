import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { backendFetch } from '@/lib/api/server';
import type { Product } from '@/lib/api/public/products';
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

  const specs = [
    { label: 'Thương hiệu', value: product.brandName || 'Đang cập nhật' },
    { label: 'Danh mục', value: product.categoryName || 'Đang cập nhật' },
    ...Object.entries(product.specs ?? {}).map(([label, value]) => ({
      label,
      value: String(value),
    })),
  ];

  let relatedProducts: Product[] = [];
  try {
    const relatedRes = await backendFetch(`/api/products/${product.id}/related?limit=4`, { cookieHeader });
    if (relatedRes.ok) {
      const relatedJson = await relatedRes.json() as { data: Product[] };
      relatedProducts = relatedJson.data;
    }
  } catch {
    relatedProducts = [];
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
            reviews={reviewsData}
          />
          <RelatedProducts products={relatedProducts} />
        </div>
      </main>
  );
}
