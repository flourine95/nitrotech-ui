'use client';

import Image from 'next/image';
import { useState } from 'react';
import {
  CalendarIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  CheckIcon,
  CreditCardIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PlusIcon,
  RotateCcwIcon,
  SearchIcon,
  ShoppingCartIcon,
  TruckIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const statusFilters = [
  { label: 'Tất cả', count: 7, active: true },
  { label: 'Chờ xác nhận', count: 2 },
  { label: 'Đang xử lý', count: 2 },
  { label: 'Đang giao', count: 2 },
  { label: 'Hoàn tất', count: 1 },
];

const orders = [
  {
    id: 'SO-654',
    payment: 'Chưa trả',
    paymentTone: 'danger',
    title: 'Radiance Ritual Set / Ocean Blue / S x 1',
    meta: ['TP. Hồ Chí Minh', 'Nguyễn Minh Anh', 'Website', 'Huy Phạm'],
    amount: 5250000,
    date: '2026-03-28',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=240&auto=format&fit=crop',
    progress: 1,
    stateTitle: 'Báo giá mới',
    stateText: 'Báo giá mới đang chờ duyệt',
    action: 'Duyệt báo giá',
  },
  {
    id: 'SO-653',
    payment: 'Đã trả',
    paymentTone: 'success',
    extra: 'Hóa đơn',
    title: 'Timeless Renewal Cream / Army / L x 2',
    meta: ['Hà Nội', 'Trần Gia Hân', 'Website', 'Linh Đỗ'],
    amount: 17000000,
    date: '2026-03-27',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=240&auto=format&fit=crop',
    progress: 3,
    stateTitle: 'Đơn đang giao',
    stateText: 'Đã đóng gói và chờ đơn vị vận chuyển lấy hàng',
    action: 'Theo dõi giao hàng',
  },
  {
    id: 'SO-652',
    payment: 'Một phần',
    paymentTone: 'warning',
    extra: 'Hóa đơn',
    title: 'Cloud Silk Toner / Army / XL x 1',
    meta: ['Đà Nẵng', 'Lê Hoàng Nam', 'Đại lý', 'Huy Phạm'],
    amount: 12000000,
    date: '2026-03-24',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=240&auto=format&fit=crop',
    progress: 2,
    stateTitle: 'Đang đóng gói',
    stateText: 'Sản phẩm đang ở khu đóng gói và kiểm tra QA',
    action: 'Xem đóng gói',
  },
  {
    id: 'SO-651',
    payment: 'Đã trả',
    paymentTone: 'success',
    extra: 'Hóa đơn',
    title: 'Barrier Repair Drops / Core / M x 1',
    meta: ['Cần Thơ', 'Phạm Bảo Ngọc', 'Đối tác bán lẻ', 'Linh Đỗ'],
    amount: 8000000,
    date: '2026-03-21',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=240&auto=format&fit=crop',
    progress: 4,
    stateTitle: 'Đơn đã giao',
    stateText: 'Đã giao thành công và đánh dấu hoàn tất',
    action: 'Mở chứng từ',
  },
  {
    id: 'SO-650',
    payment: 'Đã trả',
    paymentTone: 'success',
    title: 'Micro Peel Serum / Night / Standard x 3',
    meta: ['Hà Nội', 'Vũ Quốc Bảo', 'Sàn TMĐT', 'Huy Phạm'],
    amount: 13500000,
    date: '2026-03-19',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=240&auto=format&fit=crop',
    progress: 2,
    stateTitle: 'Đang đóng gói',
    stateText: 'Đơn đã xác nhận và bắt đầu lấy hàng',
    action: 'Xem đóng gói',
  },
  {
    id: 'SO-649',
    payment: 'Một phần',
    paymentTone: 'warning',
    extra: 'Hóa đơn',
    title: 'HydraBloom Night Cream / Export / Bulk x 4',
    meta: ['Bình Dương', 'Đặng Thu Thảo', 'Đại lý', 'Linh Đỗ'],
    amount: 26000000,
    date: '2026-03-15',
    image: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=240&auto=format&fit=crop',
    progress: 3,
    stateTitle: 'Đơn đang giao',
    stateText: 'Đã đặt hãng vận chuyển, chứng từ đã đính kèm',
    action: 'Theo dõi giao hàng',
  },
  {
    id: 'SO-648',
    payment: 'Chưa trả',
    paymentTone: 'danger',
    title: 'Dew Reset Essence / Starter / XS x 1',
    meta: ['TP. Hồ Chí Minh', 'Mai Đức Anh', 'Website', 'Huy Phạm'],
    amount: 2400000,
    date: '2026-03-12',
    image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=240&auto=format&fit=crop',
    progress: 1,
    stateTitle: 'Báo giá mới',
    stateText: 'Đang chờ khách xác nhận',
    action: 'Duyệt báo giá',
  },
];

const progressSteps = [
  { label: 'Báo giá', icon: FileTextIcon },
  { label: 'Đóng gói', icon: PackageCheckIcon },
  { label: 'Giao hàng', icon: TruckIcon },
  { label: 'Hoàn tất', icon: CheckCircle2Icon },
];

const datePresets = ['Hôm nay', '7 ngày qua', '30 ngày qua', 'Tháng này'];
const paymentOptions = ['Tất cả phương thức', 'COD', 'VNPay', 'MoMo', 'Chuyển khoản'];
const shippingOptions = ['Tất cả đơn vị', 'GHN', 'GHTK', 'Viettel Post', 'Tự giao'];
const sortOptions = ['Gần đây nhất', 'Giá trị cao nhất', 'Giá trị thấp nhất', 'Cần xử lý trước'];
const pageSizeOptions = ['7', '10', '20', '50'];
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const viDate = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

function chipClass(tone?: string) {
  if (tone === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (tone === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (tone === 'danger') return 'border-rose-200 bg-rose-50 text-rose-700';
  return 'border-border bg-muted/50 text-foreground';
}

function StatusChip({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-md border px-2 text-xs font-medium',
        chipClass(tone),
      )}
    >
      {children}
    </span>
  );
}

function SidebarFilter() {
  const [datePreset, setDatePreset] = useState('30 ngày qua');
  const [amountRange, setAmountRange] = useState([5, 75]);

  return (
    <aside className="w-full shrink-0 lg:w-[300px]">
      <div className="sticky top-20 flex flex-col gap-6">
        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tìm đơn bán hàng..." className="h-11 pl-10" />
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Trạng thái đơn</p>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-background/70">
            {statusFilters.map((item) => (
              <button
                key={item.label}
                className={cn(
                  'flex min-h-11 w-full items-center justify-between border-b border-border/60 px-3.5 py-2.5 text-left text-foreground/80 transition-colors last:border-b-0 hover:bg-muted/20 hover:text-foreground',
                  item.active && 'bg-foreground/[0.045] text-foreground',
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      'size-2 rounded-full border',
                      item.active
                        ? 'border-foreground/70 bg-foreground/70'
                        : 'border-border/80 bg-background',
                    )}
                  />
                  <span className="text-[13px] font-medium">{item.label}</span>
                </span>
                <span
                  className={cn(
                    'text-[13px] font-medium',
                    item.active ? 'text-foreground' : 'text-foreground/65',
                  )}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <PaymentFilter />
        <DateFilter value={datePreset} onChange={setDatePreset} />
        <ShippingFilter />

        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">Giá trị</p>
          <div className="rounded-xl border border-border/60 bg-background/70 p-4">
            <Slider
              value={amountRange}
              min={0}
              max={100}
              step={5}
              onValueChange={setAmountRange}
              aria-label="Khoảng giá trị đơn hàng"
            />
            <div className="mt-3 flex items-center justify-between text-[13px] font-medium">
              <span>{amountRange[0]} triệu</span>
              <span>{amountRange[1]} triệu</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Lọc theo tổng tiền đơn hàng</p>
          </div>
        </div>

        <Separator />

        <div className="rounded-xl border p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Cần xử lý</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Ẩn đơn đã hoàn tất hoặc đã hủy</p>
            </div>
            <Switch />
          </div>
        </div>

        <Button
          variant="ghost"
          className="h-10 w-full justify-start gap-2 rounded-md px-3 text-muted-foreground shadow-none hover:bg-muted/40 hover:text-foreground"
        >
          <RotateCcwIcon />
          <span className="text-sm font-medium">Đặt lại bộ lọc</span>
        </Button>
      </div>
    </aside>
  );
}

function PaymentFilter() {
  return (
    <FilterPopover
      label="Phương thức thanh toán"
      icon={CreditCardIcon}
      defaultValue="Tất cả phương thức"
      options={paymentOptions}
    />
  );
}

function DateFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Ngày đặt</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 w-full justify-between font-normal">
            <span className="flex items-center gap-2">
              <CalendarIcon className="text-muted-foreground" />
              {value}
            </span>
            <ChevronDownIcon className="text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] gap-3 p-3"
        >
          <div className="grid grid-cols-2 gap-2">
            {datePresets.map((preset) => (
              <Button
                key={preset}
                variant={preset === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange(preset)}
              >
                {preset}
              </Button>
            ))}
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Từ ngày</span>
              <Input type="date" className="h-9" />
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Đến ngày</span>
              <Input type="date" className="h-9" />
            </div>
          </div>
          <Button className="w-full" size="sm" onClick={() => onChange('Tùy chỉnh')}>
            Áp dụng tùy chỉnh
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function ShippingFilter() {
  return (
    <FilterPopover
      label="Vận chuyển"
      icon={TruckIcon}
      defaultValue="Tất cả đơn vị"
      options={shippingOptions}
    />
  );
}

function FilterPopover({
  label,
  icon: Icon,
  defaultValue,
  options,
}: {
  label: string;
  icon: typeof CreditCardIcon;
  defaultValue: string;
  options: string[];
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{label}</p>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-10 w-full justify-between font-normal">
            <span className="flex min-w-0 items-center gap-2">
              <Icon className="shrink-0 text-muted-foreground" />
              <span className="truncate">{value}</span>
            </span>
            <ChevronDownIcon className="shrink-0 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={6}
          className="w-[var(--radix-popover-trigger-width)] gap-1 p-1.5"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-sm hover:bg-muted"
              onClick={() => setValue(option)}
            >
              <span>{option}</span>
              {option === value ? <CheckIcon className="text-foreground" /> : null}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function MoreActions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" className="mt-2">
          <MoreHorizontalIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={6} className="w-44 gap-1 p-1.5">
        {['Xem chi tiết', 'Cập nhật trạng thái', 'In đơn hàng'].map((action) => (
          <button
            key={action}
            type="button"
            className="flex h-8 w-full items-center rounded-md px-2 text-left text-sm hover:bg-muted"
          >
            {action}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function ToolbarActions() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full rounded-xl p-0 shadow-none sm:size-10 sm:shrink-0"
        >
          <MoreHorizontalIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={6} className="w-48 gap-1 p-1.5">
        {['Xuất danh sách', 'Ẩn bộ lọc', 'Tùy chỉnh hiển thị'].map((action) => (
          <button
            key={action}
            type="button"
            className="flex h-8 w-full items-center rounded-md px-2 text-left text-sm hover:bg-muted"
          >
            {action}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function SortDropdown() {
  const [value, setValue] = useState('Gần đây nhất');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-10 w-full min-w-0 justify-between rounded-xl px-4 font-normal shadow-none sm:w-56"
        >
          <span className="truncate">{value}</span>
          <ChevronDownIcon className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-[var(--radix-popover-trigger-width)] gap-1 p-1.5"
      >
        {sortOptions.map((option) => (
          <button
            key={option}
            type="button"
            className="flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-sm hover:bg-muted"
            onClick={() => setValue(option)}
          >
            <span>{option}</span>
            {option === value ? <CheckIcon className="text-foreground" /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function PageSizeDropdown() {
  const [value, setValue] = useState('7');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 min-w-24 justify-between rounded-lg px-2.5 font-normal shadow-none"
        >
          <span>{value} / trang</span>
          <ChevronDownIcon className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="top"
        sideOffset={6}
        className="w-32 gap-1 p-1.5"
      >
        {pageSizeOptions.map((option) => (
          <button
            key={option}
            type="button"
            className="flex h-8 w-full items-center justify-between rounded-md px-2 text-left text-sm whitespace-nowrap hover:bg-muted"
            onClick={() => setValue(option)}
          >
            <span>{option} / trang</span>
            {option === value ? <CheckIcon className="text-foreground" /> : null}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function OrderProgress({ progress }: { progress: number }) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {progressSteps.map((step, index) => {
        const active = index < progress;
        const CurrentIcon = step.icon;
        return (
          <div key={step.label} className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full',
                  active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground',
                )}
              >
                <CurrentIcon className="size-3.5" />
              </span>
              {index < progressSteps.length - 1 ? (
                <span
                  className={cn(
                    'h-1 min-w-0 flex-1 rounded-full',
                    index < progress - 1 ? 'bg-foreground' : 'bg-muted',
                  )}
                />
              ) : null}
            </div>
            <span className="text-center text-[11px] text-muted-foreground">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order }: { order: (typeof orders)[number] }) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{order.id}</span>
            <StatusChip tone={order.paymentTone}>{order.payment}</StatusChip>
            {order.extra ? <StatusChip>{order.extra}</StatusChip> : null}
          </div>
          <h2 className="mt-2 text-lg font-semibold leading-snug">{order.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            {order.meta.map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                {index > 0 ? <span className="size-1 rounded-full bg-border" /> : null}
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between gap-4 xl:min-w-44 xl:justify-end">
          <Image
            src={order.image}
            alt={order.title}
            width={48}
            height={48}
            className="size-12 rounded-full object-cover"
          />
          <div className="text-right">
            <p className="text-xl font-semibold">{vnd.format(order.amount)}</p>
            <p className="text-sm text-muted-foreground">
              {viDate.format(new Date(order.date))}
            </p>
            <MoreActions />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border p-4">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="min-w-0">
            <p className="font-medium">{order.stateTitle}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{order.stateText}</p>
            <div className="mt-4">
              <OrderProgress progress={order.progress} />
            </div>
          </div>
          <Button variant="outline" className="w-fit justify-self-start xl:justify-self-end">
            {order.action}
          </Button>
        </div>
      </div>
    </article>
  );
}

export function OrderList3Clone() {
  return (
    <div className="mx-auto flex h-[calc(100vh-3rem)] w-full max-w-[1800px] flex-col gap-6 overflow-hidden">
      <section className="flex flex-col gap-4 border-b border-dashed border-border/70 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl border bg-card">
            <ShoppingCartIcon />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Quản lý đơn hàng</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Theo dõi thanh toán, xử lý kho và tiến trình giao hàng trong một màn hình.
            </p>
          </div>
        </div>
        <Button className="h-10 w-fit rounded-xl px-4">
          <PlusIcon data-icon="inline-start" />
          Tạo đơn hàng
        </Button>
      </section>

      <div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarFilter />

        <main className="flex min-h-0 min-w-0 flex-col">
          <section className="shrink-0 border-b border-dashed border-border/70 bg-background pb-4 pt-1">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusChip>7 đơn</StatusChip>
                <StatusChip>{vnd.format(84150000)} tổng</StatusChip>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Danh sách đang lọc theo trạng thái xử lý, thời gian đặt và giá trị đơn hàng.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <SortDropdown />
              <ToolbarActions />
            </div>
            </div>
          </section>

          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-0 lg:pr-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          <div className="mt-4 shrink-0 border-t border-dashed border-border/70 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm text-muted-foreground">Hiển thị 1-7 trong 48 đơn hàng</p>
              <PageSizeDropdown />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                3
              </Button>
              <Button variant="outline" size="sm">
                Sau
              </Button>
            </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
