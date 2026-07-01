import { apiFetch } from '@/lib/api/client';
import type {
  Order as ApiOrder,
  OrderListItem,
  OrderResponse,
  OrderListResponse,
} from '@/types/order';
import type { CreateOrderData, CancelOrderData, OrderStatus as ApiOrderStatus } from '@/schemas/order';
import type { ShippingAddress } from '@/types/order';

// Dashboard OrderStatus (uppercase) - used in admin panel
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';

// Dashboard Order type (for admin panel) - extends the base Order type
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

// POST /api/orders - Create order
export async function createOrder(data: CreateOrderData): Promise<ApiOrder> {
  const res = await apiFetch<OrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function quoteShippingFee(shippingAddress: ShippingAddress): Promise<number> {
  const res = await apiFetch<{ data: number }>('/api/orders/shipping-fee', {
    method: 'POST',
    body: JSON.stringify({ shippingAddress }),
  });
  return res.data;
}

// GET /api/orders - Get user orders
export async function getOrders(params?: {
  page?: number;
  limit?: number;
  status?: ApiOrderStatus;
}): Promise<OrderListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  return apiFetch<OrderListResponse>(`/api/orders${query ? `?${query}` : ''}`);
}

// GET /api/orders/{id} - Get order details
export async function getOrder(id: number): Promise<ApiOrder> {
  const res = await apiFetch<OrderResponse>(`/api/orders/${id}`);
  return res.data;
}

// PATCH /api/orders/{id}/cancel - Cancel order
export async function cancelOrder(id: number, data?: CancelOrderData) {
  const res = await apiFetch<OrderResponse>(`/api/orders/${id}/cancel`, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
  return res.data;
}
