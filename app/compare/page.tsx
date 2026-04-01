"use client"
import { useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCompare } from "@/components/compare-bar"

const allProducts = [
  { slug: "macbook-pro-m4",      name: "MacBook Pro M4",        cat: "Laptop",       price: "42.990.000₫" },
  { slug: "dell-xps-15",         name: "Dell XPS 15 OLED",      cat: "Laptop",       price: "38.500.000₫" },
  { slug: "asus-rog-strix-g16",  name: "ASUS ROG Strix G16",    cat: "Laptop Gaming",price: "35.990.000₫" },
  { slug: "rtx-4080-super",      name: "RTX 4080 Super",        cat: "GPU",          price: "22.500.000₫" },
  { slug: "intel-i9-14900k",     name: "Intel Core i9-14900K",  cat: "CPU",          price: "8.990.000₫"  },
  { slug: "samsung-990-pro-2tb", name: "Samsung 990 Pro 2TB",   cat: "SSD NVMe",     price: "3.290.000₫"  },
  { slug: "corsair-32gb-ddr5",   name: "Corsair 32GB DDR5",     cat: "RAM",          price: "2.490.000₫"  },
  { slug: "lg-ultragear-27",     name: "LG UltraGear 27\" 4K",  cat: "Màn hình",     price: "12.990.000₫" },
]

const productSpecs: Record<string, Record<string, string>> = {
  "macbook-pro-m4":      { "Chip / CPU": "Apple M4 Pro 14-core", "RAM": "16GB Unified",    "Bộ nhớ": "512GB SSD",          "Màn hình": "16.2\" Retina XDR 120Hz", "Pin": "Đến 24 giờ",  "Trọng lượng": "2.14 kg", "Hệ điều hành": "macOS Sequoia",    "Bảo hành": "12 tháng"  },
  "dell-xps-15":         { "Chip / CPU": "Intel Core i7-13700H", "RAM": "32GB DDR5",       "Bộ nhớ": "1TB SSD",            "Màn hình": "15.6\" OLED 3.5K 60Hz",  "Pin": "Đến 13 giờ",  "Trọng lượng": "1.86 kg", "Hệ điều hành": "Windows 11 Home",  "Bảo hành": "12 tháng"  },
  "asus-rog-strix-g16":  { "Chip / CPU": "Intel Core i9-14900H", "RAM": "32GB DDR5",       "Bộ nhớ": "1TB SSD",            "Màn hình": "16\" QHD 240Hz IPS",     "Pin": "Đến 8 giờ",   "Trọng lượng": "2.5 kg",  "Hệ điều hành": "Windows 11 Home",  "Bảo hành": "24 tháng"  },
  "rtx-4080-super":      { "Chip / CPU": "—",                    "RAM": "16GB GDDR6X",     "Bộ nhớ": "—",                  "Màn hình": "—",                      "Pin": "—",           "Trọng lượng": "—",       "Hệ điều hành": "—",                "Bảo hành": "36 tháng"  },
  "intel-i9-14900k":     { "Chip / CPU": "24 nhân / 32 luồng",   "RAM": "—",               "Bộ nhớ": "—",                  "Màn hình": "—",                      "Pin": "—",           "Trọng lượng": "—",       "Hệ điều hành": "—",                "Bảo hành": "36 tháng"  },
  "samsung-990-pro-2tb": { "Chip / CPU": "—",                    "RAM": "—",               "Bộ nhớ": "2TB NVMe PCIe 4.0",  "Màn hình": "—",                      "Pin": "—",           "Trọng lượng": "—",       "Hệ điều hành": "—",                "Bảo hành": "60 tháng"  },
  "corsair-32gb-ddr5":   { "Chip / CPU": "—",                    "RAM": "32GB DDR5-6000",  "Bộ nhớ": "—",                  "Màn hình": "—",                      "Pin": "—",           "Trọng lượng": "—",       "Hệ điều hành": "—",                "Bảo hành": "Lifetime"  },
  "lg-ultragear-27":     { "Chip / CPU": "—",                    "RAM": "—",               "Bộ nhớ": "—",                  "Màn hình": "27\" 4K 144Hz IPS",      "Pin": "—",           "Trọng lượng": "—",       "Hệ điều hành": "—",                "Bảo hành": "36 tháng"  },
}

const specKeys = ["Chip / CPU", "RAM", "Bộ nhớ", "Màn hình", "Pin", "Trọng lượng", "Hệ điều hành", "Bảo hành"]
const MAX = 3

export default function ComparePage() {
  const { items, toggle, clear } = useCompare()
  const [showPicker, setShowPicker] = useState<number | null>(null)

  // Dùng items từ context làm nguồn duy nhất
  const slugs = items.map((i) => i.slug)
  const products = slugs.map((s) => allProducts.find((p) => p.slug === s)).filter(Boolean) as typeof allProducts
  const slots = Array.from({ length: MAX })

  const cats = [...new Set(items.map((i) => i.cat))]
  const mixedCategories = cats.length > 1

  function addSlot(slot: number, slug: string) {
    const item = allProducts.find((p) => p.slug === slug)
    if (!item) return
    // Nếu slot đã có sản phẩm, xóa cái cũ trước
    if (slugs[slot]) toggle({ slug: slugs[slot], name: "", cat: "" })
    toggle({ slug: item.slug, name: item.name, cat: item.cat })
    setShowPicker(null)
  }

  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC] pb-24">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Trang chủ</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-slate-700 font-medium">So sánh sản phẩm</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">So sánh sản phẩm</h1>
              <p className="text-sm text-slate-400 mt-1">
                {items.length === 0
                  ? "Chưa có sản phẩm nào — thêm từ trang sản phẩm"
                  : `Đang so sánh ${items.length}/${MAX} sản phẩm`}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="px-4 py-2 rounded-full text-sm text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Mixed category warning */}
          {mixedCategories && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-500 fill-current flex-shrink-0 mt-0.5" aria-hidden="true">
                <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">Đang so sánh sản phẩm khác danh mục</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  Bạn đang so sánh {cats.join(", ")}. Một số thông số có thể không áp dụng và sẽ hiển thị "—". Bạn vẫn có thể so sánh bình thường.
                </p>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Chưa có sản phẩm để so sánh</h2>
              <p className="text-slate-500 text-sm mb-6">Nhấn vào icon so sánh trên các sản phẩm để thêm vào đây</p>
              <Link href="/products" className="px-6 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer inline-block">
                Xem sản phẩm
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr>
                    {/* Label col */}
                    <th className="w-36 pb-6 pr-4 align-bottom text-left">
                      <span className="text-sm font-semibold text-slate-500">Thông số</span>
                    </th>

                    {/* Product cols — fixed height card */}
                    {slots.map((_, i) => {
                      const p = products[i]
                      return (
                        <th key={i} className="pb-6 px-2 align-top w-56">
                          {p ? (
                            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 text-left h-64 flex flex-col relative">
                              <button
                                onClick={() => toggle({ slug: p.slug, name: p.name, cat: p.cat })}
                                className="absolute top-3 right-3 p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                                aria-label={`Xóa ${p.name}`}
                              >
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                              </button>
                              {/* Image */}
                              <div className="w-full h-24 bg-slate-50 rounded-xl mb-3 flex items-center justify-center border border-slate-100 flex-shrink-0">
                                <svg viewBox="0 0 60 45" className="w-12 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                  <rect x="3" y="3" width="54" height="39" rx="3"/>
                                  <rect x="8" y="8" width="44" height="29" rx="2" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                                </svg>
                              </div>
                              <div className="text-xs text-slate-400 mb-0.5 flex-shrink-0">{p.cat}</div>
                              <div className="font-semibold text-sm text-slate-900 leading-snug mb-1 flex-1 line-clamp-2">{p.name}</div>
                              <div className="font-bold text-blue-600 text-sm mb-3 flex-shrink-0">{p.price}</div>
                              <Link
                                href={`/products/${p.slug}`}
                                className="block w-full py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer text-center flex-shrink-0"
                              >
                                Xem chi tiết
                              </Link>
                            </div>
                          ) : (
                            <div className="relative h-64">
                              <button
                                onClick={() => setShowPicker(i)}
                                className="w-full h-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-blue-500"
                              >
                                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                                <span className="text-xs font-medium">Thêm sản phẩm</span>
                              </button>
                              {showPicker === i && (
                                <>
                                  <div className="fixed inset-0 z-40" onClick={() => setShowPicker(null)} aria-hidden="true" />
                                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                                    <div className="p-3 border-b border-slate-100">
                                      <p className="text-xs font-semibold text-slate-500">Chọn sản phẩm</p>
                                    </div>
                                    <ul className="py-1 max-h-60 overflow-y-auto">
                                      {allProducts.filter((ap) => !slugs.includes(ap.slug)).map((ap) => (
                                        <li key={ap.slug}>
                                          <button
                                            onClick={() => addSlot(i, ap.slug)}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                          >
                                            <div className="font-medium text-slate-900">{ap.name}</div>
                                            <div className="text-xs text-slate-400">{ap.cat} · {ap.price}</div>
                                          </button>
                                        </li>
                                      ))}
                                      {allProducts.filter((ap) => !slugs.includes(ap.slug)).length === 0 && (
                                        <li className="px-4 py-3 text-sm text-slate-400">Không còn sản phẩm để thêm</li>
                                      )}
                                    </ul>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody>
                  {specKeys.map((key, ri) => (
                    <tr key={key} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                      <td className="py-3.5 pr-4 pl-3 text-sm font-medium text-slate-500 rounded-l-xl">{key}</td>
                      {slots.map((_, i) => {
                        const p = products[i]
                        const val = p ? (productSpecs[p.slug]?.[key] ?? "—") : null
                        return (
                          <td key={i} className={`py-3.5 px-4 text-sm ${i === slots.length - 1 ? "rounded-r-xl" : ""}`}>
                            {p ? (
                              <span className={val === "—" ? "text-slate-300" : "text-slate-900"}>{val}</span>
                            ) : (
                              <span className="text-slate-200">—</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="pt-5 pr-4" />
                    {slots.map((_, i) => (
                      <td key={i} className="pt-5 px-2">
                        {products[i] && (
                          <button className="w-full py-2.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200 cursor-pointer">
                            Thêm vào giỏ
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-10 text-center">
            <Link href="/products" className="px-6 py-2.5 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer inline-block">
              Xem thêm sản phẩm
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
