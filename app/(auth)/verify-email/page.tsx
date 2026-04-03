"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { verifyEmail, resendVerification } from "@/lib/auth-api"
import { ApiException } from "@/lib/api"

type Status = "loading" | "success" | "error"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<Status>("loading")
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [resendError, setResendError] = useState("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token không hợp lệ hoặc đã hết hạn.")
      return
    }
    verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((e) => {
        setStatus("error")
        setMessage(
          e instanceof ApiException
            ? e.error.message
            : "Xác thực thất bại. Token có thể đã hết hạn."
        )
      })
  }, [token])

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setResending(true)
    setResendError("")
    try {
      await resendVerification(email)
      setResent(true)
    } catch (e) {
      setResendError(
        e instanceof ApiException
          ? e.error.message
          : "Gửi lại thất bại, vui lòng thử lại."
      )
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 animate-spin text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeOpacity=".3"
                />
                <path d="M21 12a9 9 0 00-9-9" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Đang xác thực...
            </h2>
            <p className="text-sm text-slate-500">
              Vui lòng chờ trong giây lát.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Xác thực thành công!
            </h2>
            <p className="mb-6 text-sm text-slate-500">
              Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây
              giờ.
            </p>
            <Link
              href="/login"
              className="inline-block cursor-pointer rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
            >
              Đăng nhập
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-rose-600"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Xác thực thất bại
            </h2>
            <p className="mb-6 text-sm text-slate-500">{message}</p>

            {resent ? (
              <div className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">
                Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.
              </div>
            ) : (
              <form onSubmit={handleResend} className="text-left">
                <p className="mb-3 text-center text-sm font-medium text-slate-700">
                  Gửi lại email xác thực
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email đã đăng ký"
                  required
                  className="mb-3 w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                {resendError && (
                  <p className="mb-2 text-xs text-rose-500">{resendError}</p>
                )}
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full cursor-pointer rounded-full bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 disabled:opacity-60"
                >
                  {resending ? "Đang gửi..." : "Gửi lại"}
                </button>
              </form>
            )}

            <Link
              href="/login"
              className="mt-4 block text-sm text-slate-400 transition-colors duration-150 hover:text-slate-700"
            >
              Về trang đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
