"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navItems = [
  {
    label: "Tổng quan",
    href: "/dashboard",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: "Sản phẩm",
    href: "/dashboard/products",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    label: "Đơn hàng",
    href: "/dashboard/orders",
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
    badge: 12,
  },
  {
    label: "Khách hàng",
    href: "/dashboard/customers",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    label: "Doanh thu",
    href: "/dashboard/revenue",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    label: "Kho hàng",
    href: "/dashboard/inventory",
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
    label: "Cài đặt",
    href: "/dashboard/settings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2" />
      </svg>
    ),
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-full flex-col bg-slate-900 transition-all duration-300 ${collapsed ? "w-16" : "w-60"} ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} `}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 border-b border-slate-800 px-4 py-5 ${collapsed ? "justify-center" : ""}`}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 fill-current text-white"
              aria-hidden="true"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          {!collapsed && (
            <span className="text-base font-bold text-white">
              Nitro<span className="text-blue-400">Tech</span>
              <span className="ml-1.5 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                Admin
              </span>
            </span>
          )}
        </div>

        {/* Nav */}
        <nav
          className="flex-1 overflow-y-auto py-4"
          aria-label="Dashboard navigation"
        >
          <ul className="flex flex-col gap-0.5 px-2">
            {navItems.map((item) => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:bg-slate-800 hover:text-white"
                    } ${collapsed ? "justify-center" : ""} `}
                    title={collapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="ml-auto min-w-4.5 rounded-full bg-blue-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                        {item.badge}
                      </span>
                    )}
                    {collapsed && item.badge && (
                      <span
                        className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-500"
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Collapse toggle + user */}
        <div className="flex flex-col gap-2 border-t border-slate-800 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition-colors duration-150 hover:bg-slate-800 hover:text-white md:flex ${collapsed ? "justify-center" : ""} `}
            aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {!collapsed && <span>Thu gọn</span>}
          </button>
          <div
            className={`flex items-center gap-2.5 px-2 py-2 ${collapsed ? "justify-center" : ""}`}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white">
              A
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-white">
                  Admin
                </div>
                <div className="truncate text-xs text-slate-500">
                  admin@nitrotech.vn
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main */}
      <div
        className={`flex min-w-0 flex-1 flex-col transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-60"}`}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              className="cursor-pointer rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Mở menu"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className="relative hidden sm:block">
              <svg
                viewBox="0 0 24 24"
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Tìm kiếm..."
                className="w-56 rounded-xl border-0 bg-slate-100 py-2 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
                aria-label="Tìm kiếm trong dashboard"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Xem cửa hàng
            </Link>
            <button
              className="relative cursor-pointer rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Thông báo"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span
                className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500"
                aria-hidden="true"
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
