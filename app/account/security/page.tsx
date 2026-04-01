"use client"
import { useState } from "react"

export default function SecurityPage() {
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [twoFA, setTwoFA] = useState(false)

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Bảo mật tài khoản</h1>

      {/* Change password */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-5">Đổi mật khẩu</h2>
        <form className="space-y-4 max-w-md" onSubmit={(e) => e.preventDefault()}>
          {[
            { id: "current", label: "Mật khẩu hiện tại", show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
            { id: "new", label: "Mật khẩu mới", show: showNew, toggle: () => setShowNew(!showNew) },
          ].map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
              <div className="relative">
                <input
                  id={f.id}
                  type={f.show ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 pr-12"
                />
                <button type="button" onClick={f.toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors duration-150" aria-label={f.show ? "Ẩn" : "Hiện"}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          ))}
          <div>
            <label htmlFor="confirm-new" className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
            <input id="confirm-new" type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
          </div>
          <button type="submit" className="px-6 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
            Cập nhật mật khẩu
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 mb-1">Xác thực 2 bước (2FA)</h2>
            <p className="text-sm text-slate-500 max-w-md">Tăng cường bảo mật bằng cách yêu cầu mã xác thực mỗi khi đăng nhập từ thiết bị mới.</p>
          </div>
          <button
            onClick={() => setTwoFA(!twoFA)}
            className={`inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${twoFA ? "bg-green-500" : "bg-slate-200"}`}
            role="switch"
            aria-checked={twoFA}
            aria-label="Bật/tắt xác thực 2 bước"
          >
            <span className={`inline-block w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        {twoFA && (
          <div className="mt-4 p-4 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-700 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Xác thực 2 bước đã được bật. Tài khoản của bạn được bảo vệ tốt hơn.
          </div>
        )}
      </div>

      {/* Active sessions */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-5">Phiên đăng nhập</h2>
        <div className="space-y-3">
          {[
            { device: "Chrome trên Windows", location: "TP. Hồ Chí Minh, VN", time: "Hiện tại", current: true },
            { device: "Safari trên iPhone 15", location: "TP. Hồ Chí Minh, VN", time: "2 giờ trước", current: false },
            { device: "Firefox trên macOS", location: "Hà Nội, VN", time: "3 ngày trước", current: false },
          ].map((s) => (
            <div key={s.device} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    {s.device}
                    {s.current && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Hiện tại</span>}
                  </div>
                  <div className="text-xs text-slate-400">{s.location} · {s.time}</div>
                </div>
              </div>
              {!s.current && (
                <button className="text-xs text-rose-500 hover:text-rose-700 font-medium cursor-pointer transition-colors duration-150">
                  Đăng xuất
                </button>
              )}
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm text-rose-500 hover:text-rose-700 font-medium cursor-pointer transition-colors duration-150">
          Đăng xuất tất cả thiết bị khác
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-3xl bg-white border border-rose-200 shadow-sm p-6">
        <h2 className="font-bold text-rose-600 mb-2">Vùng nguy hiểm</h2>
        <p className="text-sm text-slate-500 mb-4">Xóa tài khoản sẽ xóa toàn bộ dữ liệu và không thể khôi phục.</p>
        <button className="px-5 py-2.5 rounded-full text-sm font-semibold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors duration-200 cursor-pointer">
          Xóa tài khoản
        </button>
      </div>
    </div>
  )
}
