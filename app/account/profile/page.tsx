"use client"
import type { Metadata } from "next"

export default function ProfilePage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h1>

      {/* Avatar */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold" aria-hidden="true">
              NV
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors duration-200 cursor-pointer" aria-label="Đổi ảnh đại diện">
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
          <div>
            <div className="font-bold text-slate-900">Nguyễn Văn A</div>
            <div className="text-sm text-slate-400">Thành viên từ tháng 1/2024</div>
            <div className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              Thành viên Bạc
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">
        <h2 className="font-bold text-slate-900 mb-5">Thông tin cơ bản</h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên</label>
              <input id="name" type="text" defaultValue="Nguyễn Văn A" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
            </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
            <div className="relative">
              <input id="email" type="email" defaultValue="email@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 pr-24"/>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">Đã xác thực</span>
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
            <input id="phone" type="tel" defaultValue="0901 234 567" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
          </div>
          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1.5">Ngày sinh</label>
            <input id="dob" type="date" defaultValue="1995-06-15" className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200"/>
          </div>
          <div>
            <p className="block text-sm font-medium text-slate-700 mb-2">Giới tính</p>
            <div className="flex gap-4">
              {["Nam", "Nữ", "Khác"].map((g, i) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" defaultChecked={i === 0} className="accent-slate-900"/>
                  <span className="text-sm text-slate-700">{g}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className="px-6 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
