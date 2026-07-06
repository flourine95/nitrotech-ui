import { apiFetch, type ApiResult, type PageMeta } from '@/lib/api/client';

export type AdminOrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'expired';

export type AdminPaymentMethod = 'cod' | 'vnpay' | 'momo' | 'sepay';
export type AdminOrderAction =
  | 'view_detail'
  | 'confirm'
  | 'cancel'
  | 'create_shipment'
  | 'mark_processing'
  | 'mark_shipped'
  | 'mark_delivered'
  | 'refund';

export interface OrderOption<T extends string = string> {
  value: T;
  label: string;
}

export interface OrderFacetItem<T extends string = string> extends OrderOption<T> {
  count: number;
}

export interface AdminOrderFacets {
  total: number;
  statuses: Array<OrderFacetItem<AdminOrderStatus>>;
  paymentMethods: Array<OrderFacetItem<AdminPaymentMethod>>;
}

export interface AdminOrderListItem {
  id: number;
  userId: number;
  orderCode: string;
  receiver: string | null;
  phone: string | null;
  email: string | null;
  status: AdminOrderStatus;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: string | null;
  hasShipment: boolean;
  shipmentStatus: string | null;
  trackingCode: string | null;
  availableActions: AdminOrderAction[];
  ageMinutes: number;
  slaDueAt: string | null;
  slaStatus: 'normal' | 'warning' | 'critical';
  slaLabel: string | null;
  finalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserSummary {
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export interface AdminPaymentSummary {
  provider: string;
  status: string; // 'pending' | 'paid' | 'failed'
  amount: number;
  paidAt: string | null;
}

export interface AdminOrderItem {
  id: number;
  variantId: number;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  imageUrl: string | null;
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
  orderCode: string;
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
  user: AdminUserSummary | null;
  payment: AdminPaymentSummary | null;
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
  lastOfficialEventAt: string | null;
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
  occurredAt: string | null;
  reasonCode: string | null;
  createdAt: string;
}

export interface OrderShipmentData {
  shipment: ShipmentData | null;
  logs: ShipmentLogData[];
}



export interface AdminOrdersParams {
  search?: string;
  status?: AdminOrderStatus;
  paymentMethod?: AdminPaymentMethod;
  createdFrom?: string;
  createdTo?: string;
  amountMin?: number;
  amountMax?: number;
  page?: number;
  size?: number;
  sort?: Array<{ field: string; dir: 'asc' | 'desc' }>;
}

export interface AdminOrdersPage {
  data: AdminOrderListItem[];
  meta: PageMeta;
}

export async function getAdminOrders(params: AdminOrdersParams): Promise<AdminOrdersPage> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.paymentMethod) searchParams.set('paymentMethod', params.paymentMethod);
  if (params.createdFrom) searchParams.set('createdFrom', params.createdFrom);
  if (params.createdTo) searchParams.set('createdTo', params.createdTo);
  if (params.amountMin !== undefined) searchParams.set('amountMin', String(params.amountMin));
  if (params.amountMax !== undefined) searchParams.set('amountMax', String(params.amountMax));
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.size !== undefined) searchParams.set('size', String(params.size));
  params.sort?.forEach((sort) => searchParams.append('sort', `${sort.field},${sort.dir}`));

  const res = await apiFetch<ApiResult<AdminOrderListItem[]>>(
    `/api/admin/orders?${searchParams.toString()}`,
  );

  return {
    data: res.data,
    meta: res.meta ?? {
      page: params.page ?? 0,
      size: params.size ?? 20,
      totalElements: res.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

export async function getAdminOrderFacets(
  params: Omit<AdminOrdersParams, 'page' | 'size' | 'sort'>,
): Promise<AdminOrderFacets> {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.status) searchParams.set('status', params.status);
  if (params.paymentMethod) searchParams.set('paymentMethod', params.paymentMethod);
  if (params.createdFrom) searchParams.set('createdFrom', params.createdFrom);
  if (params.createdTo) searchParams.set('createdTo', params.createdTo);
  if (params.amountMin !== undefined) searchParams.set('amountMin', String(params.amountMin));
  if (params.amountMax !== undefined) searchParams.set('amountMax', String(params.amountMax));

  const query = searchParams.toString();
  const res = await apiFetch<ApiResult<AdminOrderFacets>>(
    `/api/admin/orders/facets${query ? `?${query}` : ''}`,
  );

  return res.data;
}

export async function getAdminOrder(id: number): Promise<AdminOrder> {
  const res = await apiFetch<ApiResult<AdminOrder>>(`/api/admin/orders/${id}`);
  return res.data;
}

export async function updateAdminOrderStatus(
  orderId: number,
  status: Exclude<AdminOrderStatus, 'pending' | 'expired'>,
  details?: { reason?: string; note?: string },
): Promise<AdminOrder> {
  const res = await apiFetch<ApiResult<AdminOrder>>(`/api/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, ...details }),
  });
  return res.data;
}

export async function getAdminOrderShipment(orderId: number): Promise<OrderShipmentData> {
  const res = await apiFetch<ApiResult<OrderShipmentData>>(`/api/admin/orders/${orderId}/shipment`);
  return res.data;
}

export async function createAdminOrderShipment(
  orderId: number,
  provider: string,
): Promise<ShipmentData> {
  const params = new URLSearchParams({ provider });
  const res = await apiFetch<ApiResult<ShipmentData>>(
    `/api/admin/orders/${orderId}/shipment?${params}`,
    {
      method: 'POST',
    },
  );
  return res.data;
}

export async function simulateAdminShipmentEvent(
  shipmentId: number,
  data: { status: string; location?: string; note?: string },
): Promise<ShipmentData> {
  const res = await apiFetch<ApiResult<ShipmentData>>(
    `/api/admin/shipments/${shipmentId}/simulation-events`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return res.data;
}
