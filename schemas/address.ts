import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
  name: z.string().min(1, 'Tên người nhận là bắt buộc'),
  phone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .regex(/^[0-9]+$/, 'Số điện thoại chỉ chứa chữ số'),
  address: z.string().min(1, 'Địa chỉ là bắt buộc'),
  ward: z.string().min(1, 'Phường/Xã là bắt buộc'),
  wardCode: z.string().optional(),
  district: z.string().min(1, 'Quận/Huyện là bắt buộc'),
  districtCode: z.string().min(1, 'Quận/Huyện là bắt buộc'),
  city: z.string().min(1, 'Tỉnh/Thành phố là bắt buộc'),
  cityCode: z.string().optional(),
  country: z.string().min(1, 'Quốc gia là bắt buộc'),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressSchema>;

// Shipping address for checkout (same as address but without isDefault)
export const shippingAddressSchema = addressSchema.omit({ isDefault: true });

export type ShippingAddressData = z.infer<typeof shippingAddressSchema>;
