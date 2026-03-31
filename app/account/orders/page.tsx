import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Đơn hàng của tôi" }

const orders = [
  { id: "NT-2025-0312", date: "12/03/2025", items: [{ name: "MacBook Pro M4", qty: 1 }, { name: "RTX 4080 Super", qty: 1 }], total: "65.490.000₫", status: "delivered", payMethod: "Thẻ tín dụng" },
  { id: "NT-2025-0301", date: "05/03/2025", items: [{ name: "Corsair 32GB DDR5", qty: 1 }], total: "2.490.000₫", status: "shipping", payMethod: "MoMo" },
  { id: "NT-2025-0289", date: "28/02/2025", items: [{ name: "Samsung 990 Pro 2TB", qty: 2 }], total: "6.580.000₫", status: "delivered", payMethod: "COD" },
  { id: "NT-2025-0271", date: "18/02/2025", items: [{ name: "LG UltraGear 27\" 4K", qty: 1 }], total: "12.990.000₫", status: "delivered", payMethod: "VNPay" },
  { id: "NT-2025-0244", date: "02/02/2025", items: [{ name: "Intel Core i9-14900K", qty: 1 }], total: "8.990.000₫", status: "cancelled", payMethod: "Thẻ tín dụng" },
]

const statusMap: Record<string, { label: string; color: string; dot: string }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700",   dot: "bg-amber-400" },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700",     dot: "bg-blue-400" },
  shipping:  { label: "Đang giao",    color: "bg-purple-100 text-purple-700", dot: "bg-purple-400" },
  delivered: { label: "Đã nhận",      color: "bg-green-100 text-green-700",   dot: "bg-green-400" },
  cancelled: { label: "Đã hủy",       color: "bg-slate-100 text-slate-500",   dot: "bg-slate-400" },
}

const tabs = ["Tất cả", "Đang giao", "Đã nhận", "Đã hủy"]

export default function OrdersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Đơn hàng của tôi</h1>
        <span className="text-sm text-slate-400">{orders.length} đơn hàng</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-full w-fit">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${i === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="font-semibold text-sm text-slate-900">{order.id}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${statusMap[order.status].color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusMap[order.status].dot}`} aria-hidden="true" />
                  {statusMap[order.status].label}
                </span>
              </div>
              <div className="text-xs text-slate-400">{order.date}</div>
            </div>

            {/* Items */}
            <div className="px-6 py-4">
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{item.name}</div>
                      <div className="text-xs text-slate-400">Số lượng: {item.qty}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <div className="text-xs text-slate-400">
                  Thanh toán: <span className="text-slate-600 font-medium">{order.payMethod}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Tổng tiền</div>
                    <div className="font-bold text-base text-slate-900">{order.total}</div>
                  </div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer whitespace-nowrap"
                  >
                    Chi tiết
                  </Link>
                  {order.status === "delivered" && (
                    <button className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer whitespace-nowrap">
                      Mua lại
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
