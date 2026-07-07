'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDashboardAnalytics } from '../dashboard-analytics';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils/formatting';

export default function DashboardRevenuePage() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: getDashboardAnalytics,
    staleTime: 60_000,
  });

  if (isError) {
    return (
      <div className="w-full space-y-6">
        <Header subtitle="Không thể tải dữ liệu doanh thu" />
        <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          Không thể tải dữ liệu doanh thu.
        </div>
      </div>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="w-full space-y-6">
        <Header subtitle="Đang tải dữ liệu doanh thu" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Header subtitle={`Dữ liệu thật từ ${data.fetchedOrders} đơn hàng gần nhất`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Tổng doanh thu" value={formatCurrency(data.totalRevenue)} />
        <KpiCard label="Doanh thu tháng này" value={formatCurrency(data.currentMonthRevenue)} />
        <KpiCard label="Giá trị đơn trung bình" value={formatCurrency(data.averageOrderValue)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Doanh thu 6 tháng</CardTitle>
          <CardDescription>Theo đơn đã xác nhận trở lên</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data.monthly}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Number(v) / 1000000}M`} />
              <Tooltip content={<ChartTooltip label="Doanh thu" formatter={formatCurrency} />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tỷ trọng theo trạng thái</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={data.statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {data.statusBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={<ChartTooltip label="Số đơn" />}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.statusBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-sm text-muted-foreground">{item.name}</span>
                  <span className="text-sm font-semibold text-foreground">{item.percent}%</span>
                </div>
              ))}
            </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Doanh thu theo phương thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.paymentBreakdown} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${Number(v) / 1000000}M`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={64}
              />
              <Tooltip
                content={<ChartTooltip label="Doanh thu" formatter={formatCurrency} />}
              />
              <Bar dataKey="revenue" fill="#2563eb" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Header({ subtitle }: { subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Doanh thu</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardContent>
        <div className="mb-1 text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground/80">
          Tính từ đơn đã xác nhận trở lên
        </div>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label: string;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const value = Number(payload[0].value ?? 0);

  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-sm">
      <div className="font-medium text-foreground">{formatter ? formatter(value) : value}</div>
      <div className="text-muted-foreground">{label}</div>
    </div>
  );
}
