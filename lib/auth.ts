import { cookies } from 'next/headers';
import { backendFetch } from './server';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await backendFetch('/api/auth/me', { cookieHeader });
  if (!res.ok) return null;

  const { data } = await res.json();
  return data ?? null;
}
