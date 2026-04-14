import { cookies } from 'next/headers';
import { backendFetch } from './server';
import type { User } from '@/lib/api/auth';

export type AuthUser = Pick<User, 'id' | 'name' | 'email' | 'phone' | 'avatar'>;

export async function getSession(): Promise<AuthUser | null> {
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
}
