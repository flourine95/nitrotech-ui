'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getMe } from '@/lib/api/auth';
import { BrandLogo } from '@/components/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useCartStore } from '@/stores/cart-store';
import { MegaCategoryMenu } from '@/components/mega-category-menu';

const navLinks = [
  { label: 'Khuyến mãi', href: '/products?sale=true' },
  { label: 'Blog', href: '/blog' },
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

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // Get user from TanStack Query
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  const isLoggedIn = !!user;
  const userName = user?.name ?? 'Tài khoản';

  const { totalItems, fetchCart } = useCartStore();

  useEffect(() => {
    if (isLoggedIn) {
      void fetchCart();
    }
  }, [isLoggedIn, fetchCart]);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      toast.success('Đã đăng xuất');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="relative overflow-hidden bg-primary py-2 text-xs text-primary-foreground/80">
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-0 z-10 w-12 bg-linear-to-r from-primary to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-10 w-12 bg-linear-to-l from-primary to-transparent"
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
              className="inline-flex shrink-0 cursor-pointer items-center gap-3 px-8 transition-colors duration-150 hover:text-primary-foreground"
            >
              <span className="size-1.5 shrink-0 rounded-full bg-primary-foreground/70" aria-hidden="true" />
              {a.text}
            </Link>
          ))}
        </div>
      </div>

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6">
        <BrandLogo />

        <div className="hidden items-center gap-2 md:flex">
          <MegaCategoryMenu />

          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`cursor-pointer rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                pathname === l.href.split('?')[0]
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="hidden h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-muted/55 px-3.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground sm:flex"
            aria-label="Tìm kiếm"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-xs font-medium">Tìm kiếm...</span>
          </Link>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/cart"
                className="relative flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
                aria-label={`Giỏ hàng (${totalItems} sản phẩm)`}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {totalItems}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            <TooltipContent side="bottom">Giỏ hàng ({totalItems})</TooltipContent>
          </Tooltip>
          {isLoggedIn ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex h-10 cursor-pointer items-center gap-2 rounded-full bg-primary px-3.5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
                aria-expanded={accountOpen}
                aria-haspopup="true"
              >
                <div
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 text-[10px] font-bold"
                  aria-hidden="true"
                >
                  {userName.split(' ').pop()?.[0]}
                </div>
                <span className="max-w-20 truncate">{userName.split(' ').pop()}</span>
                <svg
                  viewBox="0 0 24 24"
                  className={`size-3.5 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
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
                  <div className="absolute top-full right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
                    <div className="border-b border-border px-4 py-3">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {userName}
                      </div>
                      <div className="truncate text-xs text-muted-foreground">{user?.email ?? 'email@example.com'}</div>
                    </div>
                    <div className="py-1.5">
                      {[
                        {
                          href: '/account',
                          label: 'Tổng quan',
                          icon: (
                            <svg
                              viewBox="0 0 24 24"
                              className="size-4"
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
                              className="size-4"
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
                              className="size-4"
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
                              className="size-4"
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
                              className="size-4"
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
                          className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                        >
                          <span className="text-muted-foreground/70">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-border py-1.5">
                      <Link
                        href="/about"
                        onClick={() => setAccountOpen(false)}
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-4 text-muted-foreground/70"
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
                        className="flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-4 text-muted-foreground/70"
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
                    <div className="border-t border-border py-1.5">
                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-destructive transition-colors duration-150 hover:bg-destructive/10"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="size-4"
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
              className="hidden h-10 cursor-pointer items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 sm:flex"
            >
              Đăng nhập
            </Link>
          )}
          <button
            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="mb-3 flex flex-col gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
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
                  className="cursor-pointer rounded-xl px-4 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
                >
                  {l.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMobileOpen(false);
                  handleLogout();
                }}
                className="mt-1 w-full cursor-pointer rounded-full border border-destructive/30 py-2.5 text-center text-sm font-semibold text-destructive"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="block w-full cursor-pointer rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-primary-foreground"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
