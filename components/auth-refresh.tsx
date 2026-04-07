'use client';

import { useEffect } from 'react';

/**
 * Tự động refresh token trước khi hết hạn.
 * Mount một lần trong layout, chạy ngầm không ảnh hưởng UI.
 */
export function AuthRefresh({ expiresAt }: { expiresAt: number }) {
  useEffect(() => {
    // Refresh trước khi hết hạn 60s
    const delay = expiresAt - Date.now() - 60_000;
    if (delay <= 0) {
      // Đã hết hạn hoặc sắp hết → refresh ngay
      refresh();
      return;
    }

    const timer = setTimeout(refresh, delay);
    return () => clearTimeout(timer);
  }, [expiresAt]);

  return null;
}

async function refresh() {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
    if (!res.ok) {
      window.location.href = '/login';
    }
  } catch {
    // network error, ignore — sẽ retry lần sau
  }
}
