"use client"
import Link from "next/link"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getAllProducts } from "@/lib/products"

const revenueData = [
  { month: "T1", revenue: 45000000, orders: 120 },
  { month: "T2", revenue: 52000000, orders: 145 },
  { month: "T3", revenue: 48000000, orders: 132 },
  { month: "T4", revenue: 61000000, orders: 168 },
  { month: "T5", revenue: 55000000, orders: 151 },
  { month: "T6", revenue: 67000000, orders: 189 },
]

const topProducts = [
  { name: "MacBook Pro M4", sold: 45, revenue: 1934550000 },
  { name: "RTX 4080 Super", sold: 38, revenue: 855000000 },
  { name: "ASUS ROG Strix G16", sold: 32, revenue: 1151680000 },
  { name: "Samsung 990 Pro 2TB", sold: 156, revenue: 513240000 },
  { name: "Intel Core i9-14900K", sold: 67, revenue: 602330000 },
]

const recentOrders = [
  { id: "#ORD-2401", customer: "Nguyễn Văn A", product: "MacBook Pro M4", amount: "42.990.000₫", status: "Đang giao", time: "5 phút trước" },
  { id: "#ORD-2400", customer: "Trần Thị B", product: "RTX 4080 Super", amount: "22.500.000₫", status: "Đã xác nhận", time: "12 phút trước" },
  { id: "#ORD-2399", customer: "Lê Văn C", product: "Samsung 990 Pro 2TB", amount: "3.290.000₫", status: "Hoàn thành", time: "28 phút trước" },
  { id: "#ORD-2398", customer: "Phạm Thị D", product: "LG UltraGear 27\"", amount: "12.990.000₫", status: "Đang giao", time: "1 giờ trước" },
]

const statusColors: Record<string, string> = {
  "Đang giao": "bg-blue-100 text-blue-700",
  "Đã xác nhận": "bg-amber-100 text-amber-700",
  "Hoàn thành": "bg-green-100 text-green-700",
}

export default function DashboardPage() {
  const products = getAllProducts()
  const totalProducts = products.length
  const inStock = products.filter((p) => p.inStock).length
  const lowStock = products.filter((p) => p.stockCount < 10).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Tổng quan</h1>
        <p className="text-sm text-slate-500 mt-1">Chào mừng trở lại, Admin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.5%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">328M₫</div>
          <div className="text-sm text-slate-500 mt-1">Doanh thu tháng này</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+8.2%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">905</div>
          <div className="text-sm text-slate-500 mt-1">Đơn hàng tháng này</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+15.3%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">1,247</div>
          <div className="text-sm text-slate-500 mt-1">Khách hàng mới</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
            <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">{lowStock} thấp</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">{totalProducts}</div>
          <div className="text-sm text-slate-500 mt-1">Sản phẩm ({inStock} còn hàng)</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Doanh thu 6 tháng</h2>
              <p className="text-sm text-slate-500 mt-0.5">Theo tháng</p>
            </div>
            <select className="px-3 py-1.5 text-sm bg-slate-100 rounded-lg border-0 outline-none text-slate-700 cursor-pointer">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `${v / 1000000}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                formatter={(value: number) => [`${(value / 1000000).toFixed(1)}M₫`, "Doanh thu"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Đơn hàng 6 tháng</h2>
              <p className="text-sm text-slate-500 mt-0.5">Theo tháng</p>
            </div>
            <select className="px-3 py-1.5 text-sm bg-slate-100 rounded-lg border-0 outline-none text-slate-700 cursor-pointer">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }}
                formatter={(value: number) => [value, "Đơn hàng"]}
              />
              <Bar dataKey="orders" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Sản phẩm bán chạy</h2>
            <Link href="/dashboard/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.sold} đã bán</div>
                </div>
                <div className="text-sm font-bold text-slate-900 text-right">{(p.revenue / 1000000).toFixed(0)}M₫</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-900">Đơn hàng gần đây</h2>
            <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-900">{o.id}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 truncate">{o.customer} • {o.product}</div>
                  <div className="text-xs text-slate-400 mt-1">{o.time}</div>
                </div>
                <div className="text-sm font-bold text-slate-900 text-right flex-shrink-0">{o.amount}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
