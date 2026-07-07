export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors?: Record<string, string>;
  data?: unknown;
}

export class ApiException extends Error {
  constructor(public readonly error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
    Object.setPrototypeOf(this, ApiException.prototype);
  }
}

function isApiError(value: unknown): value is ApiError {
  if (!value || typeof value !== 'object') return false;

  const error = value as Partial<ApiError>;
  return (
    typeof error.status === 'number' &&
    typeof error.code === 'string' &&
    typeof error.message === 'string'
  );
}

function redirectToLogin(path: string) {
  if (typeof window === 'undefined' || !path.startsWith('/api/') || isPublicApiPath(path)) return;

  const from = `${window.location.pathname}${window.location.search}`;
  window.location.assign(`/login?from=${encodeURIComponent(from)}`);
}

async function readJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  return response.json().catch(() => null);
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers as Record<string, string>),
      },
    });
  } catch {
    throw new ApiException({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Không thể kết nối đến server. Vui lòng thử lại sau.',
    });
  }

  if (res.status === 401) {
    redirectToLogin(path);
    throw new ApiException({
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Vui lòng đăng nhập để tiếp tục.',
    });
  }

  if (!res.ok) {
    const raw = await readJson(res);
    const err: ApiError = isApiError(raw) ? raw : {
      status: res.status,
      code: 'UNKNOWN_ERROR',
      message: 'Có lỗi xảy ra',
    };
    throw new ApiException(err);
  }

  if (res.status === 204) return undefined as T;

  return readJson(res) as Promise<T>;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResult<T, F = unknown> {
  data: T;
  meta?: PageMeta;
  facets?: F;
}
import { isPublicApiPath } from '@/lib/auth/routes';
