'use client';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useAuthStore } from '@/store/auth';

export function SessionBridge() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated') {
      // RefreshToken hết hạn → signOut sạch
      if ((session as { error?: string }).error === 'RefreshTokenExpired') {
        useAuthStore.getState().clear();
        signOut({ callbackUrl: '/login' });
        return;
      }
      if (session?.accessToken) {
        useAuthStore.getState().setAccessToken(session.accessToken);
      }
    } else if (status === 'unauthenticated') {
      useAuthStore.getState().clear();
    }
  }, [session?.accessToken, (session as { error?: string } | null)?.error, status]);

  return null;
}
