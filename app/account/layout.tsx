import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { SiteHeaderServer as SiteHeader } from '@/components/site-header-server';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';

const sidebarLinks = [
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
        aria-hidden="true"
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
        aria-hidden="true"
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
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    href: '/account/profile',
    label: 'Thông tin cá nhân',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: '/account/addresses',
    label: 'Địa chỉ',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: '/account/security',
    label: 'Bảo mật',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    href: '/account/notifications',
    label: 'Thông báo',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
  },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/login?from=/account');

  return (
    <>
      <SiteHeader cartCount={3} />
      <div className="min-h-screen bg-slate-50">
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
            <span className="font-medium text-slate-700">Tài khoản</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-36">
                {/* User info */}
                <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    NV
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      Nguyễn Văn A
                    </div>
                    <div className="truncate text-xs text-slate-400">email@example.com</div>
                  </div>
                </div>

                {/* Nav */}
                <nav aria-label="Menu tài khoản">
                  <ul className="space-y-1">
                    {sidebarLinks.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-slate-600 transition-all duration-200 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                        >
                          <span className="text-slate-400">{link.icon}</span>
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li className="mt-2 border-t border-slate-200 pt-2">
                      <Link
                        href="/login"
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-rose-500 transition-colors duration-200 hover:bg-rose-50"
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
                      </Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  );
}
