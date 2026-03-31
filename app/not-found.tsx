import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const quickLinks = [
  { label: "Laptop", href: "/products?cat=laptop" },
  { label: "GPU", href: "/products?cat=gpu" },
  { label: "Màn hình", href: "/products?cat=monitors" },
  { label: "Khuyến mãi", href: "/products?sale=true" },
]

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 py-20">
        {/* 404 number */}
        <div
          className="text-[120px] sm:text-[160px] font-black leading-none select-none mb-4"
          style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
          aria-hidden="true"
        >
          404
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 text-center">
          Trang không tìm thấy
        </h1>
        <p className="text-slate-500 text-center max-w-md mb-10 leading-relaxed">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
          >
            Về trang chủ
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
          >
            Xem sản phẩm
          </Link>
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>

        {/* Quick links */}
        <div className="text-center">
          <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-medium">Khám phá nhanh</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-sm text-slate-600 bg-white border border-slate-200 hover:border-slate-400 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
