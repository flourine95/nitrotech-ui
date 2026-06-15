import { apiFetch } from '@/lib/api/client';

export type AdminOrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface AdminOrderItem {
  id: number;
  variantId: number;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface AdminShippingAddress {
  receiver: string;
  phone: string;
  province: string;
  provinceCode: string;
  district: string;
  districtCode: string;
  ward: string;
  wardCode: string;
  street: string;
}

export interface AdminOrder {
  id: number;
  userId: number;
  shippingAddress: AdminShippingAddress;
  status: AdminOrderStatus;
  paymentMethod: string;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  promotionCode: string | null;
  note: string | null;
  items: AdminOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentData {
  id: number;
  orderId: number;
  provider: string;
  trackingCode: string | null;
  status: string;
  fee: number;
  estimatedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentLogData {
  id: number;
  shipmentId: number;
  status: string;
  rawStatus: string | null;
  source: 'ADMIN_CREATE' | 'WEBHOOK' | 'SYSTEM' | string;
  location: string | null;
  note: string | null;
  createdAt: string;
}

export interface OrderShipmentData {
  shipment: ShipmentData | null;
  logs: ShipmentLogData[];
}

interface ApiResult<T> {
  data: T;
}

export async function getAdminOrder(id: number): Promise<AdminOrder> {
  const res = await apiFetch<ApiResult<AdminOrder>>(`/api/admin/orders/${id}`);
  return res.data;
}

export async function getAdminOrderShipment(orderId: number): Promise<OrderShipmentData> {
  const res = await apiFetch<ApiResult<OrderShipmentData>>(`/api/admin/orders/${orderId}/shipment`);
  return res.data;
}

export async function createAdminOrderShipment(orderId: number, provider: string): Promise<ShipmentData> {
  const params = new URLSearchParams({ provider });
  const res = await apiFetch<ApiResult<ShipmentData>>(`/api/admin/orders/${orderId}/shipment?${params}`, {
    method: 'POST',
  });
  return res.data;
}
