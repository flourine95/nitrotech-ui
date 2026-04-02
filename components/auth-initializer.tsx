"use client"
import { useEffect, useRef } from "react"
import { getMe } from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth"

export function AuthInitializer() {
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true

    async function init() {
      const { accessToken } = useAuthStore.getState()

      if (accessToken) {
        // Token còn trong memory (SPA navigation) — chỉ cần fetch user
        try {
          await getMe()
        } catch {
          useAuthStore.getState().clear()
        }
        return
      }

      // Reload trang — gọi route handler để verify refreshToken cookie
      // và nhận lại accessToken + set isLoggedIn cookie với Path=/
      try {
        const res = await fetch("/api/session", { method: "POST" })
        if (!res.ok) return
        const { accessToken: newToken } = await res.json()
        useAuthStore.getState().setAccessToken(newToken)
        await getMe()
      } catch {
        useAuthStore.getState().clear()
      }
    }

    init()
  }, [])

  return null
}
