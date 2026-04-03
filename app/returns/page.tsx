import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ReturnsFaq } from './returns-faq';

export const metadata: Metadata = { title: 'Chính sách đổi trả' };

const conditions = [
  {
    title: 'Sản phẩm lỗi kỹ thuật',
    desc: 'Sản phẩm bị lỗi do nhà sản xuất, không hoạt động đúng chức năng khi nhận hàng.',
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
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    title: 'Sai sản phẩm / Thiếu phụ kiện',
    desc: 'Nhận được sản phẩm không đúng với đơn đặt hàng hoặc thiếu phụ kiện đi kèm.',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      </svg>
    ),
  },
  {
    title: 'Đổi ý trong 7 ngày',
    desc: 'Đổi sang sản phẩm khác trong 7 ngày nếu sản phẩm còn nguyên hộp, chưa kích hoạt.',
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
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
  },
];

const returnSteps = [
  {
    step: '01',
    title: 'Yêu cầu đổi trả',
    desc: 'Liên hệ hotline 1800 6789 hoặc tạo yêu cầu trong tài khoản của bạn.',
  },
  {
    step: '02',
    title: 'Xác nhận yêu cầu',
    desc: 'Nhân viên xem xét và xác nhận yêu cầu trong vòng 2 giờ làm việc.',
  },
  {
    step: '03',
    title: 'Gửi sản phẩm về',
    desc: 'Đóng gói sản phẩm cẩn thận và gửi về địa chỉ kho của NitroTech.',
  },
  {
    step: '04',
    title: 'Kiểm tra sản phẩm',
    desc: 'Kỹ thuật viên kiểm tra tình trạng sản phẩm trong 1–2 ngày làm việc.',
  },
  {
    step: '05',
    title: 'Hoàn tiền / Đổi mới',
    desc: 'Hoàn tiền trong 3–5 ngày làm việc hoặc giao sản phẩm mới trong 2–3 ngày.',
  },
];

const returnTable = [
  {
    product: 'Laptop, PC Desktop',
    canReturn: true,
    note: 'Trong 30 ngày, còn nguyên hộp',
  },
  {
    product: 'CPU, GPU, RAM, SSD',
    canReturn: true,
    note: 'Trong 30 ngày, chưa lắp đặt',
  },
  {
    product: 'Màn hình',
    canReturn: true,
    note: 'Trong 30 ngày, còn nguyên hộp',
  },
  {
    product: 'Bàn phím, Chuột',
    canReturn: true,
    note: 'Trong 7 ngày, còn nguyên hộp',
  },
  {
    product: 'Phần mềm, License key',
    canReturn: false,
    note: 'Không hỗ trợ đổi trả',
  },
  {
    product: 'Sản phẩm đã kích hoạt',
    canReturn: false,
    note: 'Trừ trường hợp lỗi kỹ thuật',
  },
  {
    product: 'Sản phẩm đã qua sử dụng',
    canReturn: false,
    note: 'Không hỗ trợ đổi trả',
  },
];

export default function ReturnsPage() {
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
            <span className="font-medium text-slate-700">Chính sách đổi trả</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="bg-slate-900 px-6 py-14 text-white">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-bold">Đổi trả dễ dàng trong 30 ngày</h1>
            <p className="text-slate-300">
              Chúng tôi cam kết quy trình đổi trả minh bạch, nhanh chóng và không rắc rối.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl space-y-14 px-6 py-12">
          {/* Conditions */}
          <section>
            <h2 className="mb-6 text-xl font-bold text-slate-900">Điều kiện đổi trả</h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {conditions.map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${c.iconBg}`}
                  >
                    {c.icon}
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-slate-900">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section>
            <h2 className="mb-6 text-xl font-bold text-slate-900">Quy trình đổi trả</h2>
            <div className="space-y-4">
              {returnSteps.map((s) => (
                <div
                  key={s.step}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                    {s.step}
                  </div>
                  <div>
                    <div className="mb-1 font-semibold text-slate-900">{s.title}</div>
                    <div className="text-sm text-slate-600">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Table */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-slate-900">
              Sản phẩm được / không được đổi trả
            </h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-700">Sản phẩm</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-700">Đổi trả</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-700">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {returnTable.map((row, i) => (
                    <tr key={row.product} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.product}</td>
                      <td className="px-5 py-3.5">
                        {row.canReturn ? (
                          <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              aria-hidden="true"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Được
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 font-medium text-rose-500">
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              aria-hidden="true"
                            >
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                            Không
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-slate-900">Câu hỏi thường gặp</h2>
            <ReturnsFaq />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
