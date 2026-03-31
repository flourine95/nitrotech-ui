import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Tài khoản của tôi" }

const recentOrders = [
  { id: "NT-2025-0312", date: "12/03/2025", items: "MacBook Pro M4, RTX 4080", total: "65.490.000₫", status: "delivered" },
  { id: "NT-2025-0289", date: "28/02/2025", items: "Samsung 990 Pro 2TB × 2", total: "6.580.000₫", status: "delivered" },
  { id: "NT-2025-0301", date: "05/03/2025", items: "Corsair 32GB DDR5", total: "2.490.000₫", status: "shipping" },
]

const statusMap: Record<string, { label: string; color: string }> = {
  pending:   { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-700" },
  confirmed: { label: "Đã xác nhận",  color: "bg-blue-100 text-blue-700" },
  shipping:  { label: "Đang giao",    color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Đã nhận",      color: "bg-green-100 text-green-700" },
  cancelled: { label: "Đã hủy",       color: "bg-slate-100 text-slate-500" },
}

export default function AccountPage() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 sm:p-8 text-white">
        <p className="text-slate-400 text-sm mb-1">Xin chào trở lại,</p>
        <h1 className="text-2xl font-bold mb-4">Nguyễn Văn A 👋</h1>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Đơn hàng", value: "12" },
            { label: "Yêu thích", value: "8" },
            { label: "Điểm thưởng", value: "1.240" },
          ].map((s) => (
            <div key={s.label} className="bg-white/10 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-slate-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/account/orders", label: "Đơn hàng", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, color: "text-blue-600 bg-blue-50" },
          { href: "/account/wishlist", label: "Yêu thích", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, color: "text-rose-600 bg-rose-50" },
          { href: "/account/addresses", label: "Địa chỉ", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, color: "text-green-600 bg-green-50" },
          { href: "/account/security", label: "Bảo mật", icon: <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, color: "text-purple-600 bg-purple-50" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="flex flex-col items-center gap-2.5 p-5 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center`}>{a.icon}</div>
            <span className="text-sm font-medium text-slate-700">{a.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Đơn hàng gần đây</h2>
          <Link href="/account/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">Xem tất cả</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {recentOrders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm text-slate-900">{order.id}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusMap[order.status].color}`}>
                    {statusMap[order.status].label}
                  </span>
                </div>
                <div className="text-xs text-slate-400 truncate">{order.items}</div>
                <div className="text-xs text-slate-400 mt-0.5">{order.date}</div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                <span className="font-bold text-sm text-slate-900">{order.total}</span>
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Loyalty points */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Điểm thưởng NitroTech</h2>
          <span className="text-2xl font-bold text-blue-600">1.240 điểm</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-blue-500 rounded-full" style={{ width: "62%" }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>1.240 / 2.000 điểm</span>
          <span>Còn 760 điểm để lên hạng Vàng</span>
        </div>
      </div>
    </div>
  )
}
