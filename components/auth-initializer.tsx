"use client"
import { useEffect, useRef } from "react"
import { getMe } from "@/lib/auth-api"
import { useAuthStore } from "@/store/auth"

export function AuthInitializer() {
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current) return
    ran.current = true
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
      getMe().catch(() => useAuthStore.getState().clear())
    }
  }, [])

  return null
}
