import { apiFetch } from '@/lib/api/client';
import type { Page } from '@/types/pagination';
import { toPage } from '@/lib/api/public/products';

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
  page?: number;
  size?: number;
  sort?: string | string[];
}

export async function getBrands(query?: BrandsQuery): Promise<Page<Brand>> {
  const q = new URLSearchParams();
  if (query?.search?.trim()) q.set('search', query.search.trim());
  if (query?.page !== undefined) q.set('page', String(query.page));
  if (query?.size !== undefined) q.set('size', String(query.size));

  let qs = q.toString() ? `?${q}` : '';

  if (query?.sort) {
    const sorts = Array.isArray(query.sort) ? query.sort : [query.sort];
    const sortStr = sorts.map((s) => `sort=${s}`).join('&');
    qs = qs ? `${qs}&${sortStr}` : `?${sortStr}`;
  }

  const res = await apiFetch<Parameters<typeof toPage<Brand>>[0]>(`/api/brands${qs}`);
  return toPage(res);
}

export async function getBrand(id: number) {
  const res = await apiFetch<{ data: Brand }>(`/api/brands/${id}`);
  return res.data;
}
