import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProductCard } from "@/components/product-card"
import { NewsletterForm } from "@/components/newsletter-form"

const featuredProducts = [
  { slug: "macbook-pro-m4", name: "MacBook Pro M4", cat: "Laptop", price: "42.990.000₫", old: "47.990.000₫", badge: "Mới", badgeColor: "bg-blue-100 text-blue-700", accent: "hover:border-blue-300", rating: 4.9, reviews: 189 },
  { slug: "rtx-4080-super", name: "RTX 4080 Super", cat: "Card đồ họa", price: "22.500.000₫", old: "25.000.000₫", badge: "-10%", badgeColor: "bg-amber-100 text-amber-700", accent: "hover:border-amber-300", rating: 4.7, reviews: 156 },
  { slug: "asus-rog-strix-g16", name: "ASUS ROG Strix G16", cat: "Laptop Gaming", price: "35.990.000₫", old: "39.990.000₫", badge: "Hot", badgeColor: "bg-rose-100 text-rose-700", accent: "hover:border-rose-300", rating: 4.8, reviews: 234 },
  { slug: "samsung-990-pro-2tb", name: "Samsung 990 Pro 2TB", cat: "SSD NVMe", price: "3.290.000₫", old: "3.890.000₫", badge: "Sale", badgeColor: "bg-green-100 text-green-700", accent: "hover:border-green-300", rating: 4.9, reviews: 412 },
]

const categories = [
  { label: "Laptop Gaming", href: "/products?cat=laptop-gaming", icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
  { label: "CPU & Bo mạch", href: "/products?cat=cpu", icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></svg>, color: "text-purple-600", bg: "bg-purple-50 border-purple-100" },
  { label: "Card đồ họa", href: "/products?cat=gpu", icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="6" width="22" height="12" rx="2"/><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01"/></svg>, color: "text-green-600", bg: "bg-green-50 border-green-100" },
  { label: "RAM & SSD", href: "/products?cat=storage", icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="8" width="20" height="8" rx="1"/><path d="M6 8V6M10 8V6M14 8V6M18 8V6M6 16v2M10 16v2M14 16v2M18 16v2"/></svg>, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  { label: "Màn hình", href: "/products?cat=monitors", icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>, color: "text-cyan-600", bg: "bg-cyan-50 border-cyan-100" },
  { label: "Phụ kiện", href: "/products?cat=accessories", icon: <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, color: "text-rose-600", bg: "bg-rose-50 border-rose-100" },
]

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${rating} sao, ${count} đánh giá`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" className={`w-3 h-3 ${s <= Math.floor(rating) ? "text-amber-400" : "text-slate-200"} fill-current`} aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span className="text-xs text-slate-400 ml-0.5">({count})</span>
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <SiteHeader cartCount={3} />
      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.07),transparent_60%)]" aria-hidden="true" />
          <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-medium mb-6">
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden="true"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                Hàng chính hãng — Bảo hành toàn quốc
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 text-slate-900">
                Công nghệ{" "}
                <span className="text-blue-600">đỉnh cao</span>
                <br />giá tốt nhất
              </h1>
              <p className="text-slate-500 text-lg leading-relaxed mb-8 max-w-md">
                Laptop, linh kiện PC, màn hình chính hãng. Giao hàng 2h tại TP.HCM & Hà Nội.
              </p>
              <div className="flex flex-wrap gap-3 mb-12">
                <Link href="/products" className="px-6 py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer flex items-center gap-2">
                  Khám phá ngay
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href="/products?sale=true" className="px-6 py-3 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                  Xem khuyến mãi
                </Link>
              </div>
              <div className="flex gap-10">
                {[["50K+", "Sản phẩm"], ["200K+", "Khách hàng"], ["4.9★", "Đánh giá"]].map(([v, l]) => (
                  <div key={l}>
                    <div className="text-2xl font-bold text-slate-900">{v}</div>
                    <div className="text-slate-400 text-sm">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero product card */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-sm">
                <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 font-medium">Bán chạy #1</span>
                    <span className="text-xs text-slate-400">MacBook Pro M4</span>
                  </div>
                  <div className="w-full aspect-video bg-slate-50 rounded-2xl mb-5 flex items-center justify-center border border-slate-100">
                    <svg viewBox="0 0 120 80" className="w-32 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="10" y="8" width="100" height="56" rx="4" strokeWidth="2"/>
                      <rect x="16" y="14" width="88" height="44" rx="2" fill="rgba(59,130,246,0.05)" stroke="rgba(59,130,246,0.2)"/>
                      <path d="M2 64h116l-4 8H6l-4-8z" strokeWidth="2"/>
                    </svg>
                  </div>
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg text-slate-900">MacBook Pro M4</div>
                      <div className="text-slate-400 text-sm">16GB · 512GB SSD</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-blue-600">42.990.000₫</div>
                      <div className="text-slate-300 text-xs line-through">47.990.000₫</div>
                    </div>
                  </div>
                  <Link href="/products/macbook-pro-m4" className="block w-full py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer text-center">
                    Xem chi tiết
                  </Link>
                </div>
                <div className="absolute -top-3 -right-3 bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">-10%</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Trust bar ── */}
        <section className="bg-slate-50 border-y border-slate-100 py-5">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>, title: "Chính hãng 100%", desc: "Tem bảo hành NSX", color: "text-blue-600", bg: "bg-blue-50" },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, title: "Giao trong 2 giờ", desc: "TP.HCM & Hà Nội", color: "text-amber-600", bg: "bg-amber-50" },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>, title: "Hỗ trợ 24/7", desc: "Tư vấn miễn phí", color: "text-green-600", bg: "bg-green-50" },
              { icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>, title: "Trả góp 0%", desc: "Nhiều hình thức TT", color: "text-purple-600", bg: "bg-purple-50" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.color} flex items-center justify-center flex-shrink-0`}>{f.icon}</div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{f.title}</div>
                  <div className="text-xs text-slate-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Categories ── */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Danh mục sản phẩm</h2>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {categories.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className={`group flex flex-col items-center gap-3 p-5 rounded-2xl border ${c.bg} hover:shadow-md transition-all duration-200 cursor-pointer`}
                >
                  <div className={`${c.color} transition-transform duration-200 group-hover:scale-110`}>{c.icon}</div>
                  <span className="text-sm font-medium text-slate-700 text-center leading-tight">{c.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Featured products ── */}
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Sản phẩm nổi bật</h2>
              <Link href="/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                Xem tất cả
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredProducts.map((p) => (
                <ProductCard key={p.slug} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Flash sale banner ── */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-400 text-xs font-semibold mb-3">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  Flash Sale hôm nay
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Giảm đến <span className="text-amber-400">20%</span> linh kiện PC</h2>
                <p className="text-slate-400 text-sm">Số lượng có hạn — Kết thúc lúc 23:59 hôm nay</p>
              </div>
              <Link href="/products?sale=true" className="flex-shrink-0 px-8 py-3.5 rounded-full text-sm font-semibold bg-amber-400 text-slate-900 hover:bg-amber-300 transition-colors duration-200 cursor-pointer">
                Xem ngay
              </Link>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Khách hàng nói gì?</h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { name: "Nguyễn Minh Tuấn", role: "Game thủ", text: "Mua RTX 4080 tại NitroTech, giá tốt hơn các chỗ khác mà hàng chính hãng, giao trong 2 tiếng. Sẽ quay lại mua tiếp.", avatar: "NM", color: "bg-blue-600" },
                { name: "Trần Thị Lan Anh", role: "Graphic Designer", text: "MacBook Pro M4 mua ở đây có giá tốt, được tư vấn rất nhiệt tình. Máy chạy mượt, làm việc render nhanh hơn hẳn.", avatar: "TL", color: "bg-purple-600" },
                { name: "Lê Hoàng Phúc", role: "Kỹ sư phần mềm", text: "Build PC lần đầu, được support từ A-Z. Nhân viên tư vấn linh kiện phù hợp ngân sách, lắp ráp miễn phí.", avatar: "LH", color: "bg-green-600" },
              ].map((t) => (
                <blockquote key={t.name} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex gap-1 mb-3" aria-label="5 sao">
                    {[1,2,3,4,5].map((s) => <svg key={s} viewBox="0 0 24 24" className="w-4 h-4 text-amber-400 fill-current" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>)}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">"{t.text}"</p>
                  <footer className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`} aria-hidden="true">{t.avatar}</div>
                    <div>
                      <cite className="not-italic font-semibold text-slate-900 text-sm">{t.name}</cite>
                      <div className="text-slate-400 text-xs">{t.role}</div>
                    </div>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>

        {/* ── Blog preview ── */}
        <section className="py-16 bg-slate-50 border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Tin tức & Review</h2>
                <p className="text-slate-400 text-sm mt-1">Cập nhật công nghệ mới nhất từ đội ngũ NitroTech</p>
              </div>
              <Link href="/blog" className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer flex items-center gap-1">
                Xem tất cả
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { slug: "review-macbook-pro-m4", cat: "Review", catColor: "bg-blue-100 text-blue-700", title: "Review MacBook Pro M4: Hiệu năng vượt trội, pin trâu nhất từ trước đến nay", date: "15 tháng 1, 2025", readTime: "12 phút đọc" },
                { slug: "chon-ram-ddr5", cat: "Hướng dẫn", catColor: "bg-amber-100 text-amber-700", title: "Hướng dẫn chọn RAM DDR5 2025: Tốc độ nào là đủ?", date: "13 tháng 1, 2025", readTime: "8 phút đọc" },
                { slug: "ai-pc-2025", cat: "Tin tức", catColor: "bg-emerald-100 text-emerald-700", title: "AI PC 2025: Kỷ nguyên mới của máy tính cá nhân", date: "10 tháng 1, 2025", readTime: "6 phút đọc" },
              ].map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer flex flex-col">
                  <div className="aspect-video bg-slate-100 flex items-center justify-center">
                    <svg viewBox="0 0 80 45" className="w-20 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
                      <rect width="80" height="45" rx="4" fill="#F1F5F9"/>
                      <rect x="20" y="10" width="40" height="25" rx="3" fill="white" fillOpacity="0.6"/>
                      <rect x="25" y="15" width="30" height="3" rx="1.5" fill="currentColor" fillOpacity="0.3"/>
                      <rect x="25" y="21" width="22" height="3" rx="1.5" fill="currentColor" fillOpacity="0.2"/>
                      <rect x="25" y="27" width="26" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15"/>
                    </svg>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit mb-3 ${post.catColor}`}>{post.cat}</span>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">{post.title}</h3>
                    <div className="mt-auto flex items-center gap-2 text-xs text-slate-400">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Newsletter CTA ── */}
        <section className="py-16 bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="rounded-3xl bg-blue-600 p-10 sm:p-14 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Giảm ngay 500.000₫ cho đơn đầu tiên
              </h2>
              <p className="text-blue-100 text-sm mb-8 max-w-md mx-auto">
                Đăng ký nhận voucher và miễn phí giao hàng cho tất cả đơn hàng trong tháng đầu.
              </p>
              <NewsletterForm />
              <p className="text-blue-200 text-xs mt-4">Không spam. Hủy đăng ký bất cứ lúc nào.</p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
