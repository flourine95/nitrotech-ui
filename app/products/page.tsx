import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ProductCard } from '@/components/product-card';

export const metadata: Metadata = { title: 'Sản phẩm' };

const allProducts = [
  {
    slug: 'macbook-pro-m4',
    name: 'MacBook Pro M4',
    cat: 'Laptop',
    price: '42.990.000₫',
    old: '47.990.000₫',
    badge: 'Mới',
    badgeColor: 'bg-blue-100 text-blue-700',
    rating: 4.9,
    reviews: 189,
    specs: ['M4 Pro', '16GB', '512GB SSD'],
  },
  {
    slug: 'rtx-4080-super',
    name: 'RTX 4080 Super',
    cat: 'Card đồ họa',
    price: '22.500.000₫',
    old: '25.000.000₫',
    badge: '-10%',
    badgeColor: 'bg-amber-100 text-amber-700',
    rating: 4.7,
    reviews: 156,
    specs: ['16GB GDDR6X', '256-bit', '320W'],
  },
  {
    slug: 'asus-rog-strix-g16',
    name: 'ASUS ROG Strix G16',
    cat: 'Laptop Gaming',
    price: '35.990.000₫',
    old: '39.990.000₫',
    badge: 'Hot',
    badgeColor: 'bg-rose-100 text-rose-700',
    rating: 4.8,
    reviews: 234,
    specs: ['RTX 4070', 'i9-14900H', '32GB'],
  },
  {
    slug: 'samsung-990-pro-2tb',
    name: 'Samsung 990 Pro 2TB',
    cat: 'SSD NVMe',
    price: '3.290.000₫',
    old: '3.890.000₫',
    badge: 'Sale',
    badgeColor: 'bg-green-100 text-green-700',
    rating: 4.9,
    reviews: 412,
    specs: ['PCIe 4.0', '7450MB/s', 'TLC'],
  },
  {
    slug: 'intel-i9-14900k',
    name: 'Intel Core i9-14900K',
    cat: 'CPU',
    price: '8.990.000₫',
    old: '10.500.000₫',
    badge: 'Sale',
    badgeColor: 'bg-green-100 text-green-700',
    rating: 4.8,
    reviews: 98,
    specs: ['24 nhân', '6.0GHz', '125W TDP'],
  },
  {
    slug: 'lg-ultragear-27',
    name: 'LG UltraGear 27" 4K',
    cat: 'Màn hình',
    price: '12.990.000₫',
    old: '14.500.000₫',
    badge: '-10%',
    badgeColor: 'bg-amber-100 text-amber-700',
    rating: 4.7,
    reviews: 203,
    specs: ['4K 144Hz', 'IPS', '1ms GTG'],
  },
  {
    slug: 'corsair-32gb-ddr5',
    name: 'Corsair Vengeance 32GB DDR5',
    cat: 'RAM',
    price: '2.490.000₫',
    old: '2.990.000₫',
    badge: 'Sale',
    badgeColor: 'bg-green-100 text-green-700',
    rating: 4.8,
    reviews: 167,
    specs: ['DDR5-6000', '2x16GB', 'CL36'],
  },
  {
    slug: 'dell-xps-15',
    name: 'Dell XPS 15 OLED',
    cat: 'Laptop',
    price: '38.500.000₫',
    old: '42.000.000₫',
    badge: 'Mới',
    badgeColor: 'bg-blue-100 text-blue-700',
    rating: 4.6,
    reviews: 87,
    specs: ['i7-13700H', '32GB', 'OLED 3.5K'],
  },
];

const filterCategories = [
  'Tất cả',
  'Laptop',
  'Laptop Gaming',
  'CPU',
  'Card đồ họa',
  'RAM',
  'SSD NVMe',
  'Màn hình',
];
const sortOptions = ['Nổi bật', 'Giá tăng dần', 'Giá giảm dần', 'Mới nhất', 'Đánh giá cao'];
const priceRanges = ['Tất cả', 'Dưới 5 triệu', '5 - 15 triệu', '15 - 30 triệu', 'Trên 30 triệu'];
const brands = ['Apple', 'ASUS', 'Dell', 'Samsung', 'Intel', 'Corsair', 'LG', 'MSI'];

export default function ProductsPage() {
  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-sm text-slate-400">
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
            <span className="font-medium text-slate-700">Sản phẩm</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex gap-8">
            {/* ── Sidebar filter ── */}
            <aside className="hidden w-60 shrink-0 lg:block" aria-label="Bộ lọc sản phẩm">
              <div className="sticky top-36 space-y-6">
                {/* Category */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Danh mục</h3>
                  <ul className="space-y-1">
                    {filterCategories.map((c, i) => (
                      <li key={c}>
                        <a
                          href="#"
                          className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${i === 0 ? 'bg-slate-900 font-medium text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                        >
                          {c}
                          {i === 0 && (
                            <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                              8
                            </span>
                          )}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price */}
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Khoảng giá</h3>
                  <ul className="space-y-1">
                    {priceRanges.map((r, i) => (
                      <li key={r}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-100">
                          <input
                            type="radio"
                            name="price"
                            defaultChecked={i === 0}
                            className="accent-slate-900"
                          />
                          {r}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Brand */}
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Thương hiệu</h3>
                  <ul className="space-y-1">
                    {brands.map((b) => (
                      <li key={b}>
                        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-100">
                          <input type="checkbox" className="rounded accent-slate-900" />
                          {b}
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Rating */}
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Đánh giá</h3>
                  {[5, 4, 3].map((r) => (
                    <label
                      key={r}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-100"
                    >
                      <input type="checkbox" className="rounded accent-slate-900" />
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <svg
                            key={s}
                            viewBox="0 0 24 24"
                            className={`h-3.5 w-3.5 ${s <= r ? 'text-amber-400' : 'text-slate-200'} fill-current`}
                            aria-hidden="true"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">trở lên</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* ── Product grid ── */}
            <div className="min-w-0 flex-1">
              {/* Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-500">
                  <span className="font-semibold text-slate-900">{allProducts.length}</span> sản
                  phẩm
                </p>
                <div className="flex items-center gap-3">
                  {/* Mobile filter */}
                  <button className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-100 lg:hidden">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                    </svg>
                    Lọc
                  </button>
                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort" className="hidden text-sm text-slate-500 sm:block">
                      Sắp xếp:
                    </label>
                    <select
                      id="sort"
                      className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                    >
                      {sortOptions.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  {/* View toggle */}
                  <div className="flex items-center overflow-hidden rounded-full border border-slate-200">
                    <button
                      className="cursor-pointer bg-slate-900 p-2 text-white"
                      aria-label="Dạng lưới"
                      aria-pressed="true"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <rect x="3" y="3" width="7" height="7" />
                        <rect x="14" y="3" width="7" height="7" />
                        <rect x="3" y="14" width="7" height="7" />
                        <rect x="14" y="14" width="7" height="7" />
                      </svg>
                    </button>
                    <button
                      className="cursor-pointer p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Dạng danh sách"
                      aria-pressed="false"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {allProducts.map((p) => (
                  <ProductCard key={p.slug} {...p} />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  className="cursor-pointer rounded-full border border-slate-200 p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Trang trước"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                {[1, 2, 3, '...', 8].map((p, i) => (
                  <button
                    key={i}
                    className={`h-9 w-9 cursor-pointer rounded-full text-sm font-medium transition-colors duration-200 ${p === 1 ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                    aria-current={p === 1 ? 'page' : undefined}
                  >
                    {p}
                  </button>
                ))}
                <button
                  className="cursor-pointer rounded-full border border-slate-200 p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Trang sau"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
