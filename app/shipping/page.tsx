import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { ShippingFaq } from './shipping-faq';

export const metadata: Metadata = { title: 'Chính sách vận chuyển' };

const shippingTable = [
  {
    region: 'TP. Hồ Chí Minh',
    standard: 'Miễn phí',
    express: '15.000đ',
    sameDay: '30.000đ',
  },
  {
    region: 'Hà Nội',
    standard: 'Miễn phí',
    express: '20.000đ',
    sameDay: 'Không hỗ trợ',
  },
  {
    region: 'Đà Nẵng',
    standard: 'Miễn phí',
    express: '25.000đ',
    sameDay: 'Không hỗ trợ',
  },
  {
    region: 'Tỉnh thành khác',
    standard: '30.000đ',
    express: '50.000đ',
    sameDay: 'Không hỗ trợ',
  },
  {
    region: 'Vùng sâu / xa',
    standard: '50.000đ',
    express: 'Không hỗ trợ',
    sameDay: 'Không hỗ trợ',
  },
];

const deliverySteps = [
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    ),
    title: 'Đặt hàng',
    desc: 'Chọn sản phẩm và hoàn tất thanh toán trên website hoặc ứng dụng.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
      </svg>
    ),
    title: 'Xác nhận đơn',
    desc: 'Hệ thống xác nhận và kho hàng chuẩn bị đơn trong 1–2 giờ.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: 'Vận chuyển',
    desc: 'Đơn hàng được bàn giao cho đối tác vận chuyển và cập nhật tracking.',
  },
  {
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    title: 'Giao thành công',
    desc: 'Nhận hàng, kiểm tra và xác nhận. Liên hệ ngay nếu có vấn đề.',
  },
];

const partners = [
  { name: 'GHN', desc: 'Giao Hàng Nhanh' },
  { name: 'GHTK', desc: 'Giao Hàng Tiết Kiệm' },
  { name: 'VNPost', desc: 'Bưu điện Việt Nam' },
  { name: 'J&T', desc: 'J&T Express' },
];

export default function ShippingPage() {
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
            <span className="font-medium text-slate-700">Chính sách vận chuyển</span>
          </nav>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-10">
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Chính sách vận chuyển</h1>
          <p className="mb-10 text-slate-500">Giao hàng nhanh chóng, an toàn trên toàn quốc.</p>

          {/* Shipping table */}
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-slate-900">Bảng phí vận chuyển</h2>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-700">Khu vực</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-700">
                      Tiêu chuẩn (2–4 ngày)
                    </th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-700">
                      Nhanh (1–2 ngày)
                    </th>
                    <th className="px-5 py-3.5 text-left font-semibold text-slate-700">
                      Hỏa tốc (2–4 giờ)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shippingTable.map((row, i) => (
                    <tr key={row.region} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{row.region}</td>
                      <td className="px-5 py-3.5 font-medium text-emerald-600">{row.standard}</td>
                      <td className="px-5 py-3.5 text-slate-700">{row.express}</td>
                      <td className="px-5 py-3.5 text-slate-500">{row.sameDay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              * Miễn phí vận chuyển tiêu chuẩn cho đơn hàng từ 500.000đ
            </p>
          </section>

          {/* Steps */}
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-slate-900">Quy trình giao hàng</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              {deliverySteps.map((s, i) => (
                <div
                  key={s.title}
                  className="relative rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
                >
                  {i < deliverySteps.length - 1 && (
                    <div className="absolute top-8 -right-2 z-10 hidden sm:block">
                      <svg
                        viewBox="0 0 24 24"
                        className="h-4 w-4 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  )}
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    {s.icon}
                  </div>
                  <div className="mb-1 text-sm font-semibold text-slate-900">{s.title}</div>
                  <div className="text-xs leading-relaxed text-slate-500">{s.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="mb-5 text-xl font-bold text-slate-900">Câu hỏi thường gặp</h2>
            <ShippingFaq />
          </section>

          {/* Partners */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-slate-900">Đối tác vận chuyển</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {partners.map((p) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
                >
                  <div className="mb-1 text-lg font-bold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
