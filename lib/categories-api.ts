import { apiFetch } from './client';
import type { Page } from './brands-api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  parentName: string | null;
  active: boolean;
  sortOrder: number;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface MovePayload {
  movedId: number;
  fromParentId: number | null;
  toParentId: number | null;
  targetOrderedIds: number[];
  sourceOrderedIds?: number[];
}

export interface CategoriesQuery {
  search?: string;
  active?: boolean;
  deleted?: boolean;
  parentId?: number;
  tree?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export async function getCategories(params?: CategoriesQuery): Promise<Page<Category> | Category[]> {
  const q = new URLSearchParams();
  if (params?.search?.trim()) q.set('search', params.search.trim());
  if (params?.active !== undefined) q.set('active', String(params.active));
  if (params?.deleted !== undefined) q.set('deleted', String(params.deleted));
  if (params?.parentId !== undefined) q.set('parentId', String(params.parentId));
  if (params?.tree) q.set('tree', 'true');
  if (params?.page !== undefined) q.set('page', String(params.page));
  if (params?.size !== undefined) q.set('size', String(params.size));
  if (params?.sort) q.set('sort', params.sort);
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: Page<Category> | Category[] }>(`/api/categories${qs}`);
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
  const res = await apiFetch<{ data: Category; message: string }>('/api/categories', {
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
    description: string;
    parentId: number | null;
    active: boolean;
    image: string;
  }>,
) {
  const res = await apiFetch<{ data: Category }>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

export async function getCategory(id: number) {
  const res = await apiFetch<{ data: Category }>(`/api/categories/${id}`);
  return res.data;
}

export async function deleteCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/categories/${id}`, { method: 'DELETE' });
}

export async function restoreCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/categories/${id}/restore`, { method: 'PATCH' });
}

export async function hardDeleteCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/categories/${id}/permanent`, { method: 'DELETE' });
}

export async function moveCategories(payload: MovePayload) {
  const res = await apiFetch<{ data: { updated: Category[] } }>('/api/categories/move', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return res.data.updated;
}
