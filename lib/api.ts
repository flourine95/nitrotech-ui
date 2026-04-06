export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: Record<string, string>;
}

export class ApiException extends Error {
  constructor(public readonly error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
  }
}

async function getClientToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  const { useAuthStore } = await import('@/store/auth');
  return useAuthStore.getState().accessToken;
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  _retry?: boolean;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, _retry = false, ...init } = options;

  const token = skipAuth ? null : await getClientToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Client-Type': 'web',
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });

  // Token expired → redirect về login
  if (res.status === 401 && !skipAuth && !_retry) {
    const { useAuthStore } = await import('@/store/auth');
    useAuthStore.getState().clear();
    window.location.href = '/login';
    return undefined as T;
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: res.status,
      code: 'UNKNOWN_ERROR',
      message: 'Có lỗi xảy ra',
    }));
    throw new ApiException(err);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
