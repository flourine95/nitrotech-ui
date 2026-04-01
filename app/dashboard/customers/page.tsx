"use client"
import { useState } from "react"

const customers = [
  { id: "KH001", name: "Nguyễn Văn A", email: "nguyenvana@email.com", phone: "0901234567", orders: 8, spent: 125000000, joined: "15/01/2024", tier: "VIP" },
  { id: "KH002", name: "Trần Thị B", email: "tranthib@email.com", phone: "0912345678", orders: 5, spent: 67500000, joined: "20/01/2024", tier: "Thân thiết" },
  { id: "KH003", name: "Lê Văn C", email: "levanc@email.com", phone: "0923456789", orders: 12, spent: 210000000, joined: "05/12/2023", tier: "VIP" },
  { id: "KH004", name: "Phạm Thị D", email: "phamthid@email.com", phone: "0934567890", orders: 2, spent: 15000000, joined: "10/03/2024", tier: "Mới" },
  { id: "KH005", name: "Hoàng Văn E", email: "hoangvane@email.com", phone: "0945678901", orders: 3, spent: 28000000, joined: "22/02/2024", tier: "Thân thiết" },
  { id: "KH006", name: "Vũ Thị F", email: "vuthif@email.com", phone: "0956789012", orders: 7, spent: 95000000, joined: "08/11/2023", tier: "VIP" },
]

const tierConfig: Record<string, string> = {
  "VIP": "bg-amber-100 text-amber-700",
  "Thân thiết": "bg-blue-100 text-blue-700",
  "Mới": "bg-green-100 text-green-700",
}

export default function DashboardCustomersPage() {
  const [search, setSearch] = useState("")

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khách hàng</h1>
          <p className="text-sm text-slate-500 mt-1">{customers.length} khách hàng đã đăng ký</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Xuất CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "VIP", count: customers.filter(c => c.tier === "VIP").length, color: "bg-amber-100 text-amber-700" },
          { label: "Thân thiết", count: customers.filter(c => c.tier === "Thân thiết").length, color: "bg-blue-100 text-blue-700" },
          { label: "Mới", count: customers.filter(c => c.tier === "Mới").length, color: "bg-green-100 text-green-700" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${s.color}`}>{s.count}</div>
            <div className="text-sm text-slate-600">Khách hàng {s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="relative max-w-sm">
          <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Tìm theo tên, email, mã KH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 rounded-xl border-0 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 placeholder:text-slate-400"
            aria-label="Tìm kiếm khách hàng"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Khách hàng</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Liên hệ</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Đơn hàng</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tổng chi tiêu</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ngày tham gia</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Hạng</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 flex-shrink-0">
                        {c.name.split(" ").pop()?.[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs text-slate-400">{c.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-slate-700">{c.email}</div>
                    <div className="text-xs text-slate-400">{c.phone}</div>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-slate-900">{c.orders}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-900">{(c.spent / 1000000).toFixed(0)}M₫</td>
                  <td className="px-5 py-4 text-center text-slate-500">{c.joined}</td>
                  <td className="px-5 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${tierConfig[c.tier]}`}>{c.tier}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer" aria-label={`Xem ${c.name}`}>
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
