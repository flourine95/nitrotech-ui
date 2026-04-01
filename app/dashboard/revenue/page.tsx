"use client"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const monthlyData = [
  { month: "T1", revenue: 45000000, cost: 28000000, profit: 17000000 },
  { month: "T2", revenue: 52000000, cost: 31000000, profit: 21000000 },
  { month: "T3", revenue: 48000000, cost: 29000000, profit: 19000000 },
  { month: "T4", revenue: 61000000, cost: 36000000, profit: 25000000 },
  { month: "T5", revenue: 55000000, cost: 33000000, profit: 22000000 },
  { month: "T6", revenue: 67000000, cost: 39000000, profit: 28000000 },
]

const categoryData = [
  { name: "Laptop", value: 45, color: "#2563eb" },
  { name: "Card đồ họa", value: 20, color: "#f59e0b" },
  { name: "CPU", value: 15, color: "#10b981" },
  { name: "SSD/RAM", value: 12, color: "#8b5cf6" },
  { name: "Màn hình", value: 8, color: "#f43f5e" },
]

const topBrands = [
  { brand: "Apple", revenue: 193000000 },
  { brand: "ASUS", revenue: 115000000 },
  { brand: "NVIDIA", revenue: 85000000 },
  { brand: "Dell", revenue: 77000000 },
  { brand: "Intel", revenue: 60000000 },
  { brand: "Samsung", revenue: 51000000 },
]

export default function DashboardRevenuePage() {
  const totalRevenue = monthlyData.reduce((s, d) => s + d.revenue, 0)
  const totalProfit = monthlyData.reduce((s, d) => s + d.profit, 0)
  const margin = ((totalProfit / totalRevenue) * 100).toFixed(1)

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Doanh thu</h1>
        <p className="mt-1 text-sm text-slate-500">
          Phân tích tài chính 6 tháng gần nhất
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-1 text-sm text-slate-500">Tổng doanh thu</div>
          <div className="text-2xl font-bold text-slate-900">
            {(totalRevenue / 1000000).toFixed(0)}M₫
          </div>
          <div className="mt-1 text-xs font-semibold text-green-600">
            +12.5% so với kỳ trước
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-1 text-sm text-slate-500">Lợi nhuận gộp</div>
          <div className="text-2xl font-bold text-slate-900">
            {(totalProfit / 1000000).toFixed(0)}M₫
          </div>
          <div className="mt-1 text-xs font-semibold text-green-600">
            +9.8% so với kỳ trước
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-1 text-sm text-slate-500">Biên lợi nhuận</div>
          <div className="text-2xl font-bold text-slate-900">{margin}%</div>
          <div className="mt-1 text-xs text-slate-400">Trung bình 6 tháng</div>
        </div>
      </div>

      {/* Area chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-6 text-base font-bold text-slate-900">
          Doanh thu & Lợi nhuận
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748b" }}
              tickFormatter={(v) => `${v / 1000000}M`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(value: number, name: string) => [
                `${(value / 1000000).toFixed(1)}M₫`,
                name === "revenue" ? "Doanh thu" : "Lợi nhuận",
              ]}
            />
            <Legend
              formatter={(v) => (v === "revenue" ? "Doanh thu" : "Lợi nhuận")}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#colorProfit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Pie + Bar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-6 text-base font-bold text-slate-900">
            Doanh thu theo danh mục
          </h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Tỷ trọng"]}
                  contentStyle={{ borderRadius: "12px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-sm text-slate-600">
                    {c.name}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    {c.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-6 text-base font-bold text-slate-900">
            Top thương hiệu
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topBrands} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(v) => `${v / 1000000}M`}
              />
              <YAxis
                type="category"
                dataKey="brand"
                tick={{ fontSize: 12, fill: "#64748b" }}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(v: number) => [
                  `${(v / 1000000).toFixed(0)}M₫`,
                  "Doanh thu",
                ]}
              />
              <Bar dataKey="revenue" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
