import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Chi tiết đơn hàng" }

const orderItems = [
  { slug: "macbook-pro-m4", name: "MacBook Pro M4", variant: "16GB / 512GB / Space Black", price: "42.990.000₫", qty: 1 },
  { slug: "rtx-4080-super", name: "RTX 4080 Super", variant: "16GB GDDR6X", price: "22.500.000₫", qty: 1 },
]

const timeline = [
  { label: "Đặt hàng thành công", time: "12/03/2025 09:14", done: true },
  { label: "Đã xác nhận đơn hàng", time: "12/03/2025 09:32", done: true },
  { label: "Đang đóng gói", time: "12/03/2025 10:05", done: true },
  { label: "Đã giao cho đơn vị vận chuyển", time: "12/03/2025 11:20", done: true },
  { label: "Đang giao hàng", time: "12/03/2025 13:45", done: true },
  { label: "Giao hàng thành công", time: "12/03/2025 15:10", done: true },
]

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/account/orders" className="text-slate-400 hover:text-slate-700 transition-colors duration-150 cursor-pointer">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">Đơn hàng {params.id}</h1>
          </div>
          <p className="text-sm text-slate-400">Đặt ngày 12/03/2025 lúc 09:14</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full bg-green-100 text-green-700">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" aria-hidden="true" />
          Đã giao hàng
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Sản phẩm đã đặt</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {orderItems.map((item) => (
                <div key={item.slug} className="flex gap-4 px-6 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 40 30" className="w-10 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="2" y="2" width="36" height="26" rx="2"/>
                      <rect x="5" y="5" width="30" height="20" rx="1" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition-colors duration-150 cursor-pointer">
                      {item.name}
                    </Link>
                    <div className="text-xs text-slate-400 mt-0.5">{item.variant}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Số lượng: {item.qty}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm text-slate-900">{item.price}</div>
                    <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-150">
                      Đánh giá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-5">Trạng thái đơn hàng</h2>
            <ol className="relative">
              {timeline.map((step, i) => (
                <li key={step.label} className={`flex gap-4 ${i < timeline.length - 1 ? "pb-5" : ""}`}>
                  {/* Line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 z-10 ${step.done ? "bg-green-500" : "bg-slate-200"}`}>
                      {step.done && (
                        <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current" aria-hidden="true">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`w-px flex-1 mt-1 ${step.done ? "bg-green-300" : "bg-slate-200"}`} aria-hidden="true" />
                    )}
                  </div>
                  <div className="pb-1">
                    <div className={`text-sm font-medium ${step.done ? "text-slate-900" : "text-slate-400"}`}>{step.label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{step.time}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-5">
          {/* Payment */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Thanh toán</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span className="text-slate-900 font-medium">65.990.000₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vận chuyển</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giảm giá</span>
                <span className="text-rose-600 font-medium">−500.000₫</span>
              </div>
              <div className="flex justify-between pt-2.5 border-t border-slate-100">
                <span className="font-bold text-slate-900">Tổng cộng</span>
                <span className="font-bold text-base text-slate-900">65.490.000₫</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              Thẻ tín dụng ****4242
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-900 mb-4">Địa chỉ giao hàng</h2>
            <div className="text-sm text-slate-600 space-y-1">
              <div className="font-semibold text-slate-900">Nguyễn Văn A</div>
              <div>0901 234 567</div>
              <div>123 Nguyễn Huệ, Phường Bến Nghé</div>
              <div>Quận 1, TP. Hồ Chí Minh</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
              Mua lại
            </button>
            <button className="w-full py-3 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
              Tải hóa đơn PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
