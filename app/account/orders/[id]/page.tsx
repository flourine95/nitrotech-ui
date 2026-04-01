import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Chi tiết đơn hàng" }

const orderItems = [
  {
    slug: "macbook-pro-m4",
    name: "MacBook Pro M4",
    variant: "16GB / 512GB / Space Black",
    price: "42.990.000₫",
    qty: 1,
  },
  {
    slug: "rtx-4080-super",
    name: "RTX 4080 Super",
    variant: "16GB GDDR6X",
    price: "22.500.000₫",
    qty: 1,
  },
]

const timeline = [
  { label: "Đặt hàng thành công", time: "12/03/2025 09:14", done: true },
  { label: "Đã xác nhận đơn hàng", time: "12/03/2025 09:32", done: true },
  { label: "Đang đóng gói", time: "12/03/2025 10:05", done: true },
  {
    label: "Đã giao cho đơn vị vận chuyển",
    time: "12/03/2025 11:20",
    done: true,
  },
  { label: "Đang giao hàng", time: "12/03/2025 13:45", done: true },
  { label: "Giao hàng thành công", time: "12/03/2025 15:10", done: true },
]

export default function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Link
              href="/account/orders"
              className="cursor-pointer text-slate-400 transition-colors duration-150 hover:text-slate-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </Link>
            <h1 className="text-xl font-bold text-slate-900">
              Đơn hàng {params.id}
            </h1>
          </div>
          <p className="text-sm text-slate-400">
            Đặt ngày 12/03/2025 lúc 09:14
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700">
          <span
            className="h-1.5 w-1.5 rounded-full bg-green-500"
            aria-hidden="true"
          />
          Đã giao hàng
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Items */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-bold text-slate-900">Sản phẩm đã đặt</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {orderItems.map((item) => (
                <div key={item.slug} className="flex gap-4 px-6 py-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50">
                    <svg
                      viewBox="0 0 40 30"
                      className="h-auto w-10 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="2" y="2" width="36" height="26" rx="2" />
                      <rect
                        x="5"
                        y="5"
                        width="30"
                        height="20"
                        rx="1"
                        fill="rgba(59,130,246,0.04)"
                        stroke="rgba(59,130,246,0.15)"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="cursor-pointer text-sm font-semibold text-slate-900 transition-colors duration-150 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {item.variant}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Số lượng: {item.qty}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold text-slate-900">
                      {item.price}
                    </div>
                    <button className="mt-2 cursor-pointer text-xs text-blue-600 transition-colors duration-150 hover:text-blue-700">
                      Đánh giá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-900">
              Trạng thái đơn hàng
            </h2>
            <ol className="relative">
              {timeline.map((step, i) => (
                <li
                  key={step.label}
                  className={`flex gap-4 ${i < timeline.length - 1 ? "pb-5" : ""}`}
                >
                  {/* Line */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${step.done ? "bg-green-500" : "bg-slate-200"}`}
                    >
                      {step.done && (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-3 w-3 fill-current text-white"
                          aria-hidden="true"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div
                        className={`mt-1 w-px flex-1 ${step.done ? "bg-green-300" : "bg-slate-200"}`}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="pb-1">
                    <div
                      className={`text-sm font-medium ${step.done ? "text-slate-900" : "text-slate-400"}`}
                    >
                      {step.label}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {step.time}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-5">
          {/* Payment */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Thanh toán</h2>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tạm tính</span>
                <span className="font-medium text-slate-900">65.990.000₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Vận chuyển</span>
                <span className="font-medium text-green-600">Miễn phí</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giảm giá</span>
                <span className="font-medium text-rose-600">−500.000₫</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2.5">
                <span className="font-bold text-slate-900">Tổng cộng</span>
                <span className="text-base font-bold text-slate-900">
                  65.490.000₫
                </span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4 text-sm text-slate-500">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 text-blue-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Thẻ tín dụng ****4242
            </div>
          </div>

          {/* Shipping address */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-900">Địa chỉ giao hàng</h2>
            <div className="space-y-1 text-sm text-slate-600">
              <div className="font-semibold text-slate-900">Nguyễn Văn A</div>
              <div>0901 234 567</div>
              <div>123 Nguyễn Huệ, Phường Bến Nghé</div>
              <div>Quận 1, TP. Hồ Chí Minh</div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700">
              Mua lại
            </button>
            <button className="w-full cursor-pointer rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100">
              Tải hóa đơn PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
