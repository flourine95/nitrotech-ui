'use server';

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const ACCESS_TOKEN_COOKIE = 'access_token';
const EXPIRES_AT_COOKIE = 'access_token_expires_at';
const USER_COOKIE = 'auth_user';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw await res.json().catch(() => ({}));
  }

  const { data } = await res.json();
  const cookieStore = await cookies();
  const expiresAt = Date.now() + data.expiresIn * 1000;

  cookieStore.set(ACCESS_TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });
  cookieStore.set(EXPIRES_AT_COOKIE, String(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });
  cookieStore.set(USER_COOKIE, JSON.stringify(data.user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });

  return data;
}

export async function logout(redirectTo = '/login') {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'web',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  }).catch(() => {});

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(EXPIRES_AT_COOKIE);
  cookieStore.delete(USER_COOKIE);
  redirect(redirectTo);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const expiresAt = cookieStore.get(EXPIRES_AT_COOKIE)?.value;

  if (!token || !expiresAt) return null;

  // Còn hạn (buffer 30s)
  if (Date.now() < Number(expiresAt) - 30_000) return token;

  return refreshAccessToken();
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'X-Client-Type': 'web' },
  });

  if (!res.ok) return null;

  const { data } = await res.json();
  const cookieStore = await cookies();
  const expiresAt = Date.now() + data.expiresIn * 1000;

  cookieStore.set(ACCESS_TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });
  cookieStore.set(EXPIRES_AT_COOKIE, String(expiresAt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.expiresIn,
    path: '/',
  });

  return data.accessToken;
}

export async function getSession(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const userRaw = cookieStore.get(USER_COOKIE)?.value;
  if (!userRaw) return null;
  try {
    return JSON.parse(userRaw) as AuthUser;
  } catch {
    return null;
  }
}
