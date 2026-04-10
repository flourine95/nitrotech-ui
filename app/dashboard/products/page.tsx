'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getAllProducts } from '@/lib/api/products';

const categories = [
  'Tất cả',
  'Laptop',
  'Laptop Gaming',
  'Card đồ họa',
  'CPU',
  'SSD NVMe',
  'RAM',
  'Màn hình',
];

export default function DashboardProductsPage() {
  const allProducts = getAllProducts();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Tất cả');

  const filtered = allProducts.filter((p) => {
    const matchCat = cat === 'Tất cả' || p.cat === cat;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="mt-1 text-sm text-slate-500">{allProducts.length} sản phẩm trong kho</p>
        </div>
        <button className="flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Tìm theo tên, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 bg-slate-100 py-2 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            aria-label="Tìm kiếm sản phẩm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                cat === c
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Sản phẩm
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  SKU
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Danh mục
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Giá
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Tồn kho
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Đánh giá
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.slug} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{p.brand}</div>
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.sku}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {p.cat}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="font-semibold text-slate-900">{p.price}</div>
                    <div className="text-xs text-slate-400 line-through">{p.old}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`font-semibold ${p.stockCount < 10 ? 'text-rose-600' : 'text-slate-900'}`}
                    >
                      {p.stockCount}
                    </span>
                    {p.stockCount < 10 && (
                      <div className="mt-0.5 text-xs text-rose-500">Sắp hết</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3.5 w-3.5 fill-current text-amber-400"
                        aria-hidden="true"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-900">{p.rating}</span>
                      <span className="text-xs text-slate-400">({p.reviews})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${p.inStock ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {p.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/products/${p.slug}`}
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        aria-label={`Xem ${p.name}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <button
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                        aria-label={`Sửa ${p.name}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                        aria-label={`Xóa ${p.name}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                          <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              <svg
                viewBox="0 0 24 24"
                className="mx-auto mb-3 h-10 w-10 text-slate-300"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
