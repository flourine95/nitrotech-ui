"use client"
import { useState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold text-slate-900">
            Tạo tài khoản
          </h1>
          <p className="text-sm text-slate-500">
            Tham gia NitroTech để mua sắm dễ dàng hơn
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {["Thông tin", "Bảo mật"].map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div
                className={`flex flex-1 items-center gap-2 ${i < step - 1 ? "text-green-600" : i === step - 1 ? "text-slate-900" : "text-slate-300"}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${i < step - 1 ? "bg-green-100 text-green-600" : i === step - 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}
                >
                  {i < step - 1 ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 fill-current"
                      aria-hidden="true"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-medium">{s}</span>
              </div>
              {i < 1 && (
                <div
                  className={`mx-3 h-px flex-1 ${step > 1 ? "bg-green-300" : "bg-slate-200"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Social login — step 1 only */}
        {step === 1 && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-3">
              <button className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>
              <button className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current text-[#1877F2]"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </button>
            </div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">
                hoặc điền thông tin
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
          </>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Họ và tên
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
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
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Số điện thoại
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="0901 234 567"
                  className="w-full rounded-full border border-slate-200 px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
              >
                Tiếp theo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Tối thiểu 8 ký tự"
                    required
                    className="w-full rounded-full border border-slate-200 px-4 py-3 pr-12 text-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
                    aria-label={showPass ? "Ẩn" : "Hiện"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                {/* Password strength */}
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i <= 2 ? "bg-amber-400" : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-amber-600">
                  Mật khẩu trung bình
                </p>
              </div>
              <div>
                <label
                  htmlFor="confirm"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    required
                    className="w-full rounded-full border border-slate-200 px-4 py-3 pr-12 text-sm placeholder-slate-400 transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
                    aria-label={showConfirm ? "Ẩn" : "Hiện"}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-slate-900"
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-sm leading-relaxed text-slate-600"
                >
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </Link>{" "}
                  và{" "}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 cursor-pointer rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
                >
                  Tạo tài khoản
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            className="cursor-pointer font-medium text-blue-600 transition-colors duration-150 hover:text-blue-700"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
