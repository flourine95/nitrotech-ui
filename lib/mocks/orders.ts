import type { Order, OrderStatus } from '@/lib/api/orders';
import type { Page } from '@/lib/types/pagination';

const statuses: OrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];

const customers = [
  { name: 'Nguyễn Văn An', email: 'nguyenvanan@gmail.com' },
  { name: 'Trần Thị Bích', email: 'tranthibich@gmail.com' },
  { name: 'Lê Văn Cường', email: 'levanc@gmail.com' },
  { name: 'Phạm Thị Dung', email: 'phamthidung@gmail.com' },
  { name: 'Hoàng Văn Em', email: 'hoangvane@gmail.com' },
  { name: 'Vũ Thị Phương', email: 'vuthiphuong@gmail.com' },
  { name: 'Đặng Văn Giang', email: 'dangvangiang@gmail.com' },
  { name: 'Bùi Thị Hoa', email: 'buithihoa@gmail.com' },
  { name: 'Ngô Văn Hùng', email: 'ngovanhung@gmail.com' },
  { name: 'Đinh Thị Lan', email: 'dinhthilan@gmail.com' },
  { name: 'Trương Văn Minh', email: 'truongvanminh@gmail.com' },
  { name: 'Lý Thị Ngọc', email: 'lythingoc@gmail.com' },
  { name: 'Phan Văn Phúc', email: 'phanvanphuc@gmail.com' },
  { name: 'Cao Thị Quỳnh', email: 'caothiquynh@gmail.com' },
  { name: 'Dương Văn Sơn', email: 'duongvanson@gmail.com' },
  { name: 'Võ Thị Tâm', email: 'vothitam@gmail.com' },
  { name: 'Lưu Văn Thắng', email: 'luuvanthang@gmail.com' },
  { name: 'Mai Thị Uyên', email: 'maithiuyen@gmail.com' },
  { name: 'Hồ Văn Vinh', email: 'hovanvinh@gmail.com' },
  { name: 'Đỗ Thị Xuân', email: 'dothixuan@gmail.com' },
];

const amounts = [
  1290000, 2490000, 3290000, 4990000, 6580000, 7470000, 8990000,
  9800000, 12990000, 15500000, 18750000, 22500000, 25000000, 29900000,
  35990000, 38500000, 42990000, 45000000, 55000000, 68000000,
];

function randomFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function daysAgo(n: number): string {
  const d = new Date('2025-04-17T12:00:00Z');
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const mockOrders: Order[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  code: `#ORD-${2550 - i}`,
  customerName: randomFrom(customers, i * 3).name,
  customerEmail: randomFrom(customers, i * 3).email,
  totalAmount: randomFrom(amounts, i * 7),
  status: randomFrom(statuses, i * 11),
  itemCount: (i % 4) + 1,
  createdAt: daysAgo(Math.floor(i / 2)),
}));

export function mockOrdersPage(query?: {
  search?: string;
  status?: string;
  statuses?: string[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  page?: number;
  size?: number;
}): Page<Order> {
  const page = query?.page ?? 0;
  const size = query?.size ?? 10;

  let filtered = [...mockOrders];

  // Search: code, name, email
  if (query?.search) {
    const s = query.search.toLowerCase();
    filtered = filtered.filter(
      (o) =>
        o.code.toLowerCase().includes(s) ||
        o.customerName.toLowerCase().includes(s) ||
        o.customerEmail.toLowerCase().includes(s),
    );
  }

  // Status filter — support both single and multi
  const statusList = query?.statuses?.length
    ? query.statuses
    : query?.status
      ? [query.status]
      : [];
  if (statusList.length) {
    filtered = filtered.filter((o) => statusList.includes(o.status));
  }

  // Date range
  if (query?.dateFrom) {
    const from = new Date(query.dateFrom).getTime();
    filtered = filtered.filter((o) => new Date(o.createdAt).getTime() >= from);
  }
  if (query?.dateTo) {
    const to = new Date(query.dateTo).getTime();
    filtered = filtered.filter((o) => new Date(o.createdAt).getTime() <= to);
  }

  // Sort
  const sortBy = query?.sortBy ?? 'createdAt';
  const sortDir = query?.sortDir ?? 'desc';
  filtered.sort((a, b) => {
    let va: number | string = 0;
    let vb: number | string = 0;
    if (sortBy === 'totalAmount') { va = a.totalAmount; vb = b.totalAmount; }
    else if (sortBy === 'createdAt') { va = a.createdAt; vb = b.createdAt; }
    else if (sortBy === 'customerName') { va = a.customerName; vb = b.customerName; }
    else if (sortBy === 'code') { va = a.code; vb = b.code; }
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const content = filtered.slice(page * size, page * size + size);

  return {
    content,
    totalElements,
    totalPages,
    number: page,
    size,
    first: page === 0,
    last: page >= totalPages - 1,
    empty: content.length === 0,
  };
}
