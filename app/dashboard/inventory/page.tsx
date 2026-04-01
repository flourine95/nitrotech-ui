"use client"
import { getAllProducts } from "@/lib/products"

export default function DashboardInventoryPage() {
  const products = getAllProducts()
  const lowStock = products.filter((p) => p.stockCount < 10)
  const outOfStock = products.filter((p) => !p.inStock)
  const healthy = products.filter((p) => p.inStock && p.stockCount >= 10)

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Kho hàng</h1>
        <p className="text-sm text-slate-500 mt-1">Theo dõi tồn kho và cảnh báo sắp hết hàng</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{healthy.length}</div>
            <div className="text-sm text-slate-500">Đủ hàng</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{lowStock.length}</div>
            <div className="text-sm text-slate-500">Sắp hết hàng (&lt;10)</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <div>
            <div className="text-sm font-semibold text-amber-800">{lowStock.length} sản phẩm sắp hết hàng</div>
            <div className="text-xs text-amber-700 mt-0.5">
              {lowStock.map((p) => p.name).join(", ")}
            </div>
          </div>
        </div>
      )}

      {/* Inventory table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sản phẩm</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Danh mục</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tồn kho</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mức tồn</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => {
                const pct = Math.min((p.stockCount / 30) * 100, 100)
                const barColor = p.stockCount === 0 ? "bg-rose-500" : p.stockCount < 10 ? "bg-amber-500" : "bg-green-500"
                return (
                  <tr key={p.slug} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-400">{p.brand}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{p.cat}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-lg font-bold ${p.stockCount === 0 ? "text-rose-600" : p.stockCount < 10 ? "text-amber-600" : "text-slate-900"}`}>
                        {p.stockCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-full bg-slate-100 rounded-full h-2 min-w-[80px]">
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
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Hết hàng</span>
                      ) : p.stockCount < 10 ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Sắp hết</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">Đủ hàng</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer">
                        Nhập hàng
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
