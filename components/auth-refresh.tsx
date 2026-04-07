'use client';

import { useEffect, useRef } from 'react';

export function AuthRefresh({ expiresAt }: { expiresAt: number }) {
  const expiresAtRef = useRef(expiresAt);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;

    function startCountdown() {
      clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        const secs = Math.round((expiresAtRef.current - Date.now()) / 1000);
        console.log(`[AuthRefresh] token còn ${secs}s`);
        if (secs <= 0) clearInterval(countdownInterval);
      }, 5_000);
    }

    function scheduleRefresh() {
      const delay = Math.max(5_000, expiresAtRef.current - Date.now() - 10_000);
      console.log(`[AuthRefresh] refresh sau ${Math.round(delay / 1000)}s`);
      startCountdown();
      refreshTimer = setTimeout(doRefresh, delay);
    }

    async function doRefresh() {
      clearInterval(countdownInterval);
      try {
        console.log('[AuthRefresh] đang refresh...');
        const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
        if (!res.ok) {
          console.log('[AuthRefresh] thất bại → redirect login');
          window.location.href = '/login';
          return;
        }
        const data = await res.json().catch(() => null);
        expiresAtRef.current = data?.expiresAt ?? Date.now() + 900_000;
        console.log('[AuthRefresh] thành công, hết hạn lúc:', new Date(expiresAtRef.current).toLocaleTimeString());
        scheduleRefresh();
      } catch {
        console.log('[AuthRefresh] lỗi mạng, retry sau 30s');
        refreshTimer = setTimeout(doRefresh, 30_000);
      }
    }

    scheduleRefresh();
    return () => {
      clearTimeout(refreshTimer);
      clearInterval(countdownInterval);
    };
  }, []);

  return null;
}
