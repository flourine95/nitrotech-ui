'use client';
import { getAllProducts } from '@/lib/data/products';

export default function DashboardInventoryPage() {
  const products = getAllProducts();
  const lowStock = products.filter((p) => p.stockCount < 10);
  const outOfStock = products.filter((p) => !p.inStock);
  const healthy = products.filter((p) => p.inStock && p.stockCount >= 10);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kho hàng</h1>
        <p className="mt-1 text-sm text-slate-500">Theo dõi tồn kho và cảnh báo sắp hết hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{healthy.length}</div>
            <div className="text-sm text-slate-500">Đủ hàng</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{lowStock.length}</div>
            <div className="text-sm text-slate-500">Sắp hết hàng (&lt;10)</div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-rose-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{outOfStock.length}</div>
            <div className="text-sm text-slate-500">Hết hàng</div>
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <div className="text-sm font-semibold text-amber-800">
              {lowStock.length} sản phẩm sắp hết hàng
            </div>
            <div className="mt-0.5 text-xs text-amber-700">
              {lowStock.map((p) => p.name).join(', ')}
            </div>
          </div>
        </div>
      )}

      {/* Inventory table */}
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
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Tồn kho
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Mức tồn
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const pct = Math.min((p.stockCount / 30) * 100, 100);
                const barColor =
                  p.stockCount === 0
                    ? 'bg-rose-500'
                    : p.stockCount < 10
                      ? 'bg-amber-500'
                      : 'bg-green-500';
                return (
                  <tr key={p.slug} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.brand}</div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{p.sku}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {p.cat}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`text-lg font-bold ${p.stockCount === 0 ? 'text-rose-600' : p.stockCount < 10 ? 'text-amber-600' : 'text-slate-900'}`}
                      >
                        {p.stockCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-2 w-full min-w-20 rounded-full bg-slate-100">
                        <div
                          className={`h-2 rounded-full transition-all ${barColor}`}
                          style={{ width: `${pct}%` }}
                          role="progressbar"
                          aria-valuenow={p.stockCount}
                          aria-valuemin={0}
                          aria-valuemax={30}
                          aria-label={`Tồn kho ${p.stockCount}/30`}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      {p.stockCount === 0 ? (
                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">
                          Hết hàng
                        </span>
                      ) : p.stockCount < 10 ? (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Sắp hết
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                          Đủ hàng
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button className="cursor-pointer rounded-lg bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10">
                        Nhập hàng
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
