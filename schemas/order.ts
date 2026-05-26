import { z } from 'zod';
import { shippingAddressSchema } from './address';

// Payment methods
export const paymentMethodSchema = z.enum(['cod', 'vnpay', 'momo'], {
  message: 'Phương thức thanh toán không hợp lệ',
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

// Create order schema
export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
  promotionCode: z.string().optional(),
  note: z.string().max(500, 'Ghi chú không được quá 500 ký tự').optional(),
  saveAddress: z.boolean().optional(),
});

export type CreateOrderData = z.infer<typeof createOrderSchema>;

// Cancel order schema
export const cancelOrderSchema = z.object({
  reason: z.string().max(500, 'Lý do không được quá 500 ký tự').optional(),
});

export type CancelOrderData = z.infer<typeof cancelOrderSchema>;

// Order status
export const orderStatusSchema = z.enum([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;
