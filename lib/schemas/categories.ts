import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  slug: z
    .string()
    .min(1, 'Bắt buộc')
    .regex(/^[a-z0-9-]+$/, 'Chỉ chữ thường, số, gạch ngang'),
  description: z.string().optional(),
  parentId: z.number().nullable(),
  active: z.boolean(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
