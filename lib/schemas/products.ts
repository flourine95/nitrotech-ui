import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, { message: 'Tên không được để trống' }),
  slug: z
    .string()
    .min(1, { message: 'Slug không được để trống' })
    .regex(/^[a-z0-9-]+$/, { message: 'Chỉ chữ thường, số, gạch ngang' }),
  description: z.string().optional(),
  categoryId: z.number({ message: 'Chọn danh mục' }).min(1, { message: 'Chọn danh mục' }),
  brandId: z.number().nullable().optional(),
  thumbnail: z.url({ error: 'Thumbnail phải là URL hợp lệ' }).or(z.literal('')).optional(),
  active: z.boolean(),
});

export type ProductFormData = z.infer<typeof productSchema>;
