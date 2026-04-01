"use client"
import { useState, useRef, useEffect } from "react"
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
const initialRecent = ["MacBook Pro M4", "RTX 4080", "Màn hình 4K"]
const trending = ["RTX 4090", "MacBook Pro M4", "Ryzen 9 9950X", "DDR5 64GB", "OLED 27\""]

export function SearchClient() {
  const [query, setQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("Tất cả")
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState(initialRecent)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = products.filter((p) => {
    const matchFilter = activeFilter === "Tất cả" || p.cat === activeFilter
    const matchQuery = query === "" || p.name.toLowerCase().includes(query.toLowerCase()) || p.cat.toLowerCase().includes(query.toLowerCase())
    return matchFilter && matchQuery
  })

  // Autocomplete suggestions from product names
  const autoSuggestions = query.length >= 2
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : []

  const showDropdown = focused && (query === "" || autoSuggestions.length > 0)
  const hasResults = filtered.length > 0
  const showEmpty = query !== "" && !hasResults

  function submitSearch(val: string) {
    setQuery(val)
    setFocused(false)
    if (val && !recent.includes(val)) {
      setRecent((prev) => [val, ...prev].slice(0, 5))
    }
  }

  function clearRecent(item: string) {
    setRecent((prev) => prev.filter((r) => r !== item))
  }

  return (
    <>
      {/* Search bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <svg viewBox="0 0 24 24" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch(query)}
            placeholder="Tìm kiếm sản phẩm..."
            aria-label="Tìm kiếm sản phẩm"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            className="w-full pl-14 pr-12 py-4 rounded-full border border-slate-200 text-slate-900 text-base placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent shadow-sm transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus() }}
              aria-label="Xóa tìm kiếm"
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors duration-150 cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden"
              role="listbox"
            >
              {/* Autocomplete results */}
              {autoSuggestions.length > 0 && (
                <div className="py-2">
                  {autoSuggestions.map((p) => (
                    <button
                      key={p.slug}
                      onClick={() => submitSearch(p.name)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors duration-150 cursor-pointer text-left"
                      role="option"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <div>
                        <div className="text-sm text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-400">{p.cat} · {p.price}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent + Trending when empty query */}
              {query === "" && (
                <>
                  {recent.length > 0 && (
                    <div className="px-4 pt-3 pb-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-500">Tìm kiếm gần đây</span>
                        <button onClick={() => setRecent([])} className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer transition-colors duration-150">Xóa tất cả</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5 pb-2">
                        {recent.map((r) => (
                          <div key={r} className="flex items-center gap-1 bg-slate-100 rounded-full pl-3 pr-1.5 py-1">
                            <button onClick={() => submitSearch(r)} className="text-xs text-slate-700 hover:text-slate-900 cursor-pointer">{r}</button>
                            <button onClick={() => clearRecent(r)} className="text-slate-400 hover:text-slate-700 cursor-pointer" aria-label={`Xóa ${r}`}>
                              <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="px-4 pt-2 pb-3 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 block mb-2">Xu hướng tìm kiếm</span>
                    <div className="flex flex-wrap gap-1.5">
                      {trending.map((t) => (
                        <button key={t} onClick={() => submitSearch(t)} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors duration-150 cursor-pointer">
                          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
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
              <button key={s} onClick={() => submitSearch(s)} className="px-4 py-2 rounded-full text-sm bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white transition-colors duration-200 cursor-pointer">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : query === "" ? (
        <div>
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
