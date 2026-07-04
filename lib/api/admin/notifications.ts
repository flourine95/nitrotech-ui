import { apiFetch } from '@/lib/api/client';

export interface AdminNotification {
  id: number;
  type: 'NEW_ORDER' | 'USER_SIGNUP' | 'LOW_STOCK' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  href: string | null;
  createdAt: string;
  read: boolean;
}

export async function listNotifications(size = 30) {
  const res = await apiFetch<{ data: AdminNotification[] }>(`/api/admin/notifications?size=${size}`);
  return res.data;
}

export function markNotificationAsRead(id: string | number) {
  return apiFetch<{ message: string }>(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsAsRead() {
  return apiFetch<{ message: string }>('/api/admin/notifications/read-all', { method: 'PATCH' });
}
