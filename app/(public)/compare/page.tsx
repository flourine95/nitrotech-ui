'use client';
import { useState } from 'react';
import Link from 'next/link';
import { X, Plus, AlertTriangle, Search } from 'lucide-react';
import { useCompare } from '@/components/compare-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ProductImagePlaceholder } from '@/components/product-image-placeholder';

const allProducts = [
  {
    slug: 'macbook-pro-m4',
    name: 'MacBook Pro M4',
    cat: 'Laptop',
    price: '42.990.000₫',
  },
  {
    slug: 'dell-xps-15',
    name: 'Dell XPS 15 OLED',
    cat: 'Laptop',
    price: '38.500.000₫',
  },
  {
    slug: 'asus-rog-strix-g16',
    name: 'ASUS ROG Strix G16',
    cat: 'Laptop Gaming',
    price: '35.990.000₫',
  },
  {
    slug: 'rtx-4080-super',
    name: 'RTX 4080 Super',
    cat: 'GPU',
    price: '22.500.000₫',
  },
  {
    slug: 'intel-i9-14900k',
    name: 'Intel Core i9-14900K',
    cat: 'CPU',
    price: '8.990.000₫',
  },
  {
    slug: 'samsung-990-pro-2tb',
    name: 'Samsung 990 Pro 2TB',
    cat: 'SSD NVMe',
    price: '3.290.000₫',
  },
  {
    slug: 'corsair-32gb-ddr5',
    name: 'Corsair 32GB DDR5',
    cat: 'RAM',
    price: '2.490.000₫',
  },
  {
    slug: 'lg-ultragear-27',
    name: 'LG UltraGear 27" 4K',
    cat: 'Màn hình',
    price: '12.990.000₫',
  },
];

const productSpecs: Record<string, Record<string, string>> = {
  'macbook-pro-m4': {
    'Chip / CPU': 'Apple M4 Pro 14-core',
    RAM: '16GB Unified',
    'Bộ nhớ': '512GB SSD',
    'Màn hình': '16.2" Retina XDR 120Hz',
    Pin: 'Đến 24 giờ',
    'Trọng lượng': '2.14 kg',
    'Hệ điều hành': 'macOS Sequoia',
    'Bảo hành': '12 tháng',
  },
  'dell-xps-15': {
    'Chip / CPU': 'Intel Core i7-13700H',
    RAM: '32GB DDR5',
    'Bộ nhớ': '1TB SSD',
    'Màn hình': '15.6" OLED 3.5K 60Hz',
    Pin: 'Đến 13 giờ',
    'Trọng lượng': '1.86 kg',
    'Hệ điều hành': 'Windows 11 Home',
    'Bảo hành': '12 tháng',
  },
  'asus-rog-strix-g16': {
    'Chip / CPU': 'Intel Core i9-14900H',
    RAM: '32GB DDR5',
    'Bộ nhớ': '1TB SSD',
    'Màn hình': '16" QHD 240Hz IPS',
    Pin: 'Đến 8 giờ',
    'Trọng lượng': '2.5 kg',
    'Hệ điều hành': 'Windows 11 Home',
    'Bảo hành': '24 tháng',
  },
  'rtx-4080-super': {
    'Chip / CPU': '—',
    RAM: '16GB GDDR6X',
    'Bộ nhớ': '—',
    'Màn hình': '—',
    Pin: '—',
    'Trọng lượng': '—',
    'Hệ điều hành': '—',
    'Bảo hành': '36 tháng',
  },
  'intel-i9-14900k': {
    'Chip / CPU': '24 nhân / 32 luồng',
    RAM: '—',
    'Bộ nhớ': '—',
    'Màn hình': '—',
    Pin: '—',
    'Trọng lượng': '—',
    'Hệ điều hành': '—',
    'Bảo hành': '36 tháng',
  },
  'samsung-990-pro-2tb': {
    'Chip / CPU': '—',
    RAM: '—',
    'Bộ nhớ': '2TB NVMe PCIe 4.0',
    'Màn hình': '—',
    Pin: '—',
    'Trọng lượng': '—',
    'Hệ điều hành': '—',
    'Bảo hành': '60 tháng',
  },
  'corsair-32gb-ddr5': {
    'Chip / CPU': '—',
    RAM: '32GB DDR5-6000',
    'Bộ nhớ': '—',
    'Màn hình': '—',
    Pin: '—',
    'Trọng lượng': '—',
    'Hệ điều hành': '—',
    'Bảo hành': 'Lifetime',
  },
  'lg-ultragear-27': {
    'Chip / CPU': '—',
    RAM: '—',
    'Bộ nhớ': '—',
    'Màn hình': '27" 4K 144Hz IPS',
    Pin: '—',
    'Trọng lượng': '—',
    'Hệ điều hành': '—',
    'Bảo hành': '36 tháng',
  },
};

const specKeys = [
  'Chip / CPU',
  'RAM',
  'Bộ nhớ',
  'Màn hình',
  'Pin',
  'Trọng lượng',
  'Hệ điều hành',
  'Bảo hành',
];
const MAX = 3;

function SearchInput({
  value,
  onValueChange,
  placeholder,
  autoFocus,
}: {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        autoFocus={autoFocus}
        className="h-9 rounded-full pl-9 text-sm"
      />
    </div>
  );
}

export default function ComparePage() {
  const { items, toggle, clear } = useCompare();
  const [showPicker, setShowPicker] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dùng items từ context làm nguồn duy nhất
  const slugs = items.map((i) => i.slug);
  const products = slugs
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter(Boolean) as typeof allProducts;
  const slots = Array.from({ length: MAX });

  const cats = [...new Set(items.map((i) => i.cat))];
  const mixedCategories = cats.length > 1;
  const selectedSlugs = new Set(slugs);

  // Filter products based on search query
  const filteredProducts = allProducts
    .filter((ap) => !selectedSlugs.has(ap.slug))
    .filter((ap) => {
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return ap.name.toLowerCase().includes(query) || ap.cat.toLowerCase().includes(query);
    });

  function addSlot(slot: number, slug: string) {
    const item = allProducts.find((p) => p.slug === slug);
    if (!item) return;
    // Nếu slot đã có sản phẩm, xóa cái cũ trước
    if (slugs[slot]) toggle({ slug: slugs[slot], name: '', cat: '' });
    toggle({ slug: item.slug, name: item.name, cat: item.cat });
    setShowPicker(null);
    setSearchQuery(''); // Reset search when closing
  }

  return (
    <main className="min-h-screen bg-muted/30 pb-24">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">So sánh sản phẩm</h1>
              {items.length > 0 && (
                <p className="mt-1 text-sm text-slate-400">
                  Đang so sánh {items.length}/{MAX} sản phẩm
                </p>
              )}
            </div>
            {items.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-auto rounded-full px-4 py-2.5 text-sm font-semibold"
                  asChild
                >
                  <Link href="/products">
                    <Plus className="mr-2 size-4" />
                    Thêm sản phẩm
                  </Link>
                </Button>
                <Button
                  onClick={clear}
                  variant="outline"
                  className="h-auto rounded-full px-4 py-2.5 text-sm font-semibold"
                >
                  Xóa tất cả
                </Button>
              </div>
            )}
          </div>

          {/* Mixed category warning */}
          {mixedCategories && (
            <Alert variant="default" className="mb-6 border-amber-200 bg-amber-50 text-amber-800">
              <AlertTriangle className="size-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Đang so sánh khác danh mục</AlertTitle>
              <AlertDescription className="text-amber-700">
                {cats.join(' và ')} có thông số khác nhau, một số ô sẽ hiển thị &quot;-&quot;
              </AlertDescription>
            </Alert>
          )}

          {items.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  viewBox="0 0 24 24"
                  className="size-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="18" rx="1" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">Chưa có sản phẩm để so sánh</h2>
              <p className="mb-8 text-sm text-slate-500">
                Thêm 2-3 sản phẩm để xem thông số và giá cạnh nhau
              </p>

              {/* Empty slots */}
              <div className="mx-auto mb-8 flex max-w-3xl items-center justify-center gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="relative w-48">
                    <Button
                      onClick={() => setShowPicker(i)}
                      variant="ghost"
                      className="flex h-48 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:bg-transparent hover:text-blue-500"
                    >
                      <Plus className="size-10" />
                      <span className="text-sm font-medium">Sản phẩm {i + 1}</span>
                    </Button>
                    {showPicker === i && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => {
                            setShowPicker(null);
                            setSearchQuery('');
                          }}
                          aria-hidden="true"
                        />
                        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                          <div className="border-b border-slate-100 p-3">
                            <SearchInput
                              value={searchQuery}
                              onValueChange={setSearchQuery}
                              placeholder="Tìm sản phẩm..."
                              autoFocus
                            />
                          </div>
                          <ul className="max-h-60 overflow-y-auto py-1">
                            {filteredProducts.map((ap) => (
                              <li key={ap.slug}>
                                <Button
                                  onClick={() => addSlot(i, ap.slug)}
                                  variant="ghost"
                                  className="h-auto w-full justify-start rounded-none px-4 py-2.5 hover:bg-slate-50"
                                >
                                  <div className="text-left">
                                    <div className="text-sm font-medium text-slate-900">
                                      {ap.name}
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {ap.cat} · {ap.price}
                                    </div>
                                  </div>
                                </Button>
                              </li>
                            ))}
                            {filteredProducts.length === 0 && (
                              <li className="px-4 py-3 text-center">
                                <p className="text-sm text-slate-500 font-normal antialiased">
                                  {searchQuery.trim() 
                                    ? 'Không tìm thấy sản phẩm'
                                    : 'Không còn sản phẩm để thêm'
                                  }
                                </p>
                              </li>
                            )}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick suggestions */}
              <div className="mb-6 flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400">Gợi ý:</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto rounded-full px-3 py-1.5 text-xs"
                  asChild
                >
                  <Link href="/products?category=laptop-gaming">Laptop Gaming</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto rounded-full px-3 py-1.5 text-xs"
                  asChild
                >
                  <Link href="/products?category=gpu">Card đồ họa</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-auto rounded-full px-3 py-1.5 text-xs"
                  asChild
                >
                  <Link href="/products?category=ssd">SSD NVMe</Link>
                </Button>
              </div>

              {/* Primary CTA */}
              <Button className="h-auto rounded-full px-8 py-3 font-semibold" asChild>
                <Link href="/products">
                  Chọn sản phẩm
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-140">
                <thead>
                  <tr>
                    {/* Label col */}
                    <th className="w-36 pr-4 pb-6 text-left align-bottom">
                      <span className="text-sm font-semibold text-slate-500">Thông số</span>
                    </th>

                    {/* Product cols — fixed height card */}
                    {slots.map((_, i) => {
                      const p = products[i];
                      return (
                        <th key={i} className="w-56 px-2 pb-6 align-top">
                          {p ? (
                            <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
                              <Button
                                onClick={() =>
                                  toggle({
                                    slug: p.slug,
                                    name: p.name,
                                    cat: p.cat,
                                  })
                                }
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 size-7 rounded-full p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                                aria-label={`Xóa ${p.name}`}
                              >
                                <X className="size-3.5" />
                              </Button>
                              {/* Image */}
                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mb-3 flex h-32 w-full shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 transition-colors hover:border-slate-200 hover:bg-slate-100"
                              >
                                <ProductImagePlaceholder size="lg" />
                              </Link>
                              <div className="mb-1 shrink-0 text-xs text-slate-400">{p.cat}</div>
                              <Link
                                href={`/products/${p.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mb-2 line-clamp-2 text-sm leading-snug font-semibold text-slate-900 transition-colors hover:text-blue-600 hover:underline"
                              >
                                {p.name}
                              </Link>
                              <div className="shrink-0 text-base font-bold text-blue-600">
                                {p.price}
                              </div>
                            </div>
                          ) : (
                            <div className="relative h-64">
                              <Button
                                onClick={() => setShowPicker(i)}
                                variant="ghost"
                                className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-blue-400 hover:bg-transparent hover:text-blue-500"
                              >
                                <Plus className="size-8" />
                                <span className="text-xs font-medium">Thêm sản phẩm</span>
                              </Button>
                              {showPicker === i && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => {
                                      setShowPicker(null);
                                      setSearchQuery('');
                                    }}
                                    aria-hidden="true"
                                  />
                                  <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                    <div className="border-b border-slate-100 p-3">
                                      <SearchInput
                                        value={searchQuery}
                                        onValueChange={setSearchQuery}
                                        placeholder="Tìm sản phẩm..."
                                        autoFocus
                                      />
                                    </div>
                                    <ul className="max-h-60 overflow-y-auto py-1">
                                      {filteredProducts.map((ap) => (
                                        <li key={ap.slug}>
                                          <Button
                                            onClick={() => addSlot(i, ap.slug)}
                                            variant="ghost"
                                            className="h-auto w-full justify-start rounded-none px-4 py-2.5 hover:bg-slate-50"
                                          >
                                            <div className="text-left">
                                              <div className="text-sm font-medium text-slate-900">
                                                {ap.name}
                                              </div>
                                              <div className="text-xs text-slate-400">
                                                {ap.cat} · {ap.price}
                                              </div>
                                            </div>
                                          </Button>
                                        </li>
                                      ))}
                                      {filteredProducts.length === 0 && (
                                        <li className="px-4 py-3 text-center">
                                          <p className="text-sm text-slate-500 font-normal antialiased">
                                            {searchQuery.trim() 
                                              ? 'Không tìm thấy sản phẩm'
                                              : 'Không còn sản phẩm để thêm'
                                            }
                                          </p>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {specKeys.map((key, ri) => (
                    <tr key={key} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                      <td className="rounded-l-xl py-3.5 pr-4 pl-3 text-sm font-medium text-slate-500">
                        {key}
                      </td>
                      {slots.map((_, i) => {
                        const p = products[i];
                        const val = p ? (productSpecs[p.slug]?.[key] ?? '—') : null;
                        return (
                          <td
                            key={i}
                            className={`px-4 py-3.5 text-sm ${i === slots.length - 1 ? 'rounded-r-xl' : ''}`}
                          >
                            {p ? (
                              <span className={val === '—' ? 'text-slate-300' : 'text-slate-900'}>
                                {val}
                              </span>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
  );
}
