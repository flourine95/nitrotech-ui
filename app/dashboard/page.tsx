'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock3, DollarSign, PackageCheck, ShoppingBag } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  getDashboardAnalytics,
  type DashboardAnalytics,
} from './dashboard-analytics';
import { StatusChip } from '@/components/dashboard/status-chip';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/formatting';
import { orderStatusConfig } from './orders/order-display';

export default function DashboardPage() {
  const { data, isError, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: getDashboardAnalytics,
    staleTime: 60_000,
  });

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tổng quan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? `Dữ liệu thật từ ${data.fetchedOrders} đơn hàng gần nhất` : 'Đang tải dữ liệu'}
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-destructive/25 bg-destructive/10 p-4 text-sm font-medium text-destructive">
          Không thể tải dữ liệu tổng quan.
        </div>
      ) : isLoading || !data ? (
        <DashboardLoading />
      ) : (
        <DashboardContent data={data} />
      )}
    </div>
  );
}

function DashboardContent({ data }: { data: DashboardAnalytics }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          tone="blue"
          icon={<DollarSign className="size-5" aria-hidden="true" />}
          label="Doanh thu tháng này"
          value={formatCurrency(data.currentMonthRevenue)}
          hint="Đơn đã xác nhận trở lên"
        />
        <StatCard
          tone="amber"
          icon={<ShoppingBag className="size-5" aria-hidden="true" />}
          label="Đơn hàng tháng này"
          value={data.currentMonthOrders.toLocaleString('vi-VN')}
          hint={`${data.totalOrders.toLocaleString('vi-VN')} đơn tổng cộng`}
        />
        <StatCard
          tone="green"
          icon={<PackageCheck className="size-5" aria-hidden="true" />}
          label="Đã giao"
          value={data.deliveredOrders.toLocaleString('vi-VN')}
          hint="Đơn hoàn tất giao hàng"
        />
        <StatCard
          tone="rose"
          icon={<Clock3 className="size-5" aria-hidden="true" />}
          label="Chờ xử lý"
          value={data.pendingOrders.toLocaleString('vi-VN')}
          hint="Cần admin kiểm tra"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Doanh thu 6 tháng" description="Theo đơn đã xác nhận trở lên">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Number(v) / 1000000}M`} />
              <Tooltip content={<ChartTooltip label="Doanh thu" formatter={formatCurrency} />} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Đơn hàng 6 tháng" description="Theo tháng tạo đơn">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<ChartTooltip label="Đơn hàng" />} />
              <Bar dataKey="orders" fill="#f59e0b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trạng thái đơn hàng</CardTitle>
            <CardAction>
              <Link href="/dashboard/orders" className="text-sm font-medium text-primary">
              Xem đơn
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.statusBreakdown.map((item) => (
              <div key={item.name} className="rounded-lg p-2.5 transition-colors hover:bg-muted/40">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{item.value} đơn</span>
                </div>
                <div className="mt-2 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardAction>
              <Link href="/dashboard/orders" className="text-sm font-medium text-primary">
              Xem tất cả
              </Link>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {order.orderCode}
                    </span>
                    <StatusChip tone={orderStatusConfig[order.status].tone}>
                      {orderStatusConfig[order.status].label}
                    </StatusChip>
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {order.receiver ?? order.email ?? 'Khách hàng'} • {order.itemCount} sản phẩm
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground/80">
                    {formatRelativeTime(order.createdAt)}
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm font-semibold text-foreground">
                  {formatCurrency(order.finalAmount)}
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  tone: 'blue' | 'amber' | 'green' | 'rose';
  icon: ReactNode;
}) {
  const toneClass = {
    blue: 'bg-primary/10 text-primary',
    amber: 'bg-amber-100 text-amber-600',
    green: 'bg-green-100 text-green-600',
    rose: 'bg-rose-100 text-rose-600',
  }[tone];

  return (
    <Card size="sm">
      <CardContent>
        <div className="mb-3 flex items-center justify-between">
          <div className={`flex size-9 items-center justify-center rounded-lg ${toneClass}`}>
            {icon}
          </div>
        </div>
        <div className="text-2xl font-semibold tracking-tight text-foreground">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        <div className="mt-2 text-xs text-muted-foreground/80">{hint}</div>
      </CardContent>
    </Card>
  );
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DashboardLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-32 rounded-xl" />
      ))}
    </div>
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
