"use client"
import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
        {!sent ? (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Quên mật khẩu?</h1>
              <p className="text-slate-500 text-sm">Nhập email để nhận link đặt lại mật khẩu</p>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true) }}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-3 rounded-full border border-slate-200 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                />
              </div>
              <button type="submit" className="w-full py-3 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
                Gửi link đặt lại
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-green-600 fill-current" aria-hidden="true">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Đã gửi email!</h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Kiểm tra hộp thư của bạn và nhấn vào link để đặt lại mật khẩu. Link có hiệu lực trong 30 phút.
            </p>
            <button onClick={() => setSent(false)} className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer transition-colors duration-150">
              Gửi lại email
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150 cursor-pointer flex items-center justify-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  )
}
