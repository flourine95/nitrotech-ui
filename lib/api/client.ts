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

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
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
    throw new ApiException({
      status: 401,
      code: 'AUTH_REQUIRED',
      message: 'Vui lòng đăng nhập để tiếp tục.',
    });
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
