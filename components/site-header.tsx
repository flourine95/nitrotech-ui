'use client';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { logout } from '@/lib/auth';

const navLinks = [
  { label: 'Laptop', href: '/products?cat=laptop' },
  { label: 'Linh kiện PC', href: '/products?cat=components' },
  { label: 'Màn hình', href: '/products?cat=monitors' },
  { label: 'Phụ kiện', href: '/products?cat=accessories' },
  { label: 'Khuyến mãi', href: '/products?sale=true' },
  { label: 'Blog', href: '/blog' },
];

const categories = [
  { label: 'Tất cả', href: '/products' },
  { label: 'Laptop Gaming', href: '/products?cat=laptop-gaming' },
  { label: 'Laptop Văn phòng', href: '/products?cat=laptop-office' },
  { label: 'PC Desktop', href: '/products?cat=desktop' },
  { label: 'CPU & Bo mạch', href: '/products?cat=cpu' },
  { label: 'Card đồ họa', href: '/products?cat=gpu' },
  { label: 'RAM & SSD', href: '/products?cat=storage' },
  { label: 'Màn hình', href: '/products?cat=monitors' },
  { label: 'Bàn phím & Chuột', href: '/products?cat=peripherals' },
  { label: 'Tai nghe', href: '/products?cat=audio' },
];

const announcements = [
  { text: 'Miễn phí giao hàng cho đơn từ 500K', href: '/products' },
  {
    text: 'Flash Sale hôm nay — Giảm đến 20% linh kiện PC',
    href: '/products?sale=true',
  },
  {
    text: 'Trả góp 0% lãi suất — Áp dụng cho tất cả sản phẩm',
    href: '/products',
  },
  { text: 'Giao hàng trong 2 giờ tại TP.HCM & Hà Nội', href: '/shipping' },
  {
    text: 'Bảo hành chính hãng toàn quốc — Đổi trả trong 30 ngày',
    href: '/warranty',
  },
];

export function SiteHeader({
  cartCount = 0,
  initialUser,
}: {
  cartCount?: number;
  initialUser?: { name?: string | null; email?: string | null; image?: string | null } | null;
}) {
  const pathname = usePathname();
  const user = initialUser;
  const isLoggedIn = !!user;
  const userName = user?.name ?? 'Tài khoản';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [, startTransition] = useTransition();

  function handleLogout() {
    startTransition(() => {
      logout();
    });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      {/* Top bar — marquee */}
      <div className="relative overflow-hidden bg-slate-800 py-2 text-xs text-slate-200">
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-12 bg-linear-to-r from-slate-800 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-12 bg-linear-to-l from-slate-800 to-transparent"
          aria-hidden="true"
        />

        <div
          className="flex whitespace-nowrap"
          style={{ animation: 'marquee 35s linear infinite' }}
          onMouseEnter={(e) => (e.currentTarget.style.animationPlayState = 'paused')}
          onMouseLeave={(e) => (e.currentTarget.style.animationPlayState = 'running')}
          aria-live="off"
        >
          {[...announcements, ...announcements].map((a, i) => (
            <Link
              key={i}
              href={a.href}
              className="inline-flex shrink-0 cursor-pointer items-center gap-3 px-8 transition-colors duration-150 hover:text-white"
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              {a.text}
            </Link>
          ))}
        </div>
      </div>

      {/* Main nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex cursor-pointer items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-white" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-slate-900">
            Nitro<span className="text-blue-600">Tech</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                pathname === l.href
                  ? 'bg-slate-100 font-medium text-slate-900'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <Link
            href="/search"
            className="hidden cursor-pointer items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-400 transition-colors duration-200 hover:bg-slate-200 sm:flex"
            aria-label="Tìm kiếm"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs">Tìm kiếm...</span>
          </Link>
          {/* Cart */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/cart"
                className="relative cursor-pointer rounded-full p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
                aria-label={`Giỏ hàng (${cartCount} sản phẩm)`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Giỏ hàng ({cartCount})</TooltipContent>
          </Tooltip>
          {/* Login / Account */}
          {isLoggedIn ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <div
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold"
                  aria-hidden="true"
                >
                  {userName.split(' ').pop()?.[0]}
                </div>
                <span className="max-w-20 truncate">{userName.split(' ').pop()}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {accountOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountOpen(false)}
                    aria-hidden="true"
                  />
                  {/* Dropdown */}
                  <div className="absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {userName}
                      </div>
                      <div className="truncate text-xs text-slate-400">email@example.com</div>
                    </div>
                    <div className="py-1.5">
                      {[
                        {
                          href: '/account',
                          label: 'Tổng quan',
                          icon: (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                              <polyline points="9 22 9 12 15 12 15 22" />
                            </svg>
                          ),
                        },
                        {
                          href: '/account/orders',
                          label: 'Đơn hàng',
                          icon: (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 01-8 0" />
                            </svg>
                          ),
                        },
                        {
                          href: '/account/wishlist',
                          label: 'Yêu thích',
                          icon: (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                            </svg>
                          ),
                        },
                        {
                          href: '/compare',
                          label: 'So sánh',
                          icon: (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="3" y="3" width="7" height="18" rx="1" />
                              <rect x="14" y="3" width="7" height="18" rx="1" />
                            </svg>
                          ),
                        },
                        {
                          href: '/account/profile',
                          label: 'Hồ sơ',
                          icon: (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          ),
                        },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setAccountOpen(false)}
                          className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
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
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" />
                        </svg>
                        Về NitroTech
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setAccountOpen(false)}
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-slate-600 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                        </svg>
                        Liên hệ
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 py-1.5">
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-rose-500 transition-colors duration-150 hover:bg-rose-50"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden cursor-pointer rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 sm:block"
            >
              Đăng nhập
            </Link>
          )}
          {/* Mobile menu toggle */}
          <button
            className="cursor-pointer rounded-full p-2 text-slate-500 transition-colors duration-200 hover:bg-slate-100 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Category bar */}
      <div className="hidden border-t border-slate-100 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-6 py-2">
          {categories.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                pathname === c.href
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          <div className="mb-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
              >
                {l.label}
              </Link>
            ))}
          </div>
          {isLoggedIn ? (
            <div className="flex flex-col gap-1">
              {[
                { href: '/account', label: 'Tài khoản của tôi' },
                { href: '/account/orders', label: 'Đơn hàng' },
                { href: '/account/wishlist', label: 'Yêu thích' },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="cursor-pointer rounded-xl px-4 py-2.5 text-sm text-slate-600 transition-colors duration-200 hover:bg-slate-100"
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="mt-1 w-full cursor-pointer rounded-full border border-rose-200 py-2.5 text-center text-sm font-semibold text-rose-500"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full cursor-pointer rounded-full bg-slate-900 py-2.5 text-center text-sm font-semibold text-white"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
