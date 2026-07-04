import { apiFetch } from '@/lib/api/client';

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

interface ApiResult<T> {
  data: T;
  meta?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface AdminUsersParams {
  search?: string;
  status?: string;
  provider?: string;
  role?: string;
  activity?: AdminUserActivity;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AdminUsersPage {
  data: AdminUser[];
  meta: NonNullable<ApiResult<unknown>['meta']>;
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
  appendDefined(searchParams, 'sort', params.sort);

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

  const query = searchParams.toString();
  const res = await apiFetch<ApiResult<AdminUserFacets>>(`/api/admin/users/facets${query ? `?${query}` : ''}`);
  return res.data;
}
