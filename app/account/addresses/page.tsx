'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/lib/api/addresses';
import type { Address } from '@/lib/types/address';
import AddressFormDialog from './address-form-dialog';

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Fetch addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  // Set default mutation
  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã đặt làm địa chỉ mặc định');
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      toast.error(err?.error?.message || 'Cập nhật thất bại');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Đã xóa địa chỉ');
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;

      switch (code) {
        case 'ADDRESS_NOT_FOUND':
          toast.error('Địa chỉ không tồn tại');
          break;
        case 'CANNOT_DELETE_DEFAULT_ADDRESS':
          toast.error('Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.');
          break;
        default:
          toast.error(err?.error?.message || 'Xóa địa chỉ thất bại');
      }
    },
  });

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSetDefault = (id: number) => {
    setDefaultMutation.mutate(id);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  if (isLoading) {
    return <AddressesSkeleton />;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Địa chỉ giao hàng</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus />
          Thêm địa chỉ
        </Button>
      </div>

      {/* Address list */}
      <div className="space-y-4">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`rounded-3xl border bg-white p-6 shadow-sm ${addr.isDefault ? 'border-slate-900' : 'border-slate-200'}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900">{addr.name}</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-500">{addr.phone}</span>
                  {addr.isDefault && (
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                </p>
              </div>
              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(addr)}
                  disabled={deleteMutation.isPending || setDefaultMutation.isPending}
                >
                  <Pencil />
                  Sửa
                </Button>
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(addr.id)}
                    disabled={deleteMutation.isPending || setDefaultMutation.isPending}
                    className="text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </div>
            {!addr.isDefault && (
              <button
                onClick={() => handleSetDefault(addr.id)}
                disabled={setDefaultMutation.isPending}
                className="mt-4 cursor-pointer text-xs font-medium text-blue-600 transition-colors duration-150 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Đặt làm địa chỉ mặc định
              </button>
            )}
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <p className="mb-4 text-sm text-slate-500">Chưa có địa chỉ nào</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus />
              Thêm địa chỉ đầu tiên
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit form dialog */}
      {showForm && (
        <AddressFormDialog
          address={editingAddress}
          onClose={handleCloseForm}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] });
            handleCloseForm();
          }}
        />
      )}
    </div>
  );
}

function AddressesSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-3xl" />
        ))}
      </div>
    </div>
  );
}
