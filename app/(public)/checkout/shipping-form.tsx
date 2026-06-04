'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  getVietnamProvinces,
  getVietnamWards,
  type LocationProvince,
  type LocationWard,
} from '@/lib/api/locations';
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
  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [wards, setWards] = useState<LocationWard[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [wardsLoading, setWardsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShippingAddressData>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: initialData || {
      name: '',
      phone: '',
      address: '',
      ward: '',
      wardCode: '',
      city: '',
      cityCode: '',
      country: 'Vietnam',
    },
  });

  const selectedCityCode = watch('cityCode');

  useEffect(() => {
    async function loadLocations() {
      try {
        setProvinces(await getVietnamProvinces());
      } finally {
        setLocationsLoading(false);
      }
    }

    void loadLocations();
  }, []);

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  useEffect(() => {
    if (!initialData?.cityCode) return;

    setWardsLoading(true);
    void getVietnamWards(initialData.cityCode)
      .then(setWards)
      .finally(() => setWardsLoading(false));
  }, [initialData?.cityCode]);

  function handleProvinceChange(code: string) {
    const province = provinces.find((item) => String(item.code) === code);
    setValue('cityCode', code);
    setValue('city', province?.name ?? '');
    setValue('districtCode', undefined);
    setValue('district', undefined);
    setValue('wardCode', '');
    setValue('ward', '');
    setWards([]);

    if (code) {
      setWardsLoading(true);
      void getVietnamWards(code)
        .then(setWards)
        .finally(() => setWardsLoading(false));
    }
  }

  function handleWardChange(code: string) {
    const ward = wards.find((item) => String(item.code) === code);
    setValue('wardCode', code);
    setValue('ward', ward?.name ?? '');
  }

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

        {/* Province */}
        <div>
          <Label htmlFor="cityCode">
            Tỉnh/Thành phố <span className="text-destructive">*</span>
          </Label>
          <select
            id="cityCode"
            {...register('cityCode')}
            onChange={(e) => handleProvinceChange(e.target.value)}
            disabled={locationsLoading}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{locationsLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
          <input type="hidden" {...register('city')} />
          {errors.city && (
            <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
          )}
        </div>

        {/* Ward */}
        <div>
          <Label htmlFor="wardCode">
            Phường/Xã <span className="text-destructive">*</span>
          </Label>
          <select
            id="wardCode"
            {...register('wardCode')}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!selectedCityCode || wardsLoading}
            className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">{wardsLoading ? 'Đang tải...' : 'Chọn phường/xã'}</option>
            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
          <input type="hidden" {...register('ward')} />
          {errors.ward && (
            <p className="mt-1 text-sm text-destructive">{errors.ward.message}</p>
          )}
          <input type="hidden" {...register('district')} />
          <input type="hidden" {...register('districtCode')} />
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
