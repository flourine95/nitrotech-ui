import { create } from "zustand"
import type { User } from "@/lib/auth-api"

/**
 * Access token và user chỉ lưu trong memory.
 * Refresh token được lưu trong httpOnly cookie (xử lý bởi Route Handlers).
 * Khi reload trang, gọi /api/auth/me để restore user nếu cookie còn hợp lệ.
 */
interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, accessToken: string) => void
  setUser: (user: User) => void
  setAccessToken: (token: string) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clear: () => set({ user: null, accessToken: null }),
}))
