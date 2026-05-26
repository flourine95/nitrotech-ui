import { z } from 'zod';

// Add to cart schema
export const addToCartSchema = z.object({
  variantId: z.number().positive('Variant ID phải là số dương'),
  quantity: z.number().min(1, 'Số lượng tối thiểu là 1'),
});

export type AddToCartData = z.infer<typeof addToCartSchema>;

// Update cart item schema
export const updateCartItemSchema = z.object({
  quantity: z.number().min(1, 'Số lượng tối thiểu là 1'),
});

export type UpdateCartItemData = z.infer<typeof updateCartItemSchema>;
