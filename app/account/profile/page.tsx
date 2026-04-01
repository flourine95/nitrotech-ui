"use client"

export default function ProfilePage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Thông tin cá nhân</h1>

      {/* Avatar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white"
              aria-hidden="true"
            >
              NV
            </div>
            <button
              className="absolute -right-1 -bottom-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-white transition-colors duration-200 hover:bg-slate-700"
              aria-label="Đổi ảnh đại diện"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>
          <div>
            <div className="font-bold text-slate-900">Nguyễn Văn A</div>
            <div className="text-sm text-slate-400">
              Thành viên từ tháng 1/2024
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3 fill-current"
                aria-hidden="true"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              Thành viên Bạc
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-bold text-slate-900">Thông tin cơ bản</h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
              defaultValue="Nguyễn Văn A"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                defaultValue="email@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-24 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
              />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">
                Đã xác thực
              </span>
            </div>
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
              defaultValue="0901 234 567"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="dob"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Ngày sinh
            </label>
            <input
              id="dob"
              type="date"
              defaultValue="1995-06-15"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none"
            />
          </div>
          <div>
            <p className="mb-2 block text-sm font-medium text-slate-700">
              Giới tính
            </p>
            <div className="flex gap-4">
              {["Nam", "Nữ", "Khác"].map((g, i) => (
                <label
                  key={g}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <input
                    type="radio"
                    name="gender"
                    defaultChecked={i === 0}
                    className="accent-slate-900"
                  />
                  <span className="text-sm text-slate-700">{g}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
