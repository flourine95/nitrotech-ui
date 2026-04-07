'use client';

import { useEffect, useRef } from 'react';

const CHANNEL_NAME = 'auth-refresh';

export function AuthRefresh({ expiresAt }: { expiresAt: number }) {
  const expiresAtRef = useRef(expiresAt);

  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout>;
    let countdownInterval: ReturnType<typeof setInterval>;
    const channel = new BroadcastChannel(CHANNEL_NAME);

    // Lắng nghe tab khác refresh thành công → cập nhật expiresAt và reschedule
    channel.onmessage = (e) => {
      if (e.data?.type === 'refreshed' && e.data.expiresAt) {
        clearTimeout(refreshTimer);
        expiresAtRef.current = e.data.expiresAt;
        console.log('[AuthRefresh] tab khác đã refresh, expiresAt mới:', new Date(e.data.expiresAt).toLocaleTimeString());
        scheduleRefresh();
      }
    };

    function startCountdown() {
      clearInterval(countdownInterval);
      countdownInterval = setInterval(() => {
        const secs = Math.round((expiresAtRef.current - Date.now()) / 1000);
        console.log(`[AuthRefresh] token còn ${secs}s`);
        if (secs <= 0) clearInterval(countdownInterval);
      }, 5_000);
    }

    function scheduleRefresh() {
      clearTimeout(refreshTimer);
      // Jitter 0-3s để tránh 2 tab fire cùng lúc
      const jitter = Math.random() * 3_000;
      const delay = Math.max(5_000, expiresAtRef.current - Date.now() - 10_000) + jitter;
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
          // Có thể tab khác vừa refresh xong → đợi 500ms rồi thử lại
          await new Promise(r => setTimeout(r, 500));
          const retry = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
          if (!retry.ok) {
            console.log('[AuthRefresh] thất bại → redirect login');
            window.location.href = '/login';
            return;
          }
          const retryData = await retry.json().catch(() => null);
          expiresAtRef.current = retryData?.expiresAt ?? Date.now() + 900_000;
          channel.postMessage({ type: 'refreshed', expiresAt: expiresAtRef.current });
          scheduleRefresh();
          return;
        }

        const data = await res.json().catch(() => null);
        expiresAtRef.current = data?.expiresAt ?? Date.now() + 900_000;
        console.log('[AuthRefresh] thành công, hết hạn lúc:', new Date(expiresAtRef.current).toLocaleTimeString());

        // Thông báo cho tất cả tab khác
        channel.postMessage({ type: 'refreshed', expiresAt: expiresAtRef.current });
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
      channel.close();
    };
  }, []);

  return null;
}
