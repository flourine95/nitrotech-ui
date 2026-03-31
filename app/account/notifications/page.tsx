"use client"

import { useState } from "react"
import type { Metadata } from "next"

// Note: metadata export is not used in client components but kept for reference
// Use a separate layout or server wrapper if needed
// export const metadata: Metadata = { title: "Thông báo" }

type NotifType = "order" | "promo" | "system"
type FilterTab = "all" | NotifType

interface Notification {
  id: number
  type: NotifType
  title: string
  desc: string
  time: string
  read: boolean
}

const INITIAL_NOTIFS: Notification[] = [
  { id: 1, type: "order", title: "Đơn hàng #NT2025001 đã được xác nhận", desc: "Đơn hàng MacBook Pro M4 của bạn đang được chuẩn bị giao.", time: "2 phút trước", read: false },
  { id: 2, type: "promo", title: "Flash Sale hôm nay — Giảm đến 20%", desc: "Hàng trăm sản phẩm linh kiện PC đang được giảm giá mạnh. Nhanh tay kẻo hết!", time: "1 giờ trước", read: false },
  { id: 3, type: "order", title: "Đơn hàng #NT2025002 đang giao hàng", desc: "Shipper đang trên đường đến địa chỉ của bạn. Dự kiến giao trong 30 phút.", time: "3 giờ trước", read: false },
  { id: 4, type: "system", title: "Cập nhật chính sách bảo mật", desc: "Chúng tôi đã cập nhật chính sách bảo mật. Vui lòng đọc để nắm rõ quyền lợi.", time: "Hôm qua", read: true },
  { id: 5, type: "promo", title: "Ưu đãi dành riêng cho bạn", desc: "Nhận ngay voucher giảm 500K cho đơn hàng tiếp theo từ 5 triệu đồng.", time: "Hôm qua", read: true },
  { id: 6, type: "order", title: "Đơn hàng #NT2024998 đã giao thành công", desc: "Cảm ơn bạn đã mua hàng! Hãy để lại đánh giá để nhận điểm thưởng.", time: "2 ngày trước", read: true },
  { id: 7, type: "system", title: "Đăng nhập từ thiết bị mới", desc: "Phát hiện đăng nhập từ Chrome trên Windows tại TP.HCM. Nếu không phải bạn, hãy đổi mật khẩu ngay.", time: "3 ngày trước", read: true },
  { id: 8, type: "promo", title: "Sản phẩm trong wishlist đang giảm giá", desc: "RTX 4080 Super trong danh sách yêu thích của bạn vừa giảm 10%.", time: "4 ngày trước", read: true },
  { id: 9, type: "order", title: "Yêu cầu đổi trả đã được duyệt", desc: "Yêu cầu đổi trả đơn #NT2024990 đã được chấp thuận. Hoàn tiền trong 3-5 ngày.", time: "5 ngày trước", read: true },
  { id: 10, type: "system", title: "Tài khoản được nâng cấp lên VIP", desc: "Chúc mừng! Bạn đã đạt hạng VIP với nhiều ưu đãi độc quyền.", time: "1 tuần trước", read: true },
]

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "order", label: "Đơn hàng" },
  { key: "promo", label: "Khuyến mãi" },
  { key: "system", label: "Hệ thống" },
]

function OrderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  )
}

function PromoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
      <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>
  )
}

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

const iconConfig: Record<NotifType, { icon: React.ReactNode; bg: string; color: string }> = {
  order: { icon: <OrderIcon />, bg: "bg-blue-100", color: "text-blue-600" },
  promo: { icon: <PromoIcon />, bg: "bg-amber-100", color: "text-amber-600" },
  system: { icon: <SystemIcon />, bg: "bg-slate-100", color: "text-slate-600" },
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFS)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const filtered = activeTab === "all" ? notifs : notifs.filter((n) => n.type === activeTab)
  const unreadCount = notifs.filter((n) => !n.read).length

  function markAllRead() {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function markRead(id: number) {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Thông báo</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-slate-500 mt-0.5">{unreadCount} thông báo chưa đọc</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-full w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <p className="font-semibold text-slate-900 mb-1">Không có thông báo</p>
          <p className="text-sm text-slate-500">Bạn đã xem hết tất cả thông báo.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const cfg = iconConfig[notif.type]
            return (
              <button
                key={notif.id}
                onClick={() => markRead(notif.id)}
                className={`w-full text-left flex items-start gap-4 p-4 rounded-2xl border transition-colors duration-200 cursor-pointer ${
                  notif.read
                    ? "bg-white border-slate-200 hover:bg-slate-50"
                    : "bg-blue-50/60 border-blue-100 hover:bg-blue-50"
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm font-semibold leading-snug ${notif.read ? "text-slate-700" : "text-slate-900"}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-slate-400 whitespace-nowrap">{notif.time}</span>
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Chưa đọc" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
