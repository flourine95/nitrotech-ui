"use client"
import { useState } from "react"

const orders = [
  {
    id: "#ORD-2401",
    customer: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    product: "MacBook Pro M4",
    amount: 42990000,
    status: "Đang giao",
    date: "01/04/2024",
    items: 1,
  },
  {
    id: "#ORD-2400",
    customer: "Trần Thị B",
    email: "tranthib@email.com",
    product: "RTX 4080 Super",
    amount: 22500000,
    status: "Đã xác nhận",
    date: "01/04/2024",
    items: 1,
  },
  {
    id: "#ORD-2399",
    customer: "Lê Văn C",
    email: "levanc@email.com",
    product: "Samsung 990 Pro 2TB",
    amount: 3290000,
    status: "Hoàn thành",
    date: "31/03/2024",
    items: 2,
  },
  {
    id: "#ORD-2398",
    customer: "Phạm Thị D",
    email: "phamthid@email.com",
    product: 'LG UltraGear 27"',
    amount: 12990000,
    status: "Đang giao",
    date: "31/03/2024",
    items: 1,
  },
  {
    id: "#ORD-2397",
    customer: "Hoàng Văn E",
    email: "hoangvane@email.com",
    product: "Intel Core i9-14900K",
    amount: 8990000,
    status: "Đã hủy",
    date: "30/03/2024",
    items: 1,
  },
  {
    id: "#ORD-2396",
    customer: "Vũ Thị F",
    email: "vuthif@email.com",
    product: "Corsair 32GB DDR5",
    amount: 2490000,
    status: "Hoàn thành",
    date: "30/03/2024",
    items: 3,
  },
  {
    id: "#ORD-2395",
    customer: "Đặng Văn G",
    email: "dangvang@email.com",
    product: "ASUS ROG Strix G16",
    amount: 35990000,
    status: "Chờ xác nhận",
    date: "29/03/2024",
    items: 1,
  },
  {
    id: "#ORD-2394",
    customer: "Bùi Thị H",
    email: "buithih@email.com",
    product: "Dell XPS 15 OLED",
    amount: 38500000,
    status: "Hoàn thành",
    date: "29/03/2024",
    items: 1,
  },
]

const statusConfig: Record<string, { color: string; dot: string }> = {
  "Đang giao": { color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  "Đã xác nhận": { color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  "Hoàn thành": { color: "bg-green-100 text-green-700", dot: "bg-green-500" },
  "Đã hủy": { color: "bg-rose-100 text-rose-700", dot: "bg-rose-500" },
  "Chờ xác nhận": { color: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
}

const statuses = [
  "Tất cả",
  "Chờ xác nhận",
  "Đã xác nhận",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
]

export default function DashboardOrdersPage() {
  const [status, setStatus] = useState("Tất cả")
  const [search, setSearch] = useState("")

  const filtered = orders.filter((o) => {
    const matchStatus = status === "Tất cả" || o.status === status
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Đơn hàng</h1>
        <p className="mt-1 text-sm text-slate-500">
          {orders.length} đơn hàng tổng cộng
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          {
            label: "Chờ xác nhận",
            count: orders.filter((o) => o.status === "Chờ xác nhận").length,
            color: "text-slate-600 bg-slate-100",
          },
          {
            label: "Đang giao",
            count: orders.filter((o) => o.status === "Đang giao").length,
            color: "text-blue-700 bg-blue-100",
          },
          {
            label: "Hoàn thành",
            count: orders.filter((o) => o.status === "Hoàn thành").length,
            color: "text-green-700 bg-green-100",
          },
          {
            label: "Đã hủy",
            count: orders.filter((o) => o.status === "Đã hủy").length,
            color: "text-rose-700 bg-rose-100",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${s.color}`}
            >
              {s.count}
            </div>
            <div className="text-sm text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 24 24"
            className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Tìm mã đơn, tên khách hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border-0 bg-slate-100 py-2 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500"
            aria-label="Tìm kiếm đơn hàng"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`cursor-pointer rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                status === s
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Mã đơn
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Khách hàng
                </th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Sản phẩm
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Tổng tiền
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Ngày đặt
                </th>
                <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o) => {
                const cfg = statusConfig[o.status] ?? {
                  color: "bg-slate-100 text-slate-600",
                  dot: "bg-slate-400",
                }
                return (
                  <tr
                    key={o.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                      {o.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {o.customer}
                      </div>
                      <div className="text-xs text-slate-400">{o.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-700">{o.product}</div>
                      <div className="text-xs text-slate-400">
                        {o.items} sản phẩm
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-900">
                      {o.amount.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-5 py-4 text-center text-slate-500">
                      {o.date}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.color}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`}
                          aria-hidden="true"
                        />
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        aria-label={`Xem đơn ${o.id}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              Không tìm thấy đơn hàng nào
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
