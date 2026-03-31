import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = { title: "Đặt hàng thành công" }

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader cartCount={0} />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          {/* Success icon */}
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-600 fill-current" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Đặt hàng thành công!</h1>
          <p className="text-slate-500 mb-8">
            Cảm ơn bạn đã mua hàng tại NitroTech. Đơn hàng của bạn đang được xử lý.
          </p>

          {/* Order info card */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-400 mb-0.5">Mã đơn hàng</div>
                <div className="font-bold text-slate-900">NT-2025-0313</div>
              </div>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-amber-100 text-amber-700">
                Đang xử lý
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { name: "MacBook Pro M4", variant: "16GB / 512GB", price: "42.990.000₫" },
                { name: "RTX 4080 Super", variant: "16GB GDDR6X", price: "22.500.000₫" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.variant}</div>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 flex-shrink-0">{item.price}</div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng cộng</span>
                <span className="font-bold text-slate-900">65.490.000₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức</span>
                <span className="text-slate-700">Thẻ tín dụng ****4242</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giao hàng</span>
                <span className="text-slate-700">Dự kiến trong 2 giờ</span>
              </div>
            </div>
          </div>

          {/* Email notice */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 border border-blue-100 text-left mb-8">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
            <p className="text-sm text-blue-700">
              Xác nhận đơn hàng đã được gửi đến <span className="font-semibold">email@example.com</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/account/orders/NT-2025-0313" className="flex-1 py-3 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer text-center">
              Theo dõi đơn hàng
            </Link>
            <Link href="/products" className="flex-1 py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer text-center">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
