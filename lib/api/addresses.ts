import { apiFetch } from '@/lib/client';
import type { Address, AddressResponse, AddressListResponse } from '@/lib/types/address';
import type { AddressFormData } from '@/lib/schemas/address';

// GET /api/addresses - Get user addresses
export async function getAddresses(): Promise<Address[]> {
  const res = await apiFetch<AddressListResponse>('/api/addresses');
  return res.data;
}

// POST /api/addresses - Create address
export async function createAddress(data: AddressFormData): Promise<Address> {
  const res = await apiFetch<AddressResponse>('/api/addresses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

// PUT /api/addresses/{id} - Update address
export async function updateAddress(id: number, data: Partial<AddressFormData>): Promise<Address> {
  const res = await apiFetch<AddressResponse>(`/api/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

// DELETE /api/addresses/{id} - Delete address
export async function deleteAddress(id: number) {
  return apiFetch<{ message: string }>(`/api/addresses/${id}`, {
    method: 'DELETE',
  });
}

// PATCH /api/addresses/{id}/set-default - Set default address
export async function setDefaultAddress(id: number) {
  return apiFetch<{ message: string }>(`/api/addresses/${id}/set-default`, {
    method: 'PATCH',
  });
}
