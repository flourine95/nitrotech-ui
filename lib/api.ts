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

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * apiFetch — gọi Next.js BFF (/api/...) cho private endpoints.
 * BFF tự gắn Authorization header từ session trước khi forward lên Spring.
 * Public endpoints dùng skipAuth: true để gọi Spring trực tiếp.
 */
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...init } = options;

  const url = skipAuth ? `${BASE_URL}${path}` : path; // BFF hoặc Spring trực tiếp

  const res = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Type': 'web',
      ...(init.headers as Record<string, string>),
    },
  });

  if (res.status === 401 && !skipAuth) {
    // Thử refresh, nếu fail đợi 1s rồi thử lại (tab khác có thể đang refresh)
    const tryRefresh = async (): Promise<boolean> => {
      const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' });
      return r.ok;
    };

    let ok = await tryRefresh();
    if (!ok) {
      await new Promise(r => setTimeout(r, 1000));
      ok = await tryRefresh();
    }

    if (ok) {
      window.location.reload();
    } else {
      window.location.href = '/login';
    }
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
