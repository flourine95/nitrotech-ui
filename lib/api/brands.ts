import { apiFetch } from '@/lib/client';
import type { Page } from '@/lib/types/pagination';

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrandsQuery {
  search?: string;
  active?: boolean;
  deleted?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getBrands(query?: BrandsQuery): Promise<Page<Brand>> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.active !== undefined) q.set('active', String(query.active));
  if (query?.deleted !== undefined) q.set('deleted', String(query.deleted));
  if (query?.page !== undefined) q.set('page', String(query.page));
  if (query?.size !== undefined) q.set('size', String(query.size));
  if (query?.sort) q.set('sort', query.sort);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: Page<Brand> }>(`/api/brands${qs}`);
  return res.data;
}

export async function getBrand(id: number) {
  const res = await apiFetch<{ data: Brand }>(`/api/brands/${id}`);
  return res.data;
}

export async function createBrand(body: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>) {
  const res = await apiFetch<{ data: Brand; message: string }>('/api/brands', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateBrand(
  id: number,
  body: Partial<Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>>,
) {
  const res = await apiFetch<{ data: Brand }>(`/api/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function deleteBrand(id: number) {
  return apiFetch<{ message: string }>(`/api/brands/${id}`, { method: 'DELETE' });
}

export async function restoreBrand(id: number) {
  return apiFetch<{ message: string }>(`/api/brands/${id}/restore`, { method: 'PATCH' });
}

export async function hardDeleteBrand(id: number) {
  return apiFetch<{ message: string }>(`/api/brands/${id}/permanent`, { method: 'DELETE' });
}
