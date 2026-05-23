import { apiFetch } from '@/lib/client';
import type {
  Order,
  OrderListItem,
  OrderResponse,
  OrderListResponse,
} from '@/types/order';
import type { CreateOrderData, CancelOrderData, OrderStatus } from '@/schemas/order';

// POST /api/orders - Create order
export async function createOrder(data: CreateOrderData): Promise<Order> {
  const res = await apiFetch<OrderResponse>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// GET /api/orders - Get user orders
export async function getOrders(params?: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}): Promise<OrderListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);

  const query = searchParams.toString();
  return apiFetch<OrderListResponse>(`/api/orders${query ? `?${query}` : ''}`);
}

// GET /api/orders/{id} - Get order details
export async function getOrder(id: number): Promise<Order> {
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
