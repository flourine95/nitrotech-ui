import { apiFetch } from '@/lib/api/client';

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
  childrenCount: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  data: Category[];
}

export async function getCategories(): Promise<CategoriesResponse> {
  return apiFetch<CategoriesResponse>('/api/categories');
}

export async function getCategory(id: number) {
  const res = await apiFetch<{ data: Category }>(`/api/categories/${id}`);
  return res.data;
}
