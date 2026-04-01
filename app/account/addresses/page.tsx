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
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
  }

  function remove(id: number) {
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Địa chỉ giao hàng</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Thêm địa chỉ
        </button>
      </div>

      {/* Address list */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-3xl border bg-white p-6 shadow-sm ${addr.isDefault ? "border-slate-900" : "border-slate-200"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">
                    {addr.name}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500">{addr.phone}</span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {addr.address}, {addr.district}, {addr.city}
                </p>
              </div>
              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <button className="cursor-pointer rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-200 hover:bg-slate-100">
                  Sửa
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => remove(addr.id)}
                    className="cursor-pointer rounded-full p-1.5 text-slate-400 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500"
                    aria-label="Xóa địa chỉ"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            {!addr.isDefault && (
              <button
                onClick={() => setDefault(addr.id)}
                className="mt-4 cursor-pointer text-xs font-medium text-blue-600 transition-colors duration-150 hover:text-blue-700"
              >
                Đặt làm địa chỉ mặc định
              </button>
            )}
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="text-sm text-slate-500">Chưa có địa chỉ nào</p>
          </div>
        )}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Thêm địa chỉ mới"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Thêm địa chỉ mới</h2>
              <button
                onClick={() => setShowForm(false)}
                className="cursor-pointer rounded-full p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100"
                aria-label="Đóng"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setShowForm(false)
              }}
            >
              <div>
                <label
                  htmlFor="addr-name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Họ và tên
                </label>
                <input
                  id="addr-name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="addr-phone"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Số điện thoại
                </label>
                <input
                  id="addr-phone"
                  type="tel"
                  placeholder="0901 234 567"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="addr-street"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Địa chỉ
                </label>
                <input
                  id="addr-street"
                  type="text"
                  placeholder="Số nhà, tên đường, phường/xã"
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="addr-district"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Quận/Huyện
                  </label>
                  <input
                    id="addr-district"
                    type="text"
                    placeholder="Quận 1"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="addr-city"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Tỉnh/Thành phố
                  </label>
                  <select
                    id="addr-city"
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  >
                    <option>TP. Hồ Chí Minh</option>
                    <option>Hà Nội</option>
                    <option>Đà Nẵng</option>
                    <option>Cần Thơ</option>
                  </select>
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-slate-900"
                />
                <span className="text-sm text-slate-600">
                  Đặt làm địa chỉ mặc định
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 cursor-pointer rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
                >
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
