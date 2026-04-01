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
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-20">
        {/* 404 number */}
        <div
          className="mb-4 text-[120px] leading-none font-black select-none sm:text-[160px]"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
          aria-hidden="true"
        >
          404
        </div>

        <h1 className="mb-3 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          Trang không tìm thấy
        </h1>
        <p className="mb-10 max-w-md text-center leading-relaxed text-slate-500">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không
          khả dụng.
        </p>

        {/* Action buttons */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="cursor-pointer rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
          >
            Về trang chủ
          </Link>
          <Link
            href="/products"
            className="cursor-pointer rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
          >
            Xem sản phẩm
          </Link>
          <Link
            href="/contact"
            className="cursor-pointer rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
          >
            Liên hệ hỗ trợ
          </Link>
        </div>

        {/* Quick links */}
        <div className="text-center">
          <p className="mb-3 text-xs font-medium tracking-wider text-slate-400 uppercase">
            Khám phá nhanh
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-colors duration-200 hover:border-slate-400 hover:text-slate-900"
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
