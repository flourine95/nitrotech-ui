"use client"
import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      offset={80} // tránh đè lên compare bar và scroll-to-top
      toastOptions={{
        style: {
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "1rem",
          color: "#0f172a",
          fontSize: "14px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
        },
        classNames: {
          success: "!border-green-200 !bg-green-50 !text-green-900",
          error: "!border-rose-200 !bg-rose-50 !text-rose-900",
          warning: "!border-amber-200 !bg-amber-50 !text-amber-900",
          info: "!border-blue-200 !bg-blue-50 !text-blue-900",
        },
      }}
    />
  )
}
