import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ContactForm } from './contact-form';

export const metadata: Metadata = { title: 'Liên hệ' };

const channels = [
  {
    title: 'Live Chat',
    desc: 'Phản hồi trong vòng 2 phút',
    detail: 'Thứ 2 – CN, 8:00 – 22:00',
    iconBg: 'bg-blue-100 text-blue-600',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    title: 'Hotline',
    desc: '1800 6789 (miễn phí)',
    detail: 'Thứ 2 – CN, 8:00 – 20:00',
    iconBg: 'bg-emerald-100 text-emerald-600',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
  },
  {
    title: 'Email',
    desc: 'support@nitrotech.vn',
    detail: 'Phản hồi trong 24 giờ',
    iconBg: 'bg-violet-100 text-violet-600',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400">
            <Link
              href="/"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-700"
            >
              Trang chủ
            </Link>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="font-medium text-slate-700">Liên hệ</span>
          </nav>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Liên hệ với chúng tôi</h1>
          <p className="mb-10 text-slate-500">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>

          <div className="grid gap-12 lg:grid-cols-2">
            {/* Form */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <ContactForm />
            </div>

            {/* Info */}
            <div className="space-y-8">
              <div>
                <h2 className="mb-5 text-lg font-bold text-slate-900">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  {[
                    {
                      label: 'Địa chỉ',
                      value: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Điện thoại',
                      value: '1800 6789 (miễn phí)',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Email',
                      value: 'support@nitrotech.vn',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      ),
                    },
                    {
                      label: 'Giờ làm việc',
                      value: 'Thứ 2 – Chủ nhật: 8:00 – 22:00',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        {item.icon}
                      </div>
                      <div>
                        <div className="mb-0.5 text-xs text-slate-400">{item.label}</div>
                        <div className="text-sm font-medium text-slate-900">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="mb-4 text-lg font-bold text-slate-900">Kênh hỗ trợ</h2>
                <div className="space-y-3">
                  {channels.map((c) => (
                    <div
                      key={c.title}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}
                      >
                        {c.icon}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                        <div className="text-sm text-slate-700">{c.desc}</div>
                        <div className="text-xs text-slate-400">{c.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
