"use client"
import { useState } from "react"
import Link from "next/link"

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Tạo tài khoản</h1>
          <p className="text-slate-500 text-sm">Tham gia NitroTech để mua sắm dễ dàng hơn</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {["Thông tin", "Bảo mật"].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-2 flex-1 ${i < step - 1 ? "text-green-600" : i === step - 1 ? "text-slate-900" : "text-slate-300"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-200 ${i < step - 1 ? "bg-green-100 text-green-600" : i === step - 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {i < step - 1
                    ? <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    : i + 1
                  }
                </div>
                <span className="text-sm font-medium">{s}</span>
              </div>
              {i < 1 && <div className={`flex-1 h-px mx-3 ${step > 1 ? "bg-green-300" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* Social login — step 1 only */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-[#1877F2]" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">hoặc điền thông tin</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </>
        )}

        <form onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
                <input id="name" type="text" placeholder="Nguyễn Văn A" required className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input id="email" type="email" placeholder="email@example.com" required className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
                <input id="phone" type="tel" placeholder="0901 234 567" className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
              </div>
              <button type="button" onClick={() => setStep(2)} className="w-full py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
                Tiếp theo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Mật khẩu</label>
                <div className="relative">
                  <input id="password" type={showPass ? "text" : "password"} placeholder="Tối thiểu 8 ký tự" required className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 pr-12"/>
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer" aria-label={showPass ? "Ẩn" : "Hiện"}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {/* Password strength */}
                <div className="flex gap-1 mt-2">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full ${i <= 2 ? "bg-amber-400" : "bg-slate-200"}`} />
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-1">Mật khẩu trung bình</p>
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-1.5">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input id="confirm" type={showConfirm ? "text" : "password"} placeholder="Nhập lại mật khẩu" required className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 pr-12"/>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer" aria-label={showConfirm ? "Ẩn" : "Hiện"}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <input id="terms" type="checkbox" required className="w-4 h-4 mt-0.5 rounded accent-slate-900 cursor-pointer shrink-0"/>
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                  Tôi đồng ý với{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">Điều khoản sử dụng</Link>
                  {" "}và{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">Chính sách bảo mật</Link>
                </label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
                  Quay lại
                </button>
                <button type="submit" className="flex-1 py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
                  Tạo tài khoản
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Đã có tài khoản?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:text-blue-700 transition-colors duration-150 cursor-pointer">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
