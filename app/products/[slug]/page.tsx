import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = { title: "MacBook Pro M4" }

const relatedProducts = [
  { slug: "dell-xps-15", name: "Dell XPS 15 OLED", cat: "Laptop", price: "38.500.000₫", old: "42.000.000₫", rating: 4.6 },
  { slug: "asus-rog-strix-g16", name: "ASUS ROG Strix G16", cat: "Laptop Gaming", price: "35.990.000₫", old: "39.990.000₫", rating: 4.8 },
  { slug: "corsair-32gb-ddr5", name: "Corsair 32GB DDR5", cat: "RAM", price: "2.490.000₫", old: "2.990.000₫", rating: 4.8 },
]

const specs = [
  { label: "Chip", value: "Apple M4 Pro 14-core CPU, 20-core GPU" },
  { label: "RAM", value: "24GB Unified Memory" },
  { label: "Bộ nhớ", value: "512GB SSD" },
  { label: "Màn hình", value: "16.2\" Liquid Retina XDR, 3456×2234, 120Hz" },
  { label: "Pin", value: "100Wh, sạc MagSafe 140W" },
  { label: "Kết nối", value: "3x Thunderbolt 4, HDMI, SD card, MagSafe 3" },
  { label: "Hệ điều hành", value: "macOS Sequoia" },
  { label: "Trọng lượng", value: "2.14 kg" },
]

const reviews = [
  { name: "Trần Thị Lan Anh", role: "Graphic Designer", rating: 5, date: "15/03/2025", text: "Máy chạy cực mượt, render video 4K nhanh hơn hẳn máy cũ. Pin trâu, dùng cả ngày không cần sạc. Rất hài lòng với lần mua này." },
  { name: "Nguyễn Văn Hùng", role: "Developer", rating: 5, date: "02/03/2025", text: "Build code nhanh, chạy Docker mượt mà. Màn hình đẹp, màu sắc chuẩn. Giá tại NitroTech tốt hơn Apple Store chính hãng." },
  { name: "Lê Minh Châu", role: "Video Editor", rating: 4, date: "20/02/2025", text: "Hiệu năng xuất sắc cho công việc edit video. Chỉ tiếc là không có thêm cổng USB-A. Nhìn chung rất đáng tiền." },
]

export default function ProductDetailPage() {
  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-slate-400 flex-wrap">
            <Link href="/" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Trang chủ</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <Link href="/products" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Sản phẩm</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <Link href="/products?cat=laptop" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Laptop</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-slate-700 font-medium">MacBook Pro M4</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* ── Product main ── */}
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Images */}
            <div>
              {/* Main image */}
              <div className="rounded-3xl bg-white border border-slate-200 aspect-square flex items-center justify-center mb-4 shadow-sm">
                <svg viewBox="0 0 200 140" className="w-48 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="10" y="8" width="180" height="110" rx="6" strokeWidth="2"/>
                  <rect x="20" y="18" width="160" height="90" rx="3" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)"/>
                  <path d="M4 118h192l-8 14H12l-8-14z" strokeWidth="2"/>
                </svg>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    className={`flex-1 aspect-square rounded-2xl bg-white border flex items-center justify-center cursor-pointer transition-colors duration-200 ${i === 1 ? "border-slate-900" : "border-slate-200 hover:border-slate-400"}`}
                    aria-label={`Ảnh ${i}`}
                  >
                    <svg viewBox="0 0 40 30" className="w-8 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="2" y="2" width="36" height="26" rx="2"/>
                      <rect x="5" y="5" width="30" height="20" rx="1" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">Mới</span>
                <span className="text-xs text-slate-400">SKU: MBP-M4-16-512</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">MacBook Pro M4 — 16GB / 512GB</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-1" aria-label="4.9 sao">
                  {[1,2,3,4,5].map((s) => (
                    <svg key={s} viewBox="0 0 24 24" className="w-4 h-4 text-amber-400 fill-current" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-semibold text-slate-900">4.9</span>
                <span className="text-sm text-slate-400">189 đánh giá</span>
                <span className="text-sm text-green-600 font-medium">Còn hàng</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-3xl font-bold text-slate-900">42.990.000₫</span>
                <span className="text-lg text-slate-300 line-through">47.990.000₫</span>
                <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">-10%</span>
              </div>

              {/* Variants */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-2">Cấu hình</p>
                <div className="flex flex-wrap gap-2">
                  {["16GB / 512GB", "24GB / 512GB", "24GB / 1TB", "36GB / 1TB"].map((v, i) => (
                    <button
                      key={v}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 cursor-pointer ${i === 0 ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-2">Màu sắc</p>
                <div className="flex gap-2">
                  {[
                    { name: "Space Black", color: "bg-slate-900", ring: "ring-slate-900" },
                    { name: "Silver", color: "bg-slate-300", ring: "ring-slate-400" },
                  ].map((c, i) => (
                    <button
                      key={c.name}
                      className={`w-8 h-8 rounded-full ${c.color} cursor-pointer transition-all duration-200 ${i === 0 ? `ring-2 ring-offset-2 ${c.ring}` : "hover:ring-2 hover:ring-offset-2 hover:ring-slate-300"}`}
                      aria-label={c.name}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-slate-900 mb-2">Số lượng</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                    <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer text-lg leading-none" aria-label="Giảm">−</button>
                    <span className="px-4 py-2 text-sm font-semibold text-slate-900 min-w-[3rem] text-center" aria-live="polite">1</span>
                    <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer text-lg leading-none" aria-label="Tăng">+</button>
                  </div>
                  <span className="text-xs text-slate-400">Còn 12 sản phẩm</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex gap-3 mb-6">
                <Link href="/cart" className="flex-1 py-3.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer text-center">
                  Thêm vào giỏ
                </Link>
                <Link href="/checkout" className="flex-1 py-3.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200 cursor-pointer text-center">
                  Mua ngay
                </Link>
                <button className="p-3.5 rounded-full border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors duration-200 cursor-pointer" aria-label="Yêu thích">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>, text: "Chính hãng Apple VN/A" },
                  { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, text: "Giao trong 2 giờ" },
                  { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text: "Bảo hành 12 tháng" },
                  { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>, text: "Trả góp 0% lãi suất" },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                    <span className="text-blue-600 flex-shrink-0">{b.icon}</span>
                    {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Tabs: Specs / Reviews ── */}
          <div className="mb-16">
            <div className="flex gap-1 border-b border-slate-200 mb-8">
              {["Thông số kỹ thuật", "Đánh giá (189)", "Mô tả"].map((tab, i) => (
                <button
                  key={tab}
                  className={`px-5 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer border-b-2 -mb-px ${i === 0 ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Specs table */}
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <caption className="sr-only">Thông số kỹ thuật MacBook Pro M4</caption>
                <tbody>
                  {specs.map((s, i) => (
                    <tr key={s.label} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-6 py-3.5 font-medium text-slate-600 w-40 border-r border-slate-100">{s.label}</td>
                      <td className="px-6 py-3.5 text-slate-900">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Đánh giá từ khách hàng</h2>
              <button className="px-5 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                Viết đánh giá
              </button>
            </div>
            {/* Summary */}
            <div className="flex items-center gap-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-slate-900">4.9</div>
                <div className="flex gap-1 justify-center my-2">
                  {[1,2,3,4,5].map((s) => <svg key={s} viewBox="0 0 24 24" className="w-4 h-4 text-amber-400 fill-current" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                </div>
                <div className="text-xs text-slate-400">189 đánh giá</div>
              </div>
              <div className="flex-1 space-y-2">
                {[[5, 85], [4, 12], [3, 2], [2, 1], [1, 0]].map(([star, pct]) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-4">{star}</span>
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-amber-400 fill-current flex-shrink-0" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-8">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Review list */}
            <div className="space-y-4">
              {reviews.map((r) => (
                <article key={r.name} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0" aria-hidden="true">
                        {r.name.split(" ").map(n => n[0]).slice(-2).join("")}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-900">{r.name}</div>
                        <div className="text-xs text-slate-400">{r.role}</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                  <div className="flex gap-1 mb-2" aria-label={`${r.rating} sao`}>
                    {[1,2,3,4,5].map((s) => <svg key={s} viewBox="0 0 24 24" className={`w-3.5 h-3.5 ${s <= r.rating ? "text-amber-400" : "text-slate-200"} fill-current`} aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{r.text}</p>
                </article>
              ))}
            </div>
          </div>

          {/* ── Related products ── */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {relatedProducts.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-lg flex flex-col">
                  <div className="h-40 bg-slate-50 flex items-center justify-center border-b border-slate-100">
                    <svg viewBox="0 0 80 60" className="w-20 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="5" y="5" width="70" height="50" rx="4"/>
                      <rect x="12" y="12" width="56" height="36" rx="2" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                    </svg>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-slate-400 mb-1">{p.cat}</div>
                    <div className="font-semibold text-sm text-slate-900 mb-3">{p.name}</div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{p.price}</div>
                        <div className="text-xs text-slate-300 line-through">{p.old}</div>
                      </div>
                      <button onClick={(e) => e.preventDefault()} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">Mua</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
