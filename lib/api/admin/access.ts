import { apiFetch } from '@/lib/api/client';

export interface PermissionData {
  id: number;
  name: string;
  slug: string;
  groupName: string;
  description?: string | null;
  systemPermission: boolean;
}

export interface RoleData {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  active: boolean;
  systemRole: boolean;
  permissionSlugs: string[];
}

export interface UserAccessData {
  id: number;
  name: string;
  email: string;
  status: string;
  roleSlugs: string[];
  permissionSlugs: string[];
}

type ApiResult<T> = {
  data: T;
};

export async function getPermissions() {
  const res = await apiFetch<ApiResult<PermissionData[]>>('/api/admin/access/permissions');
  return res.data;
}

export async function getRoles() {
  const res = await apiFetch<ApiResult<RoleData[]>>('/api/admin/access/roles');
  return res.data;
}

export async function updateRolePermissions(roleId: number, permissionSlugs: string[]) {
  const res = await apiFetch<ApiResult<RoleData>>(`/api/admin/access/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissionSlugs }),
  });
  return res.data;
}

export async function getAccessUsers() {
  const res = await apiFetch<ApiResult<UserAccessData[]>>('/api/admin/access/users');
  return res.data;
}

export async function updateUserRoles(userId: number, roleSlugs: string[]) {
  const res = await apiFetch<ApiResult<UserAccessData>>(`/api/admin/access/users/${userId}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ roleSlugs }),
  });
  return res.data;
}
