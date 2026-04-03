import { apiFetch } from './api';

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

export async function getBrands(active?: boolean) {
  const q = active !== undefined ? `?active=${active}` : '';
  const res = await apiFetch<{ data: Brand[] }>(`/api/brands${q}`);
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
  return apiFetch<{ message: string }>(`/api/brands/${id}`, {
    method: 'DELETE',
  });
}
