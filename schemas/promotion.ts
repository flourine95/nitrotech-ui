import { z } from 'zod';

// Validate promotion schema
export const validatePromotionSchema = z.object({
  code: z.string().min(1, 'Mã khuyến mãi là bắt buộc'),
  orderAmount: z.number().positive('Số tiền đơn hàng phải lớn hơn 0'),
});

export type ValidatePromotionData = z.infer<typeof validatePromotionSchema>;

// Discount type
export const discountTypeSchema = z.enum(['percentage', 'fixed']);

export type DiscountType = z.infer<typeof discountTypeSchema>;
