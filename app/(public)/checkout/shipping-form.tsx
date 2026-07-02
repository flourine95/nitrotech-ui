'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, ChevronRight, MapPin } from 'lucide-react';
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
  getVietnamDistricts,
  getVietnamProvinces,
  getVietnamWards,
  type LocationDistrict,
  type LocationProvince,
  type LocationWard,
} from '@/lib/api/locations';
import { shippingAddressSchema } from '@/schemas/address';
import type { ShippingAddressData } from '@/schemas/address';
import type { Address } from '@/types/address';
import type { ShippingAddress } from '@/types/order';
import { cn } from '@/lib/utils';

interface ShippingFormProps {
  initialData: ShippingAddress | null;
  initialSaveAddress: boolean;
  savedAddresses: Address[];
  onAddressChange?: (shippingAddress: ShippingAddress | null) => void;
  onSubmit: (address: ShippingAddress, defaultAddress: boolean, shouldSaveAddress: boolean) => void;
}

export default function ShippingForm({
  initialData,
  initialSaveAddress,
  savedAddresses,
  onAddressChange,
  onSubmit,
}: ShippingFormProps) {
  const [saveAddress, setSaveAddress] = useState(initialSaveAddress);
  const [provinces, setProvinces] = useState<LocationProvince[]>([]);
  const [districts, setDistricts] = useState<LocationDistrict[]>([]);
  const [wards, setWards] = useState<LocationWard[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [wardsLoading, setWardsLoading] = useState(false);
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>(
    savedAddresses.length > 0 ? 'saved' : 'new',
  );

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
      district: '',
      districtCode: '',
      city: '',
      cityCode: '',
      country: 'Vietnam',
    },
  });

  const selectedCityCode = watch('cityCode');
  const selectedDistrictCode = watch('districtCode');
  const watchedAddress = watch();
  const selectedAddressKey = addressKey(watchedAddress);
  const selectedSavedAddress = savedAddresses.find(
    (address) => addressKey(address) === selectedAddressKey,
  );
  const fallbackSavedAddress =
    selectedSavedAddress ??
    savedAddresses.find((address) => address.isDefault) ??
    savedAddresses[0];
  const savedAddressComplete =
    !fallbackSavedAddress ||
    Boolean(fallbackSavedAddress.district && fallbackSavedAddress.districtCode);

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
    if (selectedSavedAddress) setAddressMode('saved');
  }, [selectedSavedAddress]);

  useEffect(() => {
    if (!initialData?.cityCode) return;

    setDistrictsLoading(true);
    void getVietnamDistricts(initialData.cityCode)
      .then(setDistricts)
      .finally(() => setDistrictsLoading(false));
  }, [initialData?.cityCode]);

  useEffect(() => {
    if (!initialData?.districtCode) return;

    setWardsLoading(true);
    void getVietnamWards(initialData.districtCode)
      .then(setWards)
      .finally(() => setWardsLoading(false));
  }, [initialData?.districtCode]);

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

  const handleSavedAddressChange = useCallback(
    (id: string) => {
      const address = savedAddresses.find((item) => String(item.id) === id);
      if (!address) return;

      reset({
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
      });
      setSaveAddress(false);
      setAddressMode('saved');

      if (address.cityCode) {
        setDistrictsLoading(true);
        void getVietnamDistricts(address.cityCode)
          .then(setDistricts)
          .finally(() => setDistrictsLoading(false));
      }

      if (address.districtCode) {
        setWardsLoading(true);
        void getVietnamWards(address.districtCode)
          .then(setWards)
          .finally(() => setWardsLoading(false));
      }
    },
    [reset, savedAddresses],
  );

  function handleNewAddress() {
    reset({
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
    });
    setDistricts([]);
    setWards([]);
    setSaveAddress(true);
    setAddressMode('new');
    setAddressDialogOpen(false);
  }

  useEffect(() => {
    if (addressMode !== 'saved' || selectedSavedAddress || !fallbackSavedAddress) return;
    handleSavedAddressChange(String(fallbackSavedAddress.id));
  }, [addressMode, fallbackSavedAddress, handleSavedAddressChange, selectedSavedAddress]);

  useEffect(() => {
    if (!onAddressChange) return;

    if (addressMode === 'saved') {
      if (!fallbackSavedAddress || !savedAddressComplete) {
        onAddressChange(null);
        return;
      }

      onAddressChange({
        name: fallbackSavedAddress.name,
        phone: fallbackSavedAddress.phone,
        address: fallbackSavedAddress.address,
        ward: fallbackSavedAddress.ward,
        wardCode: fallbackSavedAddress.wardCode,
        district: fallbackSavedAddress.district || '',
        districtCode: fallbackSavedAddress.districtCode || '',
        city: fallbackSavedAddress.city,
        cityCode: fallbackSavedAddress.cityCode,
        country: fallbackSavedAddress.country || 'Vietnam',
      });
      return;
    }

    const result = shippingAddressSchema.safeParse(watchedAddress);
    onAddressChange(
      result.success
        ? {
            ...result.data,
            country: result.data.country || 'Vietnam',
          }
        : null,
    );
  }, [addressMode, fallbackSavedAddress, onAddressChange, savedAddressComplete, watchedAddress]);

  const submitAddress = (data: ShippingAddressData, shouldSaveAddress: boolean) => {
    const address: ShippingAddress = {
      ...data,
      country: data.country || 'Vietnam',
    };
    onSubmit(address, saveAddress, shouldSaveAddress);
  };

  const handleFormSubmit = (data: ShippingAddressData) => {
    submitAddress(data, addressMode === 'new' || savedAddresses.length === 0);
  };

  const handleCheckoutSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (addressMode === 'saved' && fallbackSavedAddress) {
      event.preventDefault();
      if (!savedAddressComplete) return;
      submitAddress(
        {
          name: fallbackSavedAddress.name,
          phone: fallbackSavedAddress.phone,
          address: fallbackSavedAddress.address,
          ward: fallbackSavedAddress.ward,
          wardCode: fallbackSavedAddress.wardCode,
          district: fallbackSavedAddress.district || '',
          districtCode: fallbackSavedAddress.districtCode || '',
          city: fallbackSavedAddress.city,
          cityCode: fallbackSavedAddress.cityCode,
          country: fallbackSavedAddress.country || 'Vietnam',
        },
        false,
      );
      return;
    }

    void handleSubmit(handleFormSubmit)(event);
  };

  return (
    <form
      onSubmit={handleCheckoutSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Địa chỉ giao hàng</h2>
          <p className="mt-1 text-sm text-slate-500">Chọn địa chỉ nhận hàng cho đơn này.</p>
        </div>
      </div>

      <FieldGroup>
        {savedAddresses.length > 0 && (
          <div className="space-y-4">
            <div className="inline-flex rounded-full border bg-muted/30 p-1">
              <button
                type="button"
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors',
                  addressMode === 'saved' && 'bg-background text-foreground shadow-xs',
                )}
                onClick={() => {
                  if (fallbackSavedAddress) {
                    handleSavedAddressChange(String(fallbackSavedAddress.id));
                  }
                  setAddressMode('saved');
                }}
              >
                Địa chỉ đã lưu
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors',
                  addressMode === 'new' && 'bg-background text-foreground shadow-xs',
                )}
                onClick={handleNewAddress}
              >
                Nhập địa chỉ mới
              </button>
            </div>

            {addressMode === 'saved' && (
              <div className="rounded-2xl border border-primary/25 bg-primary/[0.03] p-4 ring-1 ring-primary/10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <MapPin className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {fallbackSavedAddress
                            ? savedAddressShortLabel(fallbackSavedAddress)
                            : 'Chưa chọn địa chỉ'}
                        </p>
                        {fallbackSavedAddress?.isDefault && (
                          <Badge variant="secondary">Mặc định</Badge>
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">
                        {fallbackSavedAddress
                          ? savedAddressLine(fallbackSavedAddress)
                          : 'Chọn một địa chỉ trong sổ địa chỉ.'}
                      </p>
                      {!savedAddressComplete && (
                        <p className="mt-2 text-sm font-medium text-amber-600">
                          Địa chỉ này thiếu quận/huyện. Vui lòng nhập địa chỉ mới.
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => setAddressDialogOpen(true)}
                    >
                      Đổi
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(addressMode === 'new' || savedAddresses.length === 0) && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
                <Input
                  id="name"
                  className="rounded-full"
                  {...register('name')}
                  placeholder="Nguyễn Văn A"
                  aria-invalid={!!errors.name}
                />
                <FieldError errors={[errors.name]} />
              </Field>

              <Field data-invalid={!!errors.phone}>
                <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
                <Input
                  id="phone"
                  className="rounded-full"
                  {...register('phone')}
                  placeholder="0123456789"
                  aria-invalid={!!errors.phone}
                />
                <FieldError errors={[errors.phone]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="address">Số nhà, tên đường</FieldLabel>
              <Input
                id="address"
                className="rounded-full"
                {...register('address')}
                placeholder="50 Đ. Lê Văn Việt"
                aria-invalid={!!errors.address}
              />
              <FieldError errors={[errors.address]} />
            </Field>

            <div className="grid gap-4 md:grid-cols-3">
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="cityCode">Tỉnh/Thành phố</FieldLabel>
                <Select
                  value={watch('cityCode') || ''}
                  onValueChange={handleProvinceChange}
                  disabled={locationsLoading}
                >
                  <SelectTrigger
                    id="cityCode"
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
                <FieldLabel htmlFor="districtCode">Quận/Huyện</FieldLabel>
                <Select
                  value={watch('districtCode') || ''}
                  onValueChange={handleDistrictChange}
                  disabled={!selectedCityCode || districtsLoading}
                >
                  <SelectTrigger
                    id="districtCode"
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
                <FieldLabel htmlFor="wardCode">Phường/Xã</FieldLabel>
                <Select
                  value={watch('wardCode') || ''}
                  onValueChange={handleWardChange}
                  disabled={!selectedDistrictCode || wardsLoading}
                >
                  <SelectTrigger
                    id="wardCode"
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
                id="saveAddress"
                checked={saveAddress}
                onCheckedChange={(checked) => setSaveAddress(checked === true)}
              />
              <FieldLabel htmlFor="saveAddress" className="cursor-pointer font-normal">
                Đặt làm địa chỉ mặc định
              </FieldLabel>
            </Field>
          </>
        )}
      </FieldGroup>

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
        <Button
          type="submit"
          className="w-full rounded-full sm:w-48"
          size="lg"
          disabled={addressMode === 'saved' && !savedAddressComplete}
        >
          Tiếp tục
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>

      <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chọn địa chỉ giao hàng</DialogTitle>
            <DialogDescription>Chọn một địa chỉ đã lưu để dùng cho đơn hàng này.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {savedAddresses.map((address) => {
              const selected = selectedSavedAddress?.id === address.id;

              return (
                <button
                  key={address.id}
                  type="button"
                  className={cn(
                    'flex w-full gap-3 rounded-4xl border p-3 text-left transition-colors hover:bg-muted/50',
                    selected && 'border-primary bg-primary/5',
                  )}
                  onClick={() => {
                    handleSavedAddressChange(String(address.id));
                    setAddressDialogOpen(false);
                  }}
                >
                  <span
                    className={cn(
                      'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                      selected && 'border-primary bg-primary text-primary-foreground',
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      {savedAddressShortLabel(address)}
                      {address.isDefault && <Badge variant="secondary">Mặc định</Badge>}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">
                      {savedAddressLine(address)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}

function addressKey(address: Partial<ShippingAddressData>) {
  return [
    address.name,
    address.phone,
    address.address,
    address.wardCode,
    address.districtCode,
    address.cityCode,
  ].join('|');
}

function savedAddressShortLabel(address: Address) {
  return `${address.name} - ${address.phone}`;
}

function savedAddressLine(address: Address) {
  return [address.address, address.ward, address.district, address.city].filter(Boolean).join(', ');
}
