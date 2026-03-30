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

export function SiteHeader({ cartCount = 0 }: { cartCount?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 text-center px-4">
        Miễn phí giao hàng cho đơn từ 500K —{" "}
        <Link href="/products?sale=true" className="text-blue-400 font-medium hover:text-blue-300 transition-colors duration-150 cursor-pointer">
          Xem ngay
        </Link>
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
          <button className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full text-sm text-slate-400 bg-slate-100 hover:bg-slate-200 transition-colors duration-200 cursor-pointer" aria-label="Tìm kiếm">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <span className="text-xs">Tìm kiếm...</span>
          </button>
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
          {/* Login */}
          <Link href="/login" className="hidden sm:block px-5 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
            Đăng nhập
          </Link>
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
          <Link href="/login" onClick={() => setMobileOpen(false)} className="block w-full py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white text-center cursor-pointer">
            Đăng nhập
          </Link>
        </div>
      )}
    </header>
  )
}
