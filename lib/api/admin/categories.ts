import { apiFetch } from '@/lib/api/client';
import type { Category } from '@/lib/api/public/categories';

export type { Category } from '@/lib/api/public/categories';

export interface CategoryFacets {
  active: number;
  inactive: number;
  deleted: number;
  root: number;
  withChildren: number;
}

export interface CategoriesResponse {
  data: Category[];
  facets?: CategoryFacets;
}

export interface CategoriesQuery {
  deleted?: boolean;
}

export async function getCategories(
  params?: CategoriesQuery,
): Promise<CategoriesResponse | Category[]> {
  const q = new URLSearchParams();
  if (params?.deleted !== undefined) q.set('deleted', String(params.deleted));
  const qs = q.toString() ? `?${q}` : '';

  if (params?.deleted) {
    const res = await apiFetch<{ data: Category[] }>(`/api/admin/categories${qs}`);
    return res.data;
  }

  return apiFetch<CategoriesResponse>(`/api/admin/categories${qs}`);
}

export async function getCategory(id: number) {
  const res = await apiFetch<{ data: Category }>(`/api/admin/categories/${id}`);
  return res.data;
}

export async function createCategory(body: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number | null;
  active: boolean;
}) {
  const res = await apiFetch<{ data: Category; message: string }>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function updateCategory(
  id: number,
  body: Partial<{
    name: string;
    slug: string;
    description: string | null;
    parentId: number | null;
    active: boolean;
    image: string | null;
  }>,
) {
  const res = await apiFetch<{ data: Category; message: string }>(`/api/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function toggleCategory(id: number) {
  const res = await apiFetch<{ data: { id: number; active: boolean }; message: string }>(
    `/api/admin/categories/${id}/toggle`,
    { method: 'PATCH' },
  );
  return res.data;
}

export async function moveCategoryUp(id: number) {
  const res = await apiFetch<{ data: { updated: Array<{ id: number; sortOrder: number }> }; message: string }>(
    `/api/admin/categories/${id}/move-up`,
    { method: 'PATCH' },
  );
  return res.data;
}

export async function moveCategoryDown(id: number) {
  const res = await apiFetch<{ data: { updated: Array<{ id: number; sortOrder: number }> }; message: string }>(
    `/api/admin/categories/${id}/move-down`,
    { method: 'PATCH' },
  );
  return res.data;
}

export async function moveCategory(
  id: number,
  body: {
    newParentId?: number | null;
    afterId?: number | null;
  },
) {
  const res = await apiFetch<{ data: Category; message: string }>(
    `/api/admin/categories/${id}/move`,
    {
      method: 'PATCH',
      body: JSON.stringify(body),
    },
  );
  return res.data;
}

export async function deleteCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/admin/categories/${id}`, { method: 'DELETE' });
}

export async function restoreCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/admin/categories/${id}/restore`, { method: 'PATCH' });
}

export async function hardDeleteCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/admin/categories/${id}/permanent`, {
    method: 'DELETE',
  });
}
