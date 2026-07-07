import { cookies } from 'next/headers';
import { cache } from 'react';
import type { User } from '@/lib/api/auth';
import { backendFetch } from '../api/server';

export type AuthUser = Pick<
  User,
  'id' | 'name' | 'email' | 'phone' | 'avatar' | 'roles' | 'permissions'
>;

const DASHBOARD_ROLES = new Set(['admin', 'super_admin']);
const DASHBOARD_READ_PERMISSIONS = new Set([
  'AUDIT_LOG_READ',
  'NOTIFICATION_READ',
  'ORDER_READ_ALL',
  'ROLE_READ',
  'SHIPMENT_READ',
  'USER_READ',
]);

export function canAccessDashboard(user: AuthUser): boolean {
  return (
    user.roles.some((role) => DASHBOARD_ROLES.has(role))
    || user.permissions.some(
      (permission) =>
        DASHBOARD_READ_PERMISSIONS.has(permission)
        || permission.endsWith('_CREATE')
        || permission.endsWith('_UPDATE')
        || permission.endsWith('_DELETE')
        || permission.endsWith('_MANAGE'),
    )
  );
}

export const getSession = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  try {
    const res = await backendFetch('/api/auth/me', { cookieHeader });
    if (!res.ok) return null;

    const { data } = await res.json();
    return data ?? null;
  } catch {
    return null;
  }
});
