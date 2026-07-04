import { apiFetch, type ApiResult, type PageMeta } from '@/lib/api/client';

export type AdminUserActivity = 'new' | 'with_orders' | 'no_orders' | 'at_risk';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  provider: string;
  roleSlugs: string[];
  customerState: AdminUserActivity;
  orderCount: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserFacets {
  total: number;
  active: number;
  inactive: number;
  newUsers: number;
  withOrders: number;
  noOrders: number;
  atRisk: number;
  totalSpent: number;
}

export interface AdminUsersParams {
  search?: string;
  status?: string;
  provider?: string;
  role?: string;
  activity?: AdminUserActivity;
  page?: number;
  size?: number;
  sort?: Array<{ field: string; dir: 'asc' | 'desc' }> | string;
  deleted?: boolean;
}

export interface AdminUsersPage {
  data: AdminUser[];
  meta: PageMeta;
}

export interface AdminUserInput {
  name: string;
  email: string;
  phone?: string;
  status?: string;
  roleSlugs?: string[];
}

export interface UserImportResult {
  created: number;
  failed: number;
  failedRows: number[];
  failedReasons: Record<number, string>;
}

function appendDefined(searchParams: URLSearchParams, key: string, value: string | number | undefined) {
  if (value !== undefined && value !== '') {
    searchParams.set(key, String(value));
  }
}

export async function getAdminUsers(params: AdminUsersParams): Promise<AdminUsersPage> {
  const searchParams = new URLSearchParams();
  appendDefined(searchParams, 'search', params.search);
  appendDefined(searchParams, 'status', params.status);
  appendDefined(searchParams, 'provider', params.provider);
  appendDefined(searchParams, 'role', params.role);
  appendDefined(searchParams, 'activity', params.activity);
  appendDefined(searchParams, 'page', params.page);
  appendDefined(searchParams, 'size', params.size);
  appendDefined(searchParams, 'deleted', params.deleted ? 'true' : undefined);

  if (params.sort) {
    if (Array.isArray(params.sort)) {
      params.sort.forEach((s) => searchParams.append('sort', `${s.field},${s.dir}`));
    } else {
      searchParams.append('sort', params.sort);
    }
  }

  const res = await apiFetch<ApiResult<AdminUser[]>>(`/api/admin/users?${searchParams}`);
  return {
    data: res.data,
    meta: res.meta ?? {
      page: params.page ?? 0,
      size: params.size ?? 20,
      totalElements: res.data.length,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    },
  };
}

export async function getAdminUserFacets(params: Omit<AdminUsersParams, 'page' | 'size' | 'sort'>) {
  const searchParams = new URLSearchParams();
  appendDefined(searchParams, 'search', params.search);
  appendDefined(searchParams, 'status', params.status);
  appendDefined(searchParams, 'provider', params.provider);
  appendDefined(searchParams, 'role', params.role);
  appendDefined(searchParams, 'activity', params.activity);
  appendDefined(searchParams, 'deleted', params.deleted ? 'true' : undefined);

  const query = searchParams.toString();
  const res = await apiFetch<ApiResult<AdminUserFacets>>(`/api/admin/users/facets${query ? `?${query}` : ''}`);
  return res.data;
}

export async function bulkUpdateAdminUsersStatus(ids: number[], status: string): Promise<void> {
  await apiFetch(`/api/admin/users/bulk/status`, {
    method: 'PUT',
    body: JSON.stringify({ ids, status }),
  });
}

export async function bulkDeleteAdminUsers(ids: number[]): Promise<void> {
  await apiFetch(`/api/admin/users/bulk`, {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export async function bulkRestoreAdminUsers(ids: number[]): Promise<void> {
  await apiFetch(`/api/admin/users/bulk/restore`, {
    method: 'PATCH',
    body: JSON.stringify({ ids }),
  });
}

export async function createAdminUser(input: AdminUserInput): Promise<AdminUser> {
  const res = await apiFetch<ApiResult<AdminUser>>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function updateAdminUser(id: number, input: Omit<AdminUserInput, 'roleSlugs'>): Promise<AdminUser> {
  const res = await apiFetch<ApiResult<AdminUser>>(`/api/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return res.data;
}

export async function resetAdminUserPassword(id: number): Promise<void> {
  await apiFetch(`/api/admin/users/${id}/reset-password`, { method: 'POST' });
}

export async function importAdminUsers(file: File): Promise<UserImportResult> {
  const formData = new FormData();
  formData.set('file', file);
  const res = await apiFetch<ApiResult<UserImportResult>>('/api/admin/users/import', {
    method: 'POST',
    body: formData,
  });
  return res.data;
}
