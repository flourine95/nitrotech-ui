import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Simple header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex cursor-pointer items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 fill-current text-white"
                aria-hidden="true"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-slate-900">
              Nitro<span className="text-blue-600">Tech</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-500 transition-colors duration-150 hover:text-slate-900"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Về trang chủ
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        © 2025 NitroTech ·
        <Link
          href="/privacy"
          className="mx-1 cursor-pointer transition-colors duration-150 hover:text-slate-700"
        >
          Chính sách bảo mật
        </Link>
        ·
        <Link
          href="/terms"
          className="mx-1 cursor-pointer transition-colors duration-150 hover:text-slate-700"
        >
          Điều khoản sử dụng
        </Link>
      </footer>
    </div>
  );
}
