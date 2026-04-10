import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { getProduct, getRelatedProducts, getAllProducts } from '@/lib/api/products';
import { ProductActions } from './product-actions';

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return { title: product?.name ?? 'Sản phẩm' };
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
  const product = getProduct(slug);
  if (!product) notFound();
  const related = getRelatedProducts(product.relatedSlugs);

  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-6 py-3 text-sm text-slate-400">
            <Link
              href="/"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-700"
            >
              Trang chủ
            </Link>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <Link
              href="/products"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-700"
            >
              Sản phẩm
            </Link>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <Link
              href={`/products?cat=${product.catSlug}`}
              className="cursor-pointer transition-colors duration-150 hover:text-slate-700"
            >
              {product.cat}
            </Link>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="max-w-52 truncate font-medium text-slate-700">{product.name}</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Product main */}
          <div className="mb-16 grid gap-12 lg:grid-cols-2">
            {/* Images */}
            <div>
              <div className="mb-4 flex aspect-square items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                <svg
                  viewBox="0 0 200 140"
                  className="h-auto w-48 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="10" y="8" width="180" height="110" rx="6" strokeWidth="2" />
                  <rect
                    x="20"
                    y="18"
                    width="160"
                    height="90"
                    rx="3"
                    fill="rgba(59,130,246,0.05)"
                    stroke="rgba(59,130,246,0.2)"
                  />
                  <path d="M4 118h192l-8 14H12l-8-14z" strokeWidth="2" />
                </svg>
              </div>
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    className={`flex aspect-square flex-1 cursor-pointer items-center justify-center rounded-2xl border bg-white transition-colors duration-200 ${i === 1 ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'}`}
                    aria-label={`Ảnh ${i}`}
                  >
                    <svg
                      viewBox="0 0 40 30"
                      className="h-auto w-8 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="2" y="2" width="36" height="26" rx="2" />
                      <rect
                        x="5"
                        y="5"
                        width="30"
                        height="20"
                        rx="1"
                        fill="rgba(59,130,246,0.04)"
                        stroke="rgba(59,130,246,0.15)"
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${product.badgeColor}`}
                >
                  {product.badge}
                </span>
                <span className="text-xs text-slate-400">SKU: {product.sku}</span>
              </div>
              <h1 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">{product.name}</h1>
              <p className="mb-4 text-sm leading-relaxed text-slate-500">{product.description}</p>

              {/* Rating */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex gap-1" aria-label={`${product.rating} sao`}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 ${s <= Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-200'} fill-current`}
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-900">{product.rating}</span>
                <span className="text-sm text-slate-400">{product.reviews} đánh giá</span>
                <span
                  className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-rose-500'}`}
                >
                  {product.inStock ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>

              {/* Price + Variants + Colors + Qty + CTAs + Trust — client */}
              <ProductActions
                slug={product.slug}
                price={product.price}
                old={product.old}
                discount={product.discount}
                variants={product.variants}
                colors={product.colors}
                stockCount={product.stockCount}
                warranty={product.warranty}
              />
            </div>
          </div>
          {/* Specs */}
          <div className="mb-16">
            <div className="mb-8 flex gap-1 border-b border-slate-200">
              {['Thông số kỹ thuật', `Đánh giá (${product.reviews})`, 'Mô tả'].map((tab, i) => (
                <button
                  key={tab}
                  className={`-mb-px cursor-pointer border-b-2 px-5 py-3 text-sm font-medium transition-colors duration-200 ${i === 0 ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:text-slate-900'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <caption className="sr-only">Thông số kỹ thuật {product.name}</caption>
                <tbody>
                  {product.specs.map((s, i) => (
                    <tr key={s.label} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="w-44 border-r border-slate-100 px-6 py-3.5 font-medium text-slate-600">
                        {s.label}
                      </td>
                      <td className="px-6 py-3.5 text-slate-900">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-16">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Đánh giá từ khách hàng</h2>
              <button className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100">
                Viết đánh giá
              </button>
            </div>
            <div className="mb-6 flex items-center gap-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900">{product.rating}</div>
                <div className="my-2 flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      viewBox="0 0 24 24"
                      className={`h-4 w-4 ${s <= Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-200'} fill-current`}
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <div className="text-xs text-slate-400">{product.reviews} đánh giá</div>
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
                    <span className="w-4 text-xs text-slate-500">{star}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 shrink-0 fill-current text-amber-400"
                      aria-hidden="true"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-slate-400">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {reviewsData.map((r) => (
                <article
                  key={r.name}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
                        aria-hidden="true"
                      >
                        {r.name
                          .split(' ')
                          .map((n) => n[0])
                          .slice(-2)
                          .join('')}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-400">{r.role}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                  <div className="mb-2 flex gap-1" aria-label={`${r.rating} sao`}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <svg
                        key={s}
                        viewBox="0 0 24 24"
                        className={`h-3.5 w-3.5 ${s <= r.rating ? 'text-amber-400' : 'text-slate-200'} fill-current`}
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{r.text}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div>
              <h2 className="mb-6 text-xl font-bold text-slate-900">Sản phẩm liên quan</h2>
              <div className="grid gap-5 sm:grid-cols-3">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/products/${p.slug}`}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-lg"
                  >
                    <div className="flex h-40 items-center justify-center border-b border-slate-100 bg-slate-50">
                      <svg
                        viewBox="0 0 80 60"
                        className="h-auto w-20 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        aria-hidden="true"
                      >
                        <rect x="5" y="5" width="70" height="50" rx="4" />
                        <rect
                          x="12"
                          y="12"
                          width="56"
                          height="36"
                          rx="2"
                          fill="rgba(59,130,246,0.04)"
                          stroke="rgba(59,130,246,0.15)"
                        />
                      </svg>
                    </div>
                    <div className="p-4">
                      <div className="mb-1 text-xs text-slate-400">{p.cat}</div>
                      <div className="mb-3 text-sm font-semibold text-slate-900">{p.name}</div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{p.price}</div>
                          <div className="text-xs text-slate-300 line-through">{p.old}</div>
                        </div>
                        <button className="cursor-pointer rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-slate-700">
                          Mua
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
