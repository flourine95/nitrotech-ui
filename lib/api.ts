/**
 * API client với auto token refresh.
 * - Access token: Zustand memory only
 * - Refresh token: httpOnly cookie, chỉ được xử lý bởi Next.js Route Handlers
 */

export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Token helpers (chỉ access token, từ Zustand) ──────────────────────────────

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  // Import động để tránh circular dependency
  const { useAuthStore } = require("@/store/auth")
  return useAuthStore.getState().accessToken
}

// ── Refresh logic (gọi Next.js route handler — cookie được gửi tự động) ───────

let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

async function refreshAccessToken(): Promise<string> {
  // Gọi route handler nội bộ — cookie httpOnly được gửi tự động bởi browser
  const res = await fetch("/api/auth/refresh", { method: "POST" })

  if (!res.ok) {
    const { useAuthStore } = require("@/store/auth")
    useAuthStore.getState().clear()
    throw new ApiException({ status: 401, code: "UNAUTHORIZED", message: "Phiên đăng nhập hết hạn" })
  }

  const json = await res.json()
  const newAccessToken: string = json.data.accessToken

  const { useAuthStore } = require("@/store/auth")
  useAuthStore.getState().setAccessToken(newAccessToken)

  return newAccessToken
}

// ── Core fetch ────────────────────────────────────────────────────────────────

interface FetchOptions extends RequestInit {
  /** Bỏ qua Authorization header (dùng cho login, register...) */
  skipAuth?: boolean
  /** Gọi thẳng backend, bỏ qua BASE_URL prefix của Next.js */
  external?: boolean
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { skipAuth = false, external = true, ...init } = options

  const url = external ? `${BASE_URL}${path}` : path

  const buildHeaders = (token?: string | null): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })

  let res = await fetch(url, {
    ...init,
    headers: buildHeaders(skipAuth ? null : getAccessToken()),
  })

  // Auto-refresh on 401
  if (res.status === 401 && !skipAuth) {
    if (isRefreshing) {
      const newToken = await new Promise<string | null>((resolve) => {
        refreshQueue.push(resolve)
      })
      if (!newToken) throw new ApiException({ status: 401, code: "UNAUTHORIZED", message: "Phiên đăng nhập hết hạn" })
      res = await fetch(url, { ...init, headers: buildHeaders(newToken) })
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
      res = await fetch(url, { ...init, headers: buildHeaders(newToken) })
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
