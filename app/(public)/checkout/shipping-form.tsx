'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { shippingAddressSchema } from '@/schemas/address';
import type { ShippingAddressData } from '@/schemas/address';
import type { ShippingAddress } from '@/types/order';

interface ShippingFormProps {
  initialData: ShippingAddress | null;
  initialSaveAddress: boolean;
  onSubmit: (address: ShippingAddress, saveAddress: boolean) => void;
}

export default function ShippingForm({
  initialData,
  initialSaveAddress,
  onSubmit,
}: ShippingFormProps) {
  const [saveAddress, setSaveAddress] = useState(initialSaveAddress);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: initialData || {
      name: '',
      phone: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      country: 'Vietnam',
    },
  });

  const handleFormSubmit = (data: ShippingAddressData) => {
    const address: ShippingAddress = {
      ...data,
      country: data.country || 'Vietnam',
    };
    onSubmit(address, saveAddress);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="rounded-lg border bg-card p-6">
      <h2 className="mb-6 text-lg font-semibold">Địa chỉ giao hàng</h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <Label htmlFor="name">
            Họ và tên <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Nguyễn Văn A"
            className="mt-1.5"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">
            Số điện thoại <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="0123456789"
            className="mt-1.5"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-destructive">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address">
            Địa chỉ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="address"
            {...register('address')}
            placeholder="123 Đường ABC"
            className="mt-1.5"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-destructive">{errors.address.message}</p>
          )}
        </div>

        {/* Ward */}
        <div>
          <Label htmlFor="ward">
            Phường/Xã <span className="text-destructive">*</span>
          </Label>
          <Input id="ward" {...register('ward')} placeholder="Phường 1" className="mt-1.5" />
          {errors.ward && (
            <p className="mt-1 text-sm text-destructive">{errors.ward.message}</p>
          )}
        </div>

        {/* District */}
        <div>
          <Label htmlFor="district">
            Quận/Huyện <span className="text-destructive">*</span>
          </Label>
          <Input
            id="district"
            {...register('district')}
            placeholder="Quận 1"
            className="mt-1.5"
          />
          {errors.district && (
            <p className="mt-1 text-sm text-destructive">{errors.district.message}</p>
          )}
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city">
            Tỉnh/Thành phố <span className="text-destructive">*</span>
          </Label>
          <Input
            id="city"
            {...register('city')}
            placeholder="TP. Hồ Chí Minh"
            className="mt-1.5"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        {/* Save Address Checkbox */}
        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="saveAddress"
            checked={saveAddress}
            onCheckedChange={(checked) => setSaveAddress(checked === true)}
          />
          <Label htmlFor="saveAddress" className="cursor-pointer font-normal">
            Lưu địa chỉ này cho lần mua sau
          </Label>
        </div>
      </div>

      <Button type="submit" className="mt-6 w-full" size="lg">
        Tiếp tục
        <ChevronRight />
      </Button>
    </form>
  );
}
