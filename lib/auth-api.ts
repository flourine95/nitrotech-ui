import { apiFetch } from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  status: string;
  provider: string;
}

export async function getMe() {
  const res = await apiFetch<{ data: User }>('/api/auth/me');
  return res.data;
}

export async function updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
  const res = await apiFetch<{ data: User }>('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  return apiFetch<{ message: string }>('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function forgotPassword(email: string) {
  return apiFetch<{ message: string }>('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function resetPassword(token: string, newPassword: string) {
  return apiFetch<{ message: string }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
    skipAuth: true,
  });
}

export async function verifyEmail(token: string) {
  return apiFetch<{ message: string }>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
    skipAuth: true,
  });
}

export async function resendVerification(email: string) {
  return apiFetch<{ message: string }>('/api/auth/resend-verification', {
    method: 'POST',
    body: JSON.stringify({ email }),
    skipAuth: true,
  });
}

export async function register(name: string, email: string, password: string) {
  return apiFetch<{ data: { user: Pick<User, 'id' | 'name' | 'email'> }; message: string }>(
    '/api/auth/register',
    { method: 'POST', body: JSON.stringify({ name, email, password }), skipAuth: true },
  );
}
