import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type AdminNotification,
} from '@/lib/api/admin/notifications';

export interface ActivityNotification {
  id: string;
  type: 'NEW_ORDER' | 'USER_SIGNUP' | 'LOW_STOCK' | 'SYSTEM_ALERT';
  title: string;
  message: string;
  href: string | null;
  createdAt: string;
  read: boolean;
}

function toActivityNotification(notification: AdminNotification): ActivityNotification {
  return {
    id: String(notification.id),
    type: notification.type,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    createdAt: notification.createdAt,
    read: notification.read,
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    listNotifications()
      .then((data) => setNotifications(data.map(toActivityNotification)))
      .catch(() => setNotifications([]));

    const eventSource = new EventSource('/api/admin/notifications/stream');

    eventSource.addEventListener('notification', (e) => {
      try {
        const eventData = JSON.parse(e.data);
        const newNotif: ActivityNotification = {
          id: eventData.id || `notif-${Date.now()}`,
          type: eventData.type || 'SYSTEM_ALERT',
          title: eventData.title,
          message: eventData.message,
          href: eventData.href || null,
          createdAt: eventData.createdAt || new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)].slice(0, 30));

        const href = newNotif.href;
        toast(newNotif.title, {
          description: newNotif.message,
          action: href
            ? {
                label: 'Chi tiết',
                onClick: () => {
                  window.location.href = href;
                },
              }
            : undefined,
        });
      } catch (err) {
        console.error(err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    void markAllNotificationsAsRead();
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    void markNotificationAsRead(id);
  };

  return {
    notifications,
    unreadCount,
    markAllAsRead,
    markAsRead,
  };
}
