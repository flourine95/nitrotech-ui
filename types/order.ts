import type { OrderStatus, PaymentMethod } from '@/schemas/order';
import type { CartItem } from './cart';

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  ward: string;
  wardCode?: string;
  district: string;
  districtCode: string;
  city: string;
  cityCode?: string;
  country: string;
}

export interface ShippingFeeQuote {
  fee: number;
  provider?: string | null;
  estimatedDelivery?: string | null;
}

export interface OrderItem {
  id: number;
  orderId: number;
  variantId: number;
  quantity: number;
  price: number;
  variant: CartItem['variant'];
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  promotionCode: string | null;
  note: string | null;
  statusHistory?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderListItem {
  id: number;
  userId?: number;
  orderCode?: string;
  orderNumber?: string;
  receiver?: string | null;
  phone?: string | null;
  email?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus?: string | null;
  hasShipment?: boolean | null;
  shipmentStatus?: string | null;
  trackingCode?: string | null;
  availableActions?: string[];
  ageMinutes?: number | null;
  slaDueAt?: string | null;
  slaStatus?: string | null;
  slaLabel?: string | null;
  totalAmount?: number;
  discountAmount?: number;
  shippingFee?: number;
  finalAmount: number;
  itemCount?: number;
  items?: Array<{
    id?: number;
    name?: string;
    quantity?: number;
  }>;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderResponse {
  data: Order;
  message?: string;
}

export interface OrderListResponse {
  data: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
