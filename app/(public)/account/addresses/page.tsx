'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from '@/lib/api/addresses';
import {
  getVietnamDistricts,
  getVietnamProvinces,
  getVietnamWards,
  type LocationDistrict,
  type LocationProvince,
  type LocationWard,
} from '@/lib/api/locations';
import { addressSchema, type AddressFormData } from '@/schemas/address';
import type { Address } from '@/types/address';

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const refreshAddresses = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      toast.success('Đã xóa địa chỉ');
      void refreshAddresses();
    },
    onError: () => toast.error('Xóa địa chỉ thất bại'),
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      toast.success('Đã đặt làm mặc định');
      void refreshAddresses();
    },
    onError: () => toast.error('Cập nhật địa chỉ mặc định thất bại'),
  });

  function openCreateDialog() {
    setEditingAddress(null);
    setDialogOpen(true);
  }

  function openEditDialog(address: Address) {
    setEditingAddress(address);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sổ địa chỉ</h1>
          <p className="mt-1 text-sm text-slate-500">
            Quản lý địa chỉ nhận hàng dùng cho các lần thanh toán sau.
          </p>
        </div>
        <Button className="rounded-full" onClick={openCreateDialog}>
          <Plus />
          Thêm địa chỉ
        </Button>
      </div>

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-3xl border border-slate-200 bg-white">
          <Loader2 className="size-6 animate-spin text-slate-400" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <MapPin />
          </div>
          <h2 className="mt-4 font-semibold text-slate-900">Chưa có địa chỉ</h2>
          <p className="mt-1 text-sm text-slate-500">
            Thêm địa chỉ nhận hàng để checkout nhanh hơn.
          </p>
          <Button className="mt-5 rounded-full" onClick={openCreateDialog}>
            <Plus />
            Thêm địa chỉ đầu tiên
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <MapPin />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold text-slate-900">
                      {address.name} - {address.phone}
                    </h2>
                    {address.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {[address.address, address.ward, address.district, address.city]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {!address.isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => defaultMutation.mutate(address.id)}
                    disabled={defaultMutation.isPending}
                  >
                    <Star />
                    Đặt mặc định
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={() => openEditDialog(address)}
                >
                  <Pencil />
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={() => {
                    if (window.confirm('Xóa địa chỉ này?')) deleteMutation.mutate(address.id);
                  }}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 />
                  Xóa
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AddressDialog
        open={dialogOpen}
        address={editingAddress}
        onOpenChange={setDialogOpen}
        onSaved={() => {
          setDialogOpen(false);
          void refreshAddresses();
        }}
      />
    </div>
  );
}

function AddressDialog({
  open,
  address,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  address: Address | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [districts, setDistricts] = useState<LocationDistrict[]>([]);
  const [wards, setWards] = useState<LocationWard[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [wardsLoading, setWardsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: emptyAddressForm(),
  });

  const selectedCityCode = watch('cityCode');
  const selectedDistrictCode = watch('districtCode');

  const saveMutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      address ? updateAddress(address.id, data) : createAddress(data),
    onSuccess: () => {
      toast.success(address ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ');
      onSaved();
    },
    onError: () => toast.error(address ? 'Cập nhật địa chỉ thất bại' : 'Thêm địa chỉ thất bại'),
  });

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
    if (!open) return;

    reset(address ? addressToForm(address) : emptyAddressForm());
    setDistricts([]);
    setWards([]);

    if (address?.cityCode) {
      setDistrictsLoading(true);
      void getVietnamDistricts(address.cityCode)
        .then(setDistricts)
        .finally(() => setDistrictsLoading(false));
    }

    if (address?.districtCode) {
      setWardsLoading(true);
      void getVietnamWards(address.districtCode)
        .then(setWards)
        .finally(() => setWardsLoading(false));
    }
  }, [address, open, reset]);

  function handleProvinceChange(code: string) {
    const province = provinces.find((item) => String(item.code) === code);
    setValue('cityCode', code);
    setValue('city', province?.name ?? '');
    setValue('districtCode', '');
    setValue('district', '');
    setValue('wardCode', '');
    setValue('ward', '');
    setDistricts([]);
    setWards([]);

    if (code) {
      setDistrictsLoading(true);
      void getVietnamDistricts(code)
        .then(setDistricts)
        .finally(() => setDistrictsLoading(false));
    }
  }

  function handleDistrictChange(code: string) {
    const district = districts.find((item) => String(item.code) === code);
    setValue('districtCode', code);
    setValue('district', district?.name ?? '');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{address ? 'Sửa địa chỉ' : 'Thêm địa chỉ'}</DialogTitle>
          <DialogDescription>
            Địa chỉ này sẽ được dùng để điền nhanh ở bước thanh toán.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit((data) => saveMutation.mutate(data))}>
          <FieldGroup>
            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="addressName">Họ và tên</FieldLabel>
                <Input
                  id="addressName"
                  className="rounded-full"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="addressPhone">Số điện thoại</FieldLabel>
                <Input
                  id="addressPhone"
                  className="rounded-full"
                  {...register('phone')}
                  aria-invalid={!!errors.phone}
                />
                <FieldError errors={[errors.phone]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="addressStreet">Số nhà, tên đường</FieldLabel>
              <Input
                id="addressStreet"
                className="rounded-full"
                {...register('address')}
                aria-invalid={!!errors.address}
              />
              <FieldError errors={[errors.address]} />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="addressCity">Tỉnh/Thành phố</FieldLabel>
                <Select
                  value={watch('cityCode') || ''}
                  onValueChange={handleProvinceChange}
                  disabled={locationsLoading}
                >
                  <SelectTrigger
                    id="addressCity"
                    className="w-full rounded-full"
                    aria-invalid={!!errors.city}
                  >
                    <SelectValue
                      placeholder={locationsLoading ? 'Đang tải...' : 'Chọn tỉnh/thành phố'}
                    />
                  </SelectTrigger>
                  <SelectContent position="popper" className="p-1">
                    <SelectGroup>
                      {provinces.map((province) => (
                        <SelectItem key={province.code} value={String(province.code)}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('city')} />
                <input type="hidden" {...register('cityCode')} />
                <FieldError errors={[errors.city]} />
              </Field>

              <Field
                data-invalid={!!errors.district}
                data-disabled={!selectedCityCode || districtsLoading}
              >
                <FieldLabel htmlFor="addressDistrict">Quận/Huyện</FieldLabel>
                <Select
                  value={watch('districtCode') || ''}
                  onValueChange={handleDistrictChange}
                  disabled={!selectedCityCode || districtsLoading}
                >
                  <SelectTrigger
                    id="addressDistrict"
                    className="w-full rounded-full"
                    aria-invalid={!!errors.district}
                  >
                    <SelectValue
                      placeholder={districtsLoading ? 'Đang tải...' : 'Chọn quận/huyện'}
                    />
                  </SelectTrigger>
                  <SelectContent position="popper" className="p-1">
                    <SelectGroup>
                      {districts.map((district) => (
                        <SelectItem key={district.code} value={String(district.code)}>
                          {district.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('district')} />
                <input type="hidden" {...register('districtCode')} />
                <FieldError errors={[errors.district]} />
              </Field>

              <Field
                data-invalid={!!errors.ward}
                data-disabled={!selectedDistrictCode || wardsLoading}
              >
                <FieldLabel htmlFor="addressWard">Phường/Xã</FieldLabel>
                <Select
                  value={watch('wardCode') || ''}
                  onValueChange={handleWardChange}
                  disabled={!selectedDistrictCode || wardsLoading}
                >
                  <SelectTrigger
                    id="addressWard"
                    className="w-full rounded-full"
                    aria-invalid={!!errors.ward}
                  >
                    <SelectValue placeholder={wardsLoading ? 'Đang tải...' : 'Chọn phường/xã'} />
                  </SelectTrigger>
                  <SelectContent position="popper" className="p-1">
                    <SelectGroup>
                      {wards.map((ward) => (
                        <SelectItem key={ward.code} value={String(ward.code)}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register('ward')} />
                <input type="hidden" {...register('wardCode')} />
                <FieldError errors={[errors.ward]} />
              </Field>
            </div>

            <Field orientation="horizontal" className="items-center">
              <Checkbox
                id="addressDefault"
                checked={watch('isDefault') === true}
                onCheckedChange={(checked) => setValue('isDefault', checked === true)}
              />
              <FieldLabel htmlFor="addressDefault" className="cursor-pointer font-normal">
                Đặt làm địa chỉ mặc định
              </FieldLabel>
            </Field>
          </FieldGroup>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" className="rounded-full" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="animate-spin" />}
              {address ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function emptyAddressForm(): AddressFormData {
  return {
    name: '',
    phone: '',
    address: '',
    ward: '',
    wardCode: '',
    district: '',
    districtCode: '',
    city: '',
    cityCode: '',
    country: 'Vietnam',
    isDefault: false,
  };
}

function addressToForm(address: Address): AddressFormData {
  return {
    name: address.name,
    phone: address.phone,
    address: address.address,
    ward: address.ward,
    wardCode: address.wardCode,
    district: address.district || '',
    districtCode: address.districtCode || '',
    city: address.city,
    cityCode: address.cityCode,
    country: address.country,
    isDefault: address.isDefault,
  };
}
