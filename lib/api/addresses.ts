import { apiFetch } from '@/lib/api/client';
import type { Address } from '@/types/address';
import type { AddressFormData } from '@/schemas/address';

interface BackendAddress {
  id: number;
  userId: number;
  receiver: string;
  phone: string;
  province: string;
  provinceCode: string;
  district: string;
  districtCode: string;
  ward: string;
  wardCode: string;
  street: string;
  defaultAddress: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendAddressResponse {
  data: BackendAddress;
  message?: string;
}

interface BackendAddressListResponse {
  data: BackendAddress[];
}

// GET /api/addresses - Get user addresses
export async function getAddresses(): Promise<Address[]> {
  const res = await apiFetch<BackendAddressListResponse>('/api/addresses');
  return res.data.map(fromBackendAddress);
}

// POST /api/addresses - Create address
export async function createAddress(data: AddressFormData): Promise<Address> {
  const res = await apiFetch<BackendAddressResponse>('/api/addresses', {
    method: 'POST',
    body: JSON.stringify(toBackendAddress(data)),
  });
  return fromBackendAddress(res.data);
}

// PUT /api/addresses/{id} - Update address
export async function updateAddress(id: number, data: Partial<AddressFormData>): Promise<Address> {
  const res = await apiFetch<BackendAddressResponse>(`/api/addresses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toBackendAddress(data)),
  });
  return fromBackendAddress(res.data);
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

function fromBackendAddress(address: BackendAddress): Address {
  return {
    id: address.id,
    userId: address.userId,
    name: address.receiver,
    phone: address.phone,
    address: address.street,
    ward: address.ward,
    wardCode: address.wardCode,
    district: address.district,
    districtCode: address.districtCode,
    city: address.province,
    cityCode: address.provinceCode,
    country: 'Vietnam',
    isDefault: address.defaultAddress,
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

function toBackendAddress(data: Partial<AddressFormData>) {
  return {
    receiver: data.name,
    phone: data.phone,
    province: data.city,
    provinceCode: data.cityCode || data.city,
    district: data.district || null,
    districtCode: data.districtCode || null,
    ward: data.ward,
    wardCode: data.wardCode || data.ward,
    street: data.address,
    defaultAddress: data.isDefault,
  };
}
