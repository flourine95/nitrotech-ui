"use client"
import { useState } from "react"

const initialAddresses = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    phone: "0901 234 567",
    address: "123 Nguyễn Huệ, Phường Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: true,
  },
  {
    id: 2,
    name: "Nguyễn Văn A",
    phone: "0901 234 567",
    address: "456 Lê Lợi, Phường Phạm Ngũ Lão",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    isDefault: false,
  },
]

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(initialAddresses)
  const [showForm, setShowForm] = useState(false)

  function setDefault(id: number) {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
  }

  function remove(id: number) {
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Địa chỉ giao hàng</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
          Thêm địa chỉ
        </button>
      </div>

      {/* Address list */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div key={addr.id} className={`rounded-3xl bg-white border shadow-sm p-6 ${addr.isDefault ? "border-slate-900" : "border-slate-200"}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{addr.name}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500">{addr.phone}</span>
                  {addr.isDefault && (
                    <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {addr.address}, {addr.district}, {addr.city}
                </p>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                  Sửa
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => remove(addr.id)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200 cursor-pointer"
                    aria-label="Xóa địa chỉ"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                )}
              </div>
            </div>
            {!addr.isDefault && (
              <button
                onClick={() => setDefault(addr.id)}
                className="mt-4 text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer transition-colors duration-150"
              >
                Đặt làm địa chỉ mặc định
              </button>
            )}
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <p className="text-slate-500 text-sm">Chưa có địa chỉ nào</p>
          </div>
        )}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Thêm địa chỉ mới">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-slate-900">Thêm địa chỉ mới</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors duration-200 cursor-pointer" aria-label="Đóng">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowForm(false) }}>
              <div>
                <label htmlFor="addr-name" className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
                <input id="addr-name" type="text" placeholder="Nguyễn Văn A" required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
              </div>
              <div>
                <label htmlFor="addr-phone" className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <input id="addr-phone" type="tel" placeholder="0901 234 567" required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
              </div>
              <div>
                <label htmlFor="addr-street" className="block text-sm font-medium text-slate-700 mb-1.5">Địa chỉ</label>
                <input id="addr-street" type="text" placeholder="Số nhà, tên đường, phường/xã" required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="addr-district" className="block text-sm font-medium text-slate-700 mb-1.5">Quận/Huyện</label>
                  <input id="addr-district" type="text" placeholder="Quận 1" required className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
                </div>
                <div>
                  <label htmlFor="addr-city" className="block text-sm font-medium text-slate-700 mb-1.5">Tỉnh/Thành phố</label>
                  <select id="addr-city" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white cursor-pointer">
                    <option>TP. Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                    <option>Cần Thơ</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded accent-slate-900"/>
                <span className="text-sm text-slate-600">Đặt làm địa chỉ mặc định</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                  Hủy
                </button>
                <button type="submit" className="flex-1 py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
                  Lưu địa chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
