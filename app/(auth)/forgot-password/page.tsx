"use client"
import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {!sent ? (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h1 className="mb-1 text-2xl font-bold text-slate-900">
                Quên mật khẩu?
              </h1>
              <p className="text-sm text-slate-500">
                Nhập email để nhận link đặt lại mật khẩu
              </p>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
              >
                Gửi link đặt lại
              </button>
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 fill-current text-green-600"
                aria-hidden="true"
              >
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Đã gửi email!
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              Kiểm tra hộp thư của bạn và nhấn vào link để đặt lại mật khẩu.
              Link có hiệu lực trong 30 phút.
            </p>
            <button
              onClick={() => setSent(false)}
              className="cursor-pointer text-sm text-blue-600 transition-colors duration-150 hover:text-blue-700"
            >
              Gửi lại email
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="flex cursor-pointer items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors duration-150 hover:text-slate-900"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
