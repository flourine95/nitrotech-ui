import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeaderServer as SiteHeader } from '@/components/site-header-server';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = { title: 'Về NitroTech' };

const stats = [
  { value: '10+', label: 'Năm kinh nghiệm' },
  { value: '200K+', label: 'Khách hàng' },
  { value: '50K+', label: 'Sản phẩm' },
];

const values = [
  {
    title: 'Chính hãng',
    desc: '100% sản phẩm có nguồn gốc rõ ràng, giấy tờ đầy đủ từ nhà phân phối chính thức.',
    accent: 'bg-blue-50 border-blue-100',
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Tận tâm',
    desc: 'Đội ngũ tư vấn nhiệt tình, hỗ trợ khách hàng 24/7 trước và sau khi mua.',
    accent: 'bg-emerald-50 border-emerald-100',
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
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Đổi mới',
    desc: 'Liên tục cập nhật công nghệ mới nhất, mang đến trải nghiệm mua sắm hiện đại.',
    accent: 'bg-violet-50 border-violet-100',
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
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
      </svg>
    ),
  },
  {
    title: 'Bền vững',
    desc: 'Cam kết phát triển bền vững, giảm thiểu tác động môi trường trong mọi hoạt động.',
    accent: 'bg-amber-50 border-amber-100',
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
        <path d="M2 22c1.25-1.25 2.5-2.5 3.75-2.5S8.5 21 10 21s2.75-1.5 4-1.5 2.75 1.5 4 1.5" />
        <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.38 5.06" />
        <path d="M22 12c0-5.52-4.48-10-10-10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

const team = [
  { name: 'Trần Minh Khoa', role: 'CEO & Co-founder', color: 'bg-blue-500' },
  { name: 'Nguyễn Thị Lan', role: 'CTO', color: 'bg-violet-500' },
  { name: 'Lê Văn Hùng', role: 'Head of Sales', color: 'bg-emerald-500' },
  { name: 'Phạm Thu Hà', role: 'Customer Success', color: 'bg-amber-500' },
];

export default function AboutPage() {
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
            <span className="font-medium text-slate-700">Về NitroTech</span>
          </nav>
        </div>

        {/* Hero */}
        <section className="bg-slate-900 px-6 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-5 text-4xl leading-tight font-bold md:text-5xl">
              Chúng tôi là NitroTech
            </h1>
            <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-slate-300">
              Hệ thống bán lẻ linh kiện điện tử, laptop và máy tính hàng đầu Việt Nam — nơi công
              nghệ gặp gỡ niềm tin.
            </p>
            <div className="mx-auto grid max-w-xl grid-cols-3 gap-8">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="mb-1 text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-sm text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-2xl font-bold text-slate-900">Sứ mệnh của chúng tôi</h2>
              <p className="mb-6 leading-relaxed text-slate-600">
                NitroTech ra đời với sứ mệnh mang công nghệ chính hãng đến tay mọi người Việt Nam
                với mức giá hợp lý nhất. Chúng tôi tin rằng mọi người đều xứng đáng được sử dụng
                những sản phẩm công nghệ tốt nhất.
              </p>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Tầm nhìn</h3>
              <p className="leading-relaxed text-slate-600">
                Trở thành hệ sinh thái công nghệ số 1 Đông Nam Á vào năm 2030, kết nối hàng triệu
                người dùng với những sản phẩm công nghệ tiên tiến nhất thế giới.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <svg
                viewBox="0 0 320 240"
                className="w-full max-w-sm text-slate-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <rect
                  x="20"
                  y="20"
                  width="280"
                  height="200"
                  rx="16"
                  fill="#F8FAFC"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                <rect
                  x="50"
                  y="50"
                  width="100"
                  height="70"
                  rx="8"
                  fill="#EFF6FF"
                  stroke="#BFDBFE"
                  strokeWidth="1.5"
                />
                <rect
                  x="170"
                  y="50"
                  width="100"
                  height="70"
                  rx="8"
                  fill="#F0FDF4"
                  stroke="#BBF7D0"
                  strokeWidth="1.5"
                />
                <rect
                  x="50"
                  y="140"
                  width="220"
                  height="50"
                  rx="8"
                  fill="#FAF5FF"
                  stroke="#E9D5FF"
                  strokeWidth="1.5"
                />
                <circle cx="100" cy="85" r="20" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
                <path
                  d="M90 85l7 7 13-14"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="220" cy="85" r="20" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1.5" />
                <path
                  d="M210 85l7 7 13-14"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M80 165h160M80 178h120"
                  stroke="#C4B5FD"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-slate-50 px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-center text-2xl font-bold text-slate-900">Giá trị cốt lõi</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((v) => (
                <div key={v.title} className={`rounded-2xl border p-6 ${v.accent}`}>
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${v.iconBg}`}
                  >
                    {v.icon}
                  </div>
                  <h3 className="mb-2 font-bold text-slate-900">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-center text-2xl font-bold text-slate-900">
              Đội ngũ lãnh đạo
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m) => (
                <div
                  key={m.name}
                  className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
                >
                  <div
                    className={`h-16 w-16 rounded-full ${m.color} mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white`}
                    aria-hidden="true"
                  >
                    {m.name.split(' ').pop()?.[0]}
                  </div>
                  <div className="mb-1 font-semibold text-slate-900">{m.name}</div>
                  <div className="text-sm text-slate-500">{m.role}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-900 px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">Khám phá sản phẩm của chúng tôi</h2>
            <p className="mb-8 text-slate-400">
              Hơn 50.000 sản phẩm chính hãng đang chờ bạn khám phá.
            </p>
            <Link
              href="/products"
              className="inline-block cursor-pointer rounded-full bg-white px-8 py-3 font-semibold text-slate-900 transition-colors duration-200 hover:bg-slate-100"
            >
              Xem sản phẩm
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
