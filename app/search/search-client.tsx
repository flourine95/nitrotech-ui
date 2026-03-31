"use client"
import { useState } from "react"
import { ProductCard } from "@/components/product-card"

const filters = ["Tất cả", "Laptop", "GPU", "CPU", "RAM", "Màn hình"]

const products = [
  { slug: "macbook-pro-m4", name: "MacBook Pro M4 14 inch", cat: "Laptop", price: "49.990.000đ", old: "54.990.000đ", badge: "Mới", badgeColor: "bg-blue-100 text-blue-700", rating: 5, reviews: 128, specs: ["M4 10-core", "16GB RAM", "512GB SSD"] },
  { slug: "rtx-4090", name: "ASUS ROG STRIX RTX 4090 OC 24GB", cat: "GPU", price: "42.500.000đ", old: "46.000.000đ", badge: "Hot", badgeColor: "bg-rose-100 text-rose-700", rating: 5, reviews: 87, specs: ["24GB GDDR6X", "PCIe 4.0"] },
  { slug: "ryzen-9-9950x", name: "AMD Ryzen 9 9950X", cat: "CPU", price: "18.900.000đ", old: "21.000.000đ", badge: "Sale", badgeColor: "bg-amber-100 text-amber-700", rating: 4, reviews: 54, specs: ["16 nhân 32 luồng", "5.7GHz"] },
  { slug: "corsair-ddr5-64gb", name: "Corsair Vengeance DDR5 64GB 6000MHz", cat: "RAM", price: "4.200.000đ", old: "4.800.000đ", badge: "Mới", badgeColor: "bg-blue-100 text-blue-700", rating: 4, reviews: 32, specs: ["64GB (2x32GB)", "DDR5-6000"] },
  { slug: "lg-oled-27", name: "LG UltraGear OLED 27\" 240Hz", cat: "Màn hình", price: "22.500.000đ", old: "25.000.000đ", badge: "Hot", badgeColor: "bg-rose-100 text-rose-700", rating: 5, reviews: 61, specs: ["27\" OLED", "2560x1440", "240Hz"] },
  { slug: "asus-rog-zephyrus", name: "ASUS ROG Zephyrus G16 RTX 4080", cat: "Laptop", price: "65.000.000đ", old: "70.000.000đ", badge: "Gaming", badgeColor: "bg-violet-100 text-violet-700", rating: 4, reviews: 43, specs: ["RTX 4080", "32GB DDR5", "1TB SSD"] },
]

const suggestions = ["MacBook Pro", "RTX 4090", "Ryzen 9", "DDR5 RAM", "Màn hình OLED", "Laptop Gaming"]

export function SearchClient() {
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("Tất cả")

  const filtered = products.filter((p) => {
    const matchFilter = activeFilter === "Tất cả" || p.cat === activeFilter
    const matchQuery = query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.cat.toLowerCase().includes(query.toLowerCase())
    return matchFilter && matchQuery
  })

  const hasResults = filtered.length > 0
  const showEmpty = query !== "" && !hasResults

  return (
    <>
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <svg viewBox="0 0 24 24" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            aria-label="Tìm kiếm sản phẩm"
            className="w-full pl-14 pr-5 py-4 rounded-full border border-slate-200 text-slate-900 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-sm transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Xóa tìm kiếm"
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors duration-150 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
        {query && (
          <p className="text-sm text-slate-500 mt-2 text-center">
            {hasResults ? `Tìm thấy ${filtered.length} kết quả cho "${query}"` : `Không tìm thấy kết quả cho "${query}"`}
          </p>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
              activeFilter === f
                ? "bg-slate-900 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Results */}
      {showEmpty ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy kết quả</h2>
          <p className="text-slate-500 mb-6">Thử tìm kiếm với từ khóa khác hoặc xem các gợi ý bên dưới.</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="px-4 py-2 rounded-full text-sm bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : query === "" ? (
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Gợi ý tìm kiếm</h2>
          <div className="flex flex-wrap gap-2 mb-10">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-white border border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                {s}
              </button>
            ))}
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Sản phẩm nổi bật</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => <ProductCard key={p.slug} {...p} />)}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => <ProductCard key={p.slug} {...p} />)}
        </div>
      )}
    </>
  )
}
