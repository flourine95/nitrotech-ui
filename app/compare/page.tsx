"use client"
import { useState } from "react"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { useCompare } from "@/components/compare-bar"

const allProducts = [
  {
    slug: "macbook-pro-m4",
    name: "MacBook Pro M4",
    cat: "Laptop",
    price: "42.990.000₫",
  },
  {
    slug: "dell-xps-15",
    name: "Dell XPS 15 OLED",
    cat: "Laptop",
    price: "38.500.000₫",
  },
  {
    slug: "asus-rog-strix-g16",
    name: "ASUS ROG Strix G16",
    cat: "Laptop Gaming",
    price: "35.990.000₫",
  },
  {
    slug: "rtx-4080-super",
    name: "RTX 4080 Super",
    cat: "GPU",
    price: "22.500.000₫",
  },
  {
    slug: "intel-i9-14900k",
    name: "Intel Core i9-14900K",
    cat: "CPU",
    price: "8.990.000₫",
  },
  {
    slug: "samsung-990-pro-2tb",
    name: "Samsung 990 Pro 2TB",
    cat: "SSD NVMe",
    price: "3.290.000₫",
  },
  {
    slug: "corsair-32gb-ddr5",
    name: "Corsair 32GB DDR5",
    cat: "RAM",
    price: "2.490.000₫",
  },
  {
    slug: "lg-ultragear-27",
    name: 'LG UltraGear 27" 4K',
    cat: "Màn hình",
    price: "12.990.000₫",
  },
]

const productSpecs: Record<string, Record<string, string>> = {
  "macbook-pro-m4": {
    "Chip / CPU": "Apple M4 Pro 14-core",
    RAM: "16GB Unified",
    "Bộ nhớ": "512GB SSD",
    "Màn hình": '16.2" Retina XDR 120Hz',
    Pin: "Đến 24 giờ",
    "Trọng lượng": "2.14 kg",
    "Hệ điều hành": "macOS Sequoia",
    "Bảo hành": "12 tháng",
  },
  "dell-xps-15": {
    "Chip / CPU": "Intel Core i7-13700H",
    RAM: "32GB DDR5",
    "Bộ nhớ": "1TB SSD",
    "Màn hình": '15.6" OLED 3.5K 60Hz',
    Pin: "Đến 13 giờ",
    "Trọng lượng": "1.86 kg",
    "Hệ điều hành": "Windows 11 Home",
    "Bảo hành": "12 tháng",
  },
  "asus-rog-strix-g16": {
    "Chip / CPU": "Intel Core i9-14900H",
    RAM: "32GB DDR5",
    "Bộ nhớ": "1TB SSD",
    "Màn hình": '16" QHD 240Hz IPS',
    Pin: "Đến 8 giờ",
    "Trọng lượng": "2.5 kg",
    "Hệ điều hành": "Windows 11 Home",
    "Bảo hành": "24 tháng",
  },
  "rtx-4080-super": {
    "Chip / CPU": "—",
    RAM: "16GB GDDR6X",
    "Bộ nhớ": "—",
    "Màn hình": "—",
    Pin: "—",
    "Trọng lượng": "—",
    "Hệ điều hành": "—",
    "Bảo hành": "36 tháng",
  },
  "intel-i9-14900k": {
    "Chip / CPU": "24 nhân / 32 luồng",
    RAM: "—",
    "Bộ nhớ": "—",
    "Màn hình": "—",
    Pin: "—",
    "Trọng lượng": "—",
    "Hệ điều hành": "—",
    "Bảo hành": "36 tháng",
  },
  "samsung-990-pro-2tb": {
    "Chip / CPU": "—",
    RAM: "—",
    "Bộ nhớ": "2TB NVMe PCIe 4.0",
    "Màn hình": "—",
    Pin: "—",
    "Trọng lượng": "—",
    "Hệ điều hành": "—",
    "Bảo hành": "60 tháng",
  },
  "corsair-32gb-ddr5": {
    "Chip / CPU": "—",
    RAM: "32GB DDR5-6000",
    "Bộ nhớ": "—",
    "Màn hình": "—",
    Pin: "—",
    "Trọng lượng": "—",
    "Hệ điều hành": "—",
    "Bảo hành": "Lifetime",
  },
  "lg-ultragear-27": {
    "Chip / CPU": "—",
    RAM: "—",
    "Bộ nhớ": "—",
    "Màn hình": '27" 4K 144Hz IPS',
    Pin: "—",
    "Trọng lượng": "—",
    "Hệ điều hành": "—",
    "Bảo hành": "36 tháng",
  },
}

const specKeys = [
  "Chip / CPU",
  "RAM",
  "Bộ nhớ",
  "Màn hình",
  "Pin",
  "Trọng lượng",
  "Hệ điều hành",
  "Bảo hành",
]
const MAX = 3

export default function ComparePage() {
  const { items, toggle, clear } = useCompare()
  const [showPicker, setShowPicker] = useState<number | null>(null)

  // Dùng items từ context làm nguồn duy nhất
  const slugs = items.map((i) => i.slug)
  const products = slugs
    .map((s) => allProducts.find((p) => p.slug === s))
    .filter(Boolean) as typeof allProducts
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
            <span className="font-medium text-slate-700">So sánh sản phẩm</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                So sánh sản phẩm
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {items.length === 0
                  ? "Chưa có sản phẩm nào — thêm từ trang sản phẩm"
                  : `Đang so sánh ${items.length}/${MAX} sản phẩm`}
              </p>
            </div>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-500 transition-colors duration-200 hover:bg-slate-100"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Mixed category warning */}
          {mixedCategories && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-5 w-5 shrink-0 fill-current text-amber-500"
                aria-hidden="true"
              >
                <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Đang so sánh sản phẩm khác danh mục
                </p>
                <p className="mt-0.5 text-xs text-amber-600">
                  Bạn đang so sánh {cats.join(", ")}. Một số thông số có thể
                  không áp dụng và sẽ hiển thị "—". Bạn vẫn có thể so sánh bình
                  thường.
                </p>
              </div>
            </div>
          )}

          {items.length === 0 ? (
            /* Empty state */
            <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="18" rx="1" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-bold text-slate-900">
                Chưa có sản phẩm để so sánh
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                Nhấn vào icon so sánh trên các sản phẩm để thêm vào đây
              </p>
              <Link
                href="/products"
                className="inline-block cursor-pointer rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
              >
                Xem sản phẩm
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-140">
                <thead>
                  <tr>
                    {/* Label col */}
                    <th className="w-36 pr-4 pb-6 text-left align-bottom">
                      <span className="text-sm font-semibold text-slate-500">
                        Thông số
                      </span>
                    </th>

                    {/* Product cols — fixed height card */}
                    {slots.map((_, i) => {
                      const p = products[i]
                      return (
                        <th key={i} className="w-56 px-2 pb-6 align-top">
                          {p ? (
                            <div className="relative flex h-64 flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
                              <button
                                onClick={() =>
                                  toggle({
                                    slug: p.slug,
                                    name: p.name,
                                    cat: p.cat,
                                  })
                                }
                                className="absolute top-3 right-3 cursor-pointer rounded-full p-1 text-slate-300 transition-colors duration-150 hover:bg-rose-50 hover:text-rose-500"
                                aria-label={`Xóa ${p.name}`}
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-3.5 w-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  aria-hidden="true"
                                >
                                  <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                              </button>
                              {/* Image */}
                              <div className="mb-3 flex h-24 w-full shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                                <svg
                                  viewBox="0 0 60 45"
                                  className="h-auto w-12 text-slate-300"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  aria-hidden="true"
                                >
                                  <rect
                                    x="3"
                                    y="3"
                                    width="54"
                                    height="39"
                                    rx="3"
                                  />
                                  <rect
                                    x="8"
                                    y="8"
                                    width="44"
                                    height="29"
                                    rx="2"
                                    fill="rgba(59,130,246,0.04)"
                                    stroke="rgba(59,130,246,0.15)"
                                  />
                                </svg>
                              </div>
                              <div className="mb-0.5 shrink-0 text-xs text-slate-400">
                                {p.cat}
                              </div>
                              <div className="mb-1 line-clamp-2 flex-1 text-sm leading-snug font-semibold text-slate-900">
                                {p.name}
                              </div>
                              <div className="mb-3 shrink-0 text-sm font-bold text-blue-600">
                                {p.price}
                              </div>
                              <Link
                                href={`/products/${p.slug}`}
                                className="block w-full shrink-0 cursor-pointer rounded-full bg-slate-900 py-1.5 text-center text-xs font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
                              >
                                Xem chi tiết
                              </Link>
                            </div>
                          ) : (
                            <div className="relative h-64">
                              <button
                                onClick={() => setShowPicker(i)}
                                className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 transition-colors duration-200 hover:border-blue-400 hover:text-blue-500"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-8 w-8"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  aria-hidden="true"
                                >
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                                <span className="text-xs font-medium">
                                  Thêm sản phẩm
                                </span>
                              </button>
                              {showPicker === i && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowPicker(null)}
                                    aria-hidden="true"
                                  />
                                  <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                                    <div className="border-b border-slate-100 p-3">
                                      <p className="text-xs font-semibold text-slate-500">
                                        Chọn sản phẩm
                                      </p>
                                    </div>
                                    <ul className="max-h-60 overflow-y-auto py-1">
                                      {allProducts
                                        .filter(
                                          (ap) => !slugs.includes(ap.slug)
                                        )
                                        .map((ap) => (
                                          <li key={ap.slug}>
                                            <button
                                              onClick={() =>
                                                addSlot(i, ap.slug)
                                              }
                                              className="w-full cursor-pointer px-4 py-2.5 text-left text-sm transition-colors duration-150 hover:bg-slate-50"
                                            >
                                              <div className="font-medium text-slate-900">
                                                {ap.name}
                                              </div>
                                              <div className="text-xs text-slate-400">
                                                {ap.cat} · {ap.price}
                                              </div>
                                            </button>
                                          </li>
                                        ))}
                                      {allProducts.filter(
                                        (ap) => !slugs.includes(ap.slug)
                                      ).length === 0 && (
                                        <li className="px-4 py-3 text-sm text-slate-400">
                                          Không còn sản phẩm để thêm
                                        </li>
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
                    <tr
                      key={key}
                      className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}
                    >
                      <td className="rounded-l-xl py-3.5 pr-4 pl-3 text-sm font-medium text-slate-500">
                        {key}
                      </td>
                      {slots.map((_, i) => {
                        const p = products[i]
                        const val = p
                          ? (productSpecs[p.slug]?.[key] ?? "—")
                          : null
                        return (
                          <td
                            key={i}
                            className={`px-4 py-3.5 text-sm ${i === slots.length - 1 ? "rounded-r-xl" : ""}`}
                          >
                            {p ? (
                              <span
                                className={
                                  val === "—"
                                    ? "text-slate-300"
                                    : "text-slate-900"
                                }
                              >
                                {val}
                              </span>
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
                      <td key={i} className="px-2 pt-5">
                        {products[i] && (
                          <button className="w-full cursor-pointer rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500">
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
            <Link
              href="/products"
              className="inline-block cursor-pointer rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
            >
              Xem thêm sản phẩm
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
