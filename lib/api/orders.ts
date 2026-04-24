import { apiFetch } from '@/lib/client';
import type { Page } from '@/lib/types/pagination';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: number;
  productName: string;
  variantName: string | null;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  code: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
  createdAt: string;
}

export interface OrdersQuery {
  search?: string;
  status?: OrderStatus;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getOrders(query?: OrdersQuery): Promise<Page<Order>> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.status) q.set('status', query.status);
  if (query?.page !== undefined) q.set('page', String(query.page));
  if (query?.size !== undefined) q.set('size', String(query.size));
  if (query?.sort) q.set('sort', query.sort);
  const qs = q.toString();
  return apiFetch<Page<Order>>(`/api/orders${qs ? `?${qs}` : ''}`);
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
