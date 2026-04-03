import { apiFetch } from './api';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  parentName: string | null;
  active: boolean;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export async function getCategories(params?: {
  active?: boolean;
  tree?: boolean;
  parentId?: number;
}) {
  const q = new URLSearchParams();
  if (params?.active !== undefined) q.set('active', String(params.active));
  if (params?.tree) q.set('tree', 'true');
  if (params?.parentId !== undefined) q.set('parentId', String(params.parentId));
  const qs = q.toString() ? `?${q}` : '';
  const res = await apiFetch<{ data: Category[] }>(`/api/categories${qs}`);
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

export async function deleteCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/categories/${id}`, {
    method: 'DELETE',
  });
}
