import { apiFetch } from '@/lib/client';

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

// GET /api/categories - Lấy tree hoặc deleted list
export async function getCategories(
  params?: CategoriesQuery,
): Promise<CategoriesResponse | Category[]> {
  const q = new URLSearchParams();
  if (params?.deleted !== undefined) q.set('deleted', String(params.deleted));
  const qs = q.toString() ? `?${q}` : '';
  
  if (params?.deleted) {
    // Deleted list - chỉ trả về array
    const res = await apiFetch<{ data: Category[] }>(`/api/categories${qs}`);
    return res.data;
  } else {
    // Tree + facets
    const res = await apiFetch<CategoriesResponse>(`/api/categories${qs}`);
    return res;
  }
}

// GET /api/categories/:id - Lấy chi tiết 1 category
export async function getCategory(id: number) {
  const res = await apiFetch<{ data: Category }>(`/api/categories/${id}`);
  return res.data;
}

// POST /api/categories - Tạo category mới
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

// PUT /api/categories/:id - Cập nhật category
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
  const res = await apiFetch<{ data: Category; message: string }>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
  return res.data;
}

// PATCH /api/categories/:id/toggle - Toggle active
export async function toggleCategory(id: number) {
  const res = await apiFetch<{ data: { id: number; active: boolean }; message: string }>(
    `/api/categories/${id}/toggle`,
    { method: 'PATCH' }
  );
  return res.data;
}

// PATCH /api/categories/:id/move-up - Di chuyển lên
export async function moveCategoryUp(id: number) {
  const res = await apiFetch<{ data: { updated: Array<{ id: number; sortOrder: number }> }; message: string }>(
    `/api/categories/${id}/move-up`,
    { method: 'PATCH' }
  );
  return res.data;
}

// PATCH /api/categories/:id/move-down - Di chuyển xuống
export async function moveCategoryDown(id: number) {
  const res = await apiFetch<{ data: { updated: Array<{ id: number; sortOrder: number }> }; message: string }>(
    `/api/categories/${id}/move-down`,
    { method: 'PATCH' }
  );
  return res.data;
}

// PATCH /api/categories/:id/change-parent - Đổi parent
export async function changeCategoryParent(id: number, newParentId: number | null) {
  const res = await apiFetch<{ data: Category; message: string }>(
    `/api/categories/${id}/change-parent`,
    {
      method: 'PATCH',
      body: JSON.stringify({ newParentId }),
    }
  );
  return res.data;
}

// DELETE /api/categories/:id - Soft delete
export async function deleteCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/categories/${id}`, { method: 'DELETE' });
}

// PATCH /api/categories/:id/restore - Khôi phục
export async function restoreCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/categories/${id}/restore`, { method: 'PATCH' });
}

// DELETE /api/categories/:id/permanent - Xóa vĩnh viễn
export async function hardDeleteCategory(id: number) {
  return apiFetch<{ message: string }>(`/api/categories/${id}/permanent`, { method: 'DELETE' });
}

// PATCH /api/categories/bulk/activate - Bulk activate
export async function bulkActivateCategories(ids: number[]) {
  const res = await apiFetch<{
    data: {
      succeeded: number;
      failed: number;
      failedIds: number[];
      failedReasons: Record<string, string>;
    };
  }>('/api/categories/bulk/activate', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
  return res.data;
}

// PATCH /api/categories/bulk/deactivate - Bulk deactivate
export async function bulkDeactivateCategories(ids: number[]) {
  const res = await apiFetch<{
    data: {
      succeeded: number;
      failed: number;
      failedIds: number[];
      failedReasons: Record<string, string>;
    };
  }>('/api/categories/bulk/deactivate', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
  return res.data;
}

// DELETE /api/categories/bulk - Bulk soft delete
export async function bulkDeleteCategories(ids: number[]) {
  const res = await apiFetch<{
    data: {
      succeeded: number;
      failed: number;
      failedIds: number[];
      failedReasons: Record<string, string>;
    };
  }>('/api/categories/bulk', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
  return res.data;
}

// PATCH /api/categories/bulk/restore - Bulk restore
export async function bulkRestoreCategories(ids: number[]) {
  const res = await apiFetch<{
    data: {
      succeeded: number;
      failed: number;
      failedIds: number[];
      failedReasons: Record<string, string>;
    };
  }>('/api/categories/bulk/restore', {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
  return res.data;
}

// DELETE /api/categories/bulk/permanent - Bulk hard delete
export async function bulkHardDeleteCategories(ids: number[]) {
  const res = await apiFetch<{
    data: {
      succeeded: number;
      failed: number;
      failedIds: number[];
      failedReasons: Record<string, string>;
    };
  }>('/api/categories/bulk/permanent', {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
  return res.data;
}
