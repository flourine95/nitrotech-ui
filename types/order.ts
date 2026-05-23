import type { OrderStatus, PaymentMethod } from '@/schemas/order';
import type { CartItem } from './cart';

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  country: string;
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
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  finalAmount: number;
  itemCount: number;
  createdAt: string;
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
