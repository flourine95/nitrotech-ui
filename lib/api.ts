import { useAuthStore } from "@/store/auth"

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

export interface ApiError {
  status: number
  code: string
  message: string
  errors?: Record<string, string>
}

export class ApiException extends Error {
  constructor(public readonly error: ApiError) {
    super(error.message)
    this.name = "ApiException"
  }
}

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return useAuthStore.getState().accessToken
}


let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

async function refreshAccessToken(): Promise<string> {
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Client-Type": "web" },
    credentials: "include",
  })

  if (!res.ok) {

    useAuthStore.getState().clear()
    throw new ApiException({ status: 401, code: "UNAUTHORIZED", message: "Phiên đăng nhập hết hạn" })
  }

  const json = await res.json()
  const newToken: string = json.data.accessToken


  useAuthStore.getState().setAccessToken(newToken)

  return newToken
}


interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, ...init } = options

  const buildHeaders = (token?: string | null): Record<string, string> => ({
    "Content-Type": "application/json",
    "X-Client-Type": "web",
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })

  let res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: buildHeaders(skipAuth ? null : getAccessToken()),
    credentials: "include", // gửi cookie cho refresh/logout
  })

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    if (isRefreshing) {
      const newToken = await new Promise<string | null>((resolve) => {
        refreshQueue.push(resolve)
      })
      if (!newToken) throw new ApiException({ status: 401, code: "UNAUTHORIZED", message: "Phiên đăng nhập hết hạn" })
      res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(newToken),
        credentials: "include",
      })
    } else {
      isRefreshing = true
      let newToken: string | null = null
      try {
        newToken = await refreshAccessToken()
        refreshQueue.forEach((cb) => cb(newToken))
      } catch (e) {
        refreshQueue.forEach((cb) => cb(null))
        throw e
      } finally {
        refreshQueue = []
        isRefreshing = false
      }
      res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: buildHeaders(newToken),
        credentials: "include",
      })
    }
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: res.status,
      code: "UNKNOWN_ERROR",
      message: "Có lỗi xảy ra",
    }))
    throw new ApiException(err)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
