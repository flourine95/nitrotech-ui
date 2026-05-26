import { cookies } from 'next/headers';
import { cache } from 'react';
import type { User } from '@/lib/api/auth';
import { backendFetch } from '../api/server';

export type AuthUser = Pick<User, 'id' | 'name' | 'email' | 'phone' | 'avatar'>;

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
