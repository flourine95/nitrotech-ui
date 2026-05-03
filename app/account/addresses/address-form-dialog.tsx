'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tantml:function_calls>
<invoke name="X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { addressSchema } from '@/lib/schemas/address';
import type { AddressFormData } from '@/lib/schemas/address';
import type { Address } from '@/lib/types/address';
import { createAddress, updateAddress } from '@/lib/api/addresses';

interface AddressFormDialogProps {
  address: Address | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddressFormDialog({ address, onClose, onSuccess }: AddressFormDialogProps) {
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: address || {
      name: '',
      phone: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      country: 'Vietnam',
      isDefault: false,
    },
  });

  const isDefault = watch('isDefault');

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      toast.success('Đã thêm địa chỉ mới');
      onSuccess();
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      toast.error(err?.error?.message || 'Thêm địa chỉ thất bại');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: AddressFormData) => updateAddress(address!.id, data),
    onSuccess: () => {
      toast.success('Đã cập nhật địa chỉ');
      onSuccess();
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;

      switch (code) {
        case 'ADDRESS_NOT_FOUND':
          toast.error('Địa chỉ không tồn tại');
          break;
        default:
          toast.error(err?.error?.message || 'Cập nhật địa chỉ thất bại');
      }
    },
  });

  const onSubmit = (data: AddressFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">
            {isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer rounded-full p-2 text-slate-400 transition-colors duration-200 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="size-4" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
              disabled={isSubmitting}
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
              placeholder="0901234567"
              className="mt-1.5"
              disabled={isSubmitting}
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
              placeholder="Số nhà, tên đường"
              className="mt-1.5"
              disabled={isSubmitting}
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
            <Input
              id="ward"
              {...register('ward')}
              placeholder="Phường 1"
              className="mt-1.5"
              disabled={isSubmitting}
            />
            {errors.ward && (
              <p className="mt-1 text-sm text-destructive">{errors.ward.message}</p>
            )}
          </div>

          {/* District & City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="district">
                Quận/Huyện <span className="text-destructive">*</span>
              </Label>
              <Input
                id="district"
                {...register('district')}
                placeholder="Quận 1"
                className="mt-1.5"
                disabled={isSubmitting}
              />
              {errors.district && (
                <p className="mt-1 text-sm text-destructive">{errors.district.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="city">
                Tỉnh/Thành phố <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                {...register('city')}
                placeholder="TP. HCM"
                className="mt-1.5"
                disabled={isSubmitting}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-destructive">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* Is Default */}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              id="isDefault"
              checked={isDefault}
              onCheckedChange={(checked) => setValue('isDefault', checked === true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="isDefault" className="cursor-pointer font-normal">
              Đặt làm địa chỉ mặc định
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {isEditing ? 'Đang cập nhật...' : 'Đang lưu...'}
                </>
              ) : isEditing ? (
                'Cập nhật'
              ) : (
                'Lưu địa chỉ'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
