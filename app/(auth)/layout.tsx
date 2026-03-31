import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Simple header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-slate-900">Nitro<span className="text-blue-600">Tech</span></span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors duration-150 cursor-pointer flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Về trang chủ
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        © 2025 NitroTech · 
        <Link href="/privacy" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer mx-1">Chính sách bảo mật</Link>·
        <Link href="/terms" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer mx-1">Điều khoản sử dụng</Link>
      </footer>
    </div>
  )
}
