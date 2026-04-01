"use client"
import { useState } from "react"
import Link from "next/link"
import { getAllProducts } from "@/lib/products"

const categories = ["Tất cả", "Laptop", "Laptop Gaming", "Card đồ họa", "CPU", "SSD NVMe", "RAM", "Màn hình"]

export default function DashboardProductsPage() {
  const allProducts = getAllProducts()
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState("Tất cả")

  const filtered = allProducts.filter((p) => {
    const matchCat = cat === "Tất cả" || p.cat === cat
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="text-sm text-slate-500 mt-1">{allProducts.length} sản phẩm trong kho</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Thêm sản phẩm
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Tìm theo tên, thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-0 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder:text-slate-400"
            aria-label="Tìm kiếm sản phẩm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                cat === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sản phẩm</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Danh mục</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Giá</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tồn kho</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Đánh giá</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Trạng thái</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => (
                <tr key={p.slug} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.brand}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">{p.cat}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="font-semibold text-slate-900">{p.price}</div>
                    <div className="text-xs text-slate-400 line-through">{p.old}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`font-semibold ${p.stockCount < 10 ? "text-rose-600" : "text-slate-900"}`}>
                      {p.stockCount}
                    </span>
                    {p.stockCount < 10 && (
                      <div className="text-xs text-rose-500 mt-0.5">Sắp hết</div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-amber-400 fill-current" aria-hidden="true">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-sm font-semibold text-slate-900">{p.rating}</span>
                      <span className="text-xs text-slate-400">({p.reviews})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${p.inStock ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {p.inStock ? "Còn hàng" : "Hết hàng"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/products/${p.slug}`}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                        aria-label={`Xem ${p.name}`}
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer" aria-label={`Sửa ${p.name}`}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" aria-label={`Xóa ${p.name}`}>
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
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
            <div className="text-center py-16 text-slate-400">
              <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Không tìm thấy sản phẩm nào
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
