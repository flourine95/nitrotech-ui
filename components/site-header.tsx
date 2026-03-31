"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navLinks = [
  { label: "Laptop", href: "/products?cat=laptop" },
  { label: "Linh kiện PC", href: "/products?cat=components" },
  { label: "Màn hình", href: "/products?cat=monitors" },
  { label: "Phụ kiện", href: "/products?cat=accessories" },
  { label: "Khuyến mãi", href: "/products?sale=true" },
  { label: "Blog", href: "/blog" },
]

const categories = [
  { label: "Tất cả", href: "/products" },
  { label: "Laptop Gaming", href: "/products?cat=laptop-gaming" },
  { label: "Laptop Văn phòng", href: "/products?cat=laptop-office" },
  { label: "PC Desktop", href: "/products?cat=desktop" },
  { label: "CPU & Bo mạch", href: "/products?cat=cpu" },
  { label: "Card đồ họa", href: "/products?cat=gpu" },
  { label: "RAM & SSD", href: "/products?cat=storage" },
  { label: "Màn hình", href: "/products?cat=monitors" },
  { label: "Bàn phím & Chuột", href: "/products?cat=peripherals" },
  { label: "Tai nghe", href: "/products?cat=audio" },
]

const announcements = [
  { text: "Miễn phí giao hàng cho đơn từ 500K", href: "/products" },
  { text: "Flash Sale hôm nay — Giảm đến 20% linh kiện PC", href: "/products?sale=true" },
  { text: "Trả góp 0% lãi suất — Áp dụng cho tất cả sản phẩm", href: "/products" },
  { text: "Giao hàng trong 2 giờ tại TP.HCM & Hà Nội", href: "/shipping" },
  { text: "Bảo hành chính hãng toàn quốc — Đổi trả trong 30 ngày", href: "/warranty" },
]

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const pathname = usePathname()

  const isLoggedIn = true
  const userName = "Nguyễn Văn A"

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top bar — marquee */}
      <div className="bg-slate-800 text-slate-200 text-xs py-2 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-800 to-transparent z-10 pointer-events-none" aria-hidden="true" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-800 to-transparent z-10 pointer-events-none" aria-hidden="true" />

        <div
          className="flex whitespace-nowrap"
          style={{ animation: "marquee 35s linear infinite" }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = "paused")}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = "running")}
          aria-live="off"
        >
          {[...announcements, ...announcements].map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className="inline-flex items-center gap-3 px-8 hover:text-white transition-colors duration-150 cursor-pointer shrink-0"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" aria-hidden="true" />
              {a.text}
            </Link>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
          <span className="font-bold text-lg text-slate-900">Nitro<span className="text-blue-600">Tech</span></span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 cursor-pointer ${
                pathname === l.href
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Link href="/search" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 cursor-pointer" aria-label="Tìm kiếm">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-xs">Tìm kiếm...</span>
          </Link>
          {/* Cart */}
          <Link href="/cart" className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200 cursor-pointer" aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}>
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {/* Login / Account */}
          {isLoggedIn ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0" aria-hidden="true">
                  {userName.split(" ").pop()?.[0]}
                </div>
                <span className="max-w-[80px] truncate">{userName.split(" ").pop()}</span>
                <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform duration-200 ${accountOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>

              {accountOpen && (
                <>
                  {/* Backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} aria-hidden="true" />
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <div className="text-sm font-semibold text-slate-900 truncate">{userName}</div>
                      <div className="text-xs text-slate-400 truncate">email@example.com</div>
                    </div>
                    <div className="py-1.5">
                      {[
                        { href: "/account", label: "Tổng quan", icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
                        { href: "/account/orders", label: "Đơn hàng", icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
                        { href: "/account/wishlist", label: "Yêu thích", icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
                        { href: "/account/profile", label: "Hồ sơ", icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                        >
                          <span className="text-slate-400">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 py-1.5">
                      <Link
                        href="/about"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                        Về NitroTech
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                        Liên hệ
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 py-1.5">
                      <Link
                        href="/login"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 transition-colors duration-150 cursor-pointer"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                        Đăng xuất
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login" className="hidden sm:block px-5 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
              Đăng nhập
            </Link>
          )}
          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12"/> : <path d="M3 12h18M3 6h18M3 18h18"/>}
            </svg>
          </button>
        </div>
      </nav>

      {/* Category bar */}
      <div className="border-t border-slate-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 py-2 overflow-x-auto">
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                pathname === c.href
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3">
          <div className="flex flex-col gap-1 mb-3">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              >
                {l.label}
              </Link>
            ))}
          </div>
          {isLoggedIn ? (
            <div className="flex flex-col gap-1">
              {[
                { href: "/account", label: "Tài khoản của tôi" },
                { href: "/account/orders", label: "Đơn hàng" },
                { href: "/account/wishlist", label: "Yêu thích" },
              ].map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                  {l.label}
                </Link>
              ))}
              <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-1 block w-full py-2.5 rounded-full text-sm font-semibold border border-rose-200 text-rose-500 text-center cursor-pointer">
                Đăng xuất
              </Link>
            </div>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white text-center cursor-pointer">
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
