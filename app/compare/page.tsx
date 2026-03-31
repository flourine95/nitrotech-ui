"use client"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const allProducts = [
  { slug: "macbook-pro-m4", name: "MacBook Pro M4", cat: "Laptop", price: "42.990.000₫" },
  { slug: "dell-xps-15", name: "Dell XPS 15 OLED", cat: "Laptop", price: "38.500.000₫" },
  { slug: "asus-rog-strix-g16", name: "ASUS ROG Strix G16", cat: "Laptop Gaming", price: "35.990.000₫" },
  { slug: "rtx-4080-super", name: "RTX 4080 Super", cat: "GPU", price: "22.500.000₫" },
  { slug: "intel-i9-14900k", name: "Intel Core i9-14900K", cat: "CPU", price: "8.990.000₫" },
]

type Product = {
  slug: string
  name: string
  cat: string
  price: string
  specs: Record<string, string>
}

const productDetails: Record<string, Product> = {
  "macbook-pro-m4": {
    slug: "macbook-pro-m4", name: "MacBook Pro M4", cat: "Laptop", price: "42.990.000₫",
    specs: {
      "Chip / CPU": "Apple M4 Pro 14-core",
      "RAM": "16GB Unified Memory",
      "Bộ nhớ": "512GB SSD",
      "Màn hình": "16.2\" Liquid Retina XDR 120Hz",
      "Pin": "Đến 24 giờ",
      "Trọng lượng": "2.14 kg",
      "Hệ điều hành": "macOS Sequoia",
      "Kết nối": "3x Thunderbolt 4, HDMI, SD",
      "Bảo hành": "12 tháng",
    },
  },
  "dell-xps-15": {
    slug: "dell-xps-15", name: "Dell XPS 15 OLED", cat: "Laptop", price: "38.500.000₫",
    specs: {
      "Chip / CPU": "Intel Core i7-13700H",
      "RAM": "32GB DDR5",
      "Bộ nhớ": "1TB SSD",
      "Màn hình": "15.6\" OLED 3.5K 60Hz",
      "Pin": "Đến 13 giờ",
      "Trọng lượng": "1.86 kg",
      "Hệ điều hành": "Windows 11 Home",
      "Kết nối": "2x Thunderbolt 4, USB-A, SD",
      "Bảo hành": "12 tháng",
    },
  },
  "asus-rog-strix-g16": {
    slug: "asus-rog-strix-g16", name: "ASUS ROG Strix G16", cat: "Laptop Gaming", price: "35.990.000₫",
    specs: {
      "Chip / CPU": "Intel Core i9-14900H",
      "RAM": "32GB DDR5",
      "Bộ nhớ": "1TB SSD",
      "Màn hình": "16\" QHD 240Hz IPS",
      "Pin": "Đến 8 giờ",
      "Trọng lượng": "2.5 kg",
      "Hệ điều hành": "Windows 11 Home",
      "Kết nối": "USB-A x3, USB-C, HDMI 2.1",
      "Bảo hành": "24 tháng",
    },
  },
}

const MAX = 3
const specKeys = ["Chip / CPU", "RAM", "Bộ nhớ", "Màn hình", "Pin", "Trọng lượng", "Hệ điều hành", "Kết nối", "Bảo hành"]

export default function ComparePage() {
  return (
    <Suspense fallback={null}>
      <CompareContent />
    </Suspense>
  )
}

function CompareContent() {
  const searchParams = useSearchParams()
  const addSlug = searchParams.get("add")

  const [selected, setSelected] = useState<string[]>(() => {
    // Pre-select từ ?add= param, thêm vào slot đầu tiên trống
    if (addSlug && Object.keys(productDetails).includes(addSlug)) {
      return [addSlug]
    }
    return ["macbook-pro-m4", "dell-xps-15"]
  })

  // Khi URL thay đổi (user click So sánh từ card khác), thêm vào slot trống
  useEffect(() => {
    if (!addSlug) return
    if (!Object.keys(productDetails).includes(addSlug)) return
    setSelected((prev) => {
      if (prev.includes(addSlug)) return prev
      if (prev.length < MAX) return [...prev, addSlug]
      // Thay slot cuối nếu đã đầy
      return [...prev.slice(0, MAX - 1), addSlug]
    })
  }, [addSlug])
  const [showPicker, setShowPicker] = useState<number | null>(null)

  function pick(slot: number, slug: string) {
    setSelected((prev) => {
      const next = [...prev]
      next[slot] = slug
      return next
    })
    setShowPicker(null)
  }

  function remove(slot: number) {
    setSelected((prev) => prev.filter((_, i) => i !== slot))
  }

  const products = selected.map((s) => productDetails[s]).filter(Boolean)
  const slots = Array.from({ length: MAX })

  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
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
            <h1 className="text-2xl font-bold text-slate-900">So sánh sản phẩm</h1>
            <span className="text-sm text-slate-400">Tối đa {MAX} sản phẩm</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              {/* Product headers */}
              <thead>
                <tr>
                  <th className="w-36 text-left pb-6 pr-4 align-bottom">
                    <span className="text-sm font-semibold text-slate-500">Thông số</span>
                  </th>
                  {slots.map((_, i) => {
                    const p = products[i]
                    return (
                      <th key={i} className="pb-6 px-3 align-top">
                        {p ? (
                          <div className="relative rounded-2xl bg-white border border-slate-200 shadow-sm p-4 text-left">
                            {/* Remove */}
                            <button
                              onClick={() => remove(i)}
                              className="absolute top-3 right-3 p-1 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                              aria-label={`Xóa ${p.name}`}
                            >
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            </button>
                            {/* Image */}
                            <div className="w-full aspect-square bg-slate-50 rounded-xl mb-3 flex items-center justify-center border border-slate-100">
                              <svg viewBox="0 0 60 45" className="w-14 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <rect x="3" y="3" width="54" height="39" rx="3"/>
                                <rect x="8" y="8" width="44" height="29" rx="2" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                              </svg>
                            </div>
                            <div className="text-xs text-slate-400 mb-0.5">{p.cat}</div>
                            <div className="font-semibold text-sm text-slate-900 leading-snug mb-2">{p.name}</div>
                            <div className="font-bold text-blue-600 text-sm mb-3">{p.price}</div>
                            <Link
                              href={`/products/${p.slug}`}
                              className="block w-full py-2 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer text-center"
                            >
                              Xem chi tiết
                            </Link>
                          </div>
                        ) : (
                          /* Empty slot */
                          <div className="relative">
                            <button
                              onClick={() => setShowPicker(i)}
                              className="w-full rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors duration-200 cursor-pointer p-6 flex flex-col items-center gap-2 text-slate-400 hover:text-blue-500"
                            >
                              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
                              <span className="text-xs font-medium">Thêm sản phẩm</span>
                            </button>

                            {/* Picker dropdown */}
                            {showPicker === i && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowPicker(null)} aria-hidden="true" />
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                                  <div className="p-3 border-b border-slate-100">
                                    <p className="text-xs font-semibold text-slate-500">Chọn sản phẩm</p>
                                  </div>
                                  <ul className="py-1 max-h-60 overflow-y-auto">
                                    {allProducts
                                      .filter((p) => !selected.includes(p.slug))
                                      .map((p) => (
                                        <li key={p.slug}>
                                          <button
                                            onClick={() => pick(i, p.slug)}
                                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                                          >
                                            <div className="font-medium text-slate-900">{p.name}</div>
                                            <div className="text-xs text-slate-400">{p.cat} · {p.price}</div>
                                          </button>
                                        </li>
                                      ))}
                                    {allProducts.filter((p) => !selected.includes(p.slug)).length === 0 && (
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

              {/* Specs rows */}
              <tbody>
                {specKeys.map((key, ri) => (
                  <tr key={key} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    <td className="py-3.5 pr-4 text-sm font-medium text-slate-500 rounded-l-xl pl-3">{key}</td>
                    {slots.map((_, i) => {
                      const p = products[i]
                      return (
                        <td key={i} className={`py-3.5 px-4 text-sm text-slate-900 ${i === slots.length - 1 ? "rounded-r-xl" : ""}`}>
                          {p ? (
                            <span>{p.specs[key] ?? "—"}</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}

                {/* Add to cart row */}
                <tr>
                  <td className="pt-6 pr-4" />
                  {slots.map((_, i) => {
                    const p = products[i]
                    return (
                      <td key={i} className="pt-6 px-3">
                        {p && (
                          <button className="w-full py-2.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200 cursor-pointer">
                            Thêm vào giỏ
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Browse more */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm mb-4">Muốn so sánh sản phẩm khác?</p>
            <Link href="/products" className="px-6 py-2.5 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer inline-block">
              Xem tất cả sản phẩm
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
