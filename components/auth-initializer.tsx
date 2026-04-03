"use client"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useAuthStore } from "@/store/auth"

/**
 * Sync NextAuth session → useAuthStore mỗi khi session thay đổi.
 * Dùng useSession() để reactive — tự update khi token refresh.
 */
export function AuthInitializer() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "loading") return

    if (status === "authenticated" && session?.accessToken) {
      useAuthStore.getState().setAccessToken(session.accessToken)
    } else if (status === "unauthenticated") {
      useAuthStore.getState().clear()
    }
  }, [session?.accessToken, status])

  return null
}
