import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = { title: "Review MacBook Pro M4" }

const toc = [
  { id: "tong-quan", label: "Tổng quan" },
  { id: "thiet-ke", label: "Thiết kế & Màn hình" },
  { id: "hieu-nang", label: "Hiệu năng chip M4" },
  { id: "pin", label: "Thời lượng pin" },
  { id: "so-sanh", label: "So sánh thông số" },
  { id: "ket-luan", label: "Kết luận" },
]

const relatedPosts = [
  {
    slug: "laptop-gaming-vs-workstation",
    title: "Laptop Gaming vs Workstation: Nên chọn cái nào?",
    category: "So sánh",
    date: "12 tháng 1, 2025",
  },
  {
    slug: "ai-pc-2025",
    title: "AI PC 2025: Kỷ nguyên mới của máy tính cá nhân",
    category: "Tin tức",
    date: "10 tháng 1, 2025",
  },
  {
    slug: "man-hinh-oled-gaming",
    title: "Top 5 màn hình OLED gaming tốt nhất 2025",
    category: "Review",
    date: "9 tháng 1, 2025",
  },
]

const specsTable = [
  {
    spec: "Chip",
    m4: "Apple M4 (10-core CPU)",
    m3: "Apple M3 (8-core CPU)",
    m2: "Apple M2 (8-core CPU)",
  },
  {
    spec: "RAM",
    m4: "16GB / 24GB / 32GB",
    m3: "8GB / 16GB / 24GB",
    m2: "8GB / 16GB / 24GB",
  },
  {
    spec: "GPU",
    m4: "10-core / 38-core",
    m3: "10-core / 30-core",
    m2: "10-core / 19-core",
  },
  { spec: "Pin", m4: "Đến 24 giờ", m3: "Đến 22 giờ", m2: "Đến 18 giờ" },
  {
    spec: "Màn hình",
    m4: '14.2" / 16.2" Liquid Retina XDR',
    m3: '14.2" / 16.2" Liquid Retina XDR',
    m2: '13.6" Liquid Retina',
  },
  {
    spec: "Giá khởi điểm",
    m4: "49.990.000đ",
    m3: "44.990.000đ",
    m2: "32.990.000đ",
  },
]

export default function BlogPostPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <div className="bg-slate-900 px-6 py-14 text-white">
          <div className="mx-auto max-w-4xl">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex items-center gap-2 text-sm text-slate-400"
            >
              <Link
                href="/"
                className="cursor-pointer transition-colors duration-150 hover:text-white"
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
              <Link
                href="/blog"
                className="cursor-pointer transition-colors duration-150 hover:text-white"
              >
                Blog
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
              <span className="max-w-52 truncate text-slate-300">
                Review MacBook Pro M4
              </span>
            </nav>
            <span className="mb-4 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-300">
              Review
            </span>
            <h1 className="mb-5 text-3xl leading-tight font-bold md:text-4xl">
              Review MacBook Pro M4: Hiệu năng vượt trội, pin &ldquo;trâu&rdquo;
              nhất từ trước đến nay
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white"
                  aria-hidden="true"
                >
                  M
                </div>
                <span className="font-medium text-slate-300">Minh Khoa</span>
              </div>
              <span>15 tháng 1, 2025</span>
              <span>12 phút đọc</span>
              <div className="flex items-center gap-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span>24.5K lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex gap-10">
            {/* Article */}
            <article className="prose-custom min-w-0 flex-1">
              <div className="space-y-6 leading-relaxed text-slate-700">
                <section id="tong-quan">
                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    Tổng quan
                  </h2>
                  <p>
                    Apple vừa ra mắt MacBook Pro M4 với những cải tiến đáng kể
                    về hiệu năng và thời lượng pin. Sau 2 tuần sử dụng thực tế,
                    chúng tôi có thể khẳng định đây là chiếc laptop mạnh mẽ nhất
                    trong phân khúc mỏng nhẹ hiện tại.
                  </p>
                  <p className="mt-3">
                    Chip M4 mang đến bước nhảy vọt đáng kể so với thế hệ M3, đặc
                    biệt trong các tác vụ AI và machine learning. Neural Engine
                    16-core mới có thể xử lý 38 nghìn tỷ phép tính mỗi giây —
                    nhanh hơn 60% so với M3.
                  </p>
                </section>

                <section id="thiet-ke">
                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    Thiết kế &amp; Màn hình
                  </h2>
                  <p>
                    Thiết kế của MacBook Pro M4 không thay đổi nhiều so với thế
                    hệ trước — điều này không hẳn là xấu. Khung nhôm nguyên khối
                    vẫn mang lại cảm giác cao cấp và bền bỉ.
                  </p>
                  <h3 className="mt-4 mb-2 text-lg font-bold text-slate-900">
                    Màn hình Liquid Retina XDR
                  </h3>
                  <p>
                    Màn hình 14.2 inch với độ phân giải 3024 x 1964 pixels, tần
                    số quét ProMotion 120Hz và độ sáng tối đa 1600 nits vẫn là
                    một trong những màn hình laptop tốt nhất hiện tại.
                  </p>
                  <blockquote className="my-4 rounded-r-xl border-l-4 border-blue-500 bg-blue-50 py-2 pl-5">
                    <p className="text-slate-700 italic">
                      &ldquo;Màn hình MacBook Pro M4 vẫn là chuẩn mực mà các nhà
                      sản xuất khác phải hướng tới. Màu sắc chính xác, độ sáng
                      ấn tượng và tần số quét mượt mà.&rdquo;
                    </p>
                    <cite className="mt-1 block text-sm text-slate-500 not-italic">
                      — Nhóm kiểm thử NitroTech
                    </cite>
                  </blockquote>
                </section>

                <section id="hieu-nang">
                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    Hiệu năng chip M4
                  </h2>
                  <p>
                    Chip M4 được sản xuất trên tiến trình 3nm thế hệ 2 của TSMC,
                    mang lại hiệu năng vượt trội trong khi tiêu thụ điện năng
                    thấp hơn đáng kể so với các đối thủ x86.
                  </p>
                  <p className="mt-3">
                    Trong các bài test Cinebench R24, MacBook Pro M4 đạt điểm
                    multi-core cao hơn 35% so với M3 và thậm chí vượt qua nhiều
                    laptop Windows cao cấp sử dụng Intel Core Ultra 9.
                  </p>
                </section>

                <section id="pin">
                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    Thời lượng pin
                  </h2>
                  <p>
                    Apple tuyên bố MacBook Pro M4 có thể hoạt động đến 24 giờ —
                    và trong thực tế, con số này khá chính xác với tác vụ văn
                    phòng thông thường. Đây là cải thiện đáng kể so với 22 giờ
                    của M3.
                  </p>
                </section>

                <section id="so-sanh">
                  <h2 className="mb-4 text-2xl font-bold text-slate-900">
                    So sánh thông số
                  </h2>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            Thông số
                          </th>
                          <th className="bg-blue-50 px-4 py-3 text-left font-semibold text-blue-700">
                            MacBook Pro M4
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            MacBook Pro M3
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-slate-700">
                            MacBook Air M2
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {specsTable.map((row, i) => (
                          <tr
                            key={row.spec}
                            className={
                              i % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                            }
                          >
                            <td className="px-4 py-3 font-medium text-slate-700">
                              {row.spec}
                            </td>
                            <td className="bg-blue-50/30 px-4 py-3 text-slate-900">
                              {row.m4}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {row.m3}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {row.m2}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="ket-luan">
                  <h2 className="mb-3 text-2xl font-bold text-slate-900">
                    Kết luận
                  </h2>
                  <p>
                    MacBook Pro M4 là chiếc laptop tốt nhất Apple từng sản xuất.
                    Nếu bạn đang dùng M2 hoặc cũ hơn, đây là thời điểm tốt để
                    nâng cấp. Nếu bạn đang dùng M3, sự khác biệt không đủ lớn để
                    justify việc nâng cấp ngay.
                  </p>
                </section>
              </div>

              {/* Author bio */}
              <div className="mt-12 flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xl font-bold text-white"
                  aria-hidden="true"
                >
                  M
                </div>
                <div>
                  <div className="mb-1 font-bold text-slate-900">Minh Khoa</div>
                  <div className="mb-2 text-sm text-slate-500">
                    Editor-in-Chief tại NitroTech. Chuyên review laptop, PC và
                    linh kiện với hơn 8 năm kinh nghiệm trong ngành công nghệ.
                  </div>
                  <div className="flex gap-2">
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600">
                      Laptop
                    </span>
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600">
                      Apple
                    </span>
                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs text-slate-600">
                      Gaming
                    </span>
                  </div>
                </div>
              </div>

              {/* Related articles */}
              <div className="mt-10">
                <h2 className="mb-5 text-xl font-bold text-slate-900">
                  Bài viết liên quan
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md"
                    >
                      <span className="mb-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                        {p.category}
                      </span>
                      <div className="mb-2 text-sm leading-snug font-semibold text-slate-900 transition-colors duration-150 group-hover:text-blue-600">
                        {p.title}
                      </div>
                      <div className="text-xs text-slate-400">{p.date}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24 space-y-5">
                {/* TOC */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-slate-900">
                    Mục lục
                  </h3>
                  <nav aria-label="Table of contents">
                    <ul className="space-y-1">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="block cursor-pointer rounded-lg px-2 py-1 text-sm text-slate-500 transition-colors duration-150 hover:bg-slate-50 hover:text-slate-900"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Share */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-slate-900">
                    Chia sẻ
                  </h3>
                  <div className="flex gap-2">
                    {[
                      {
                        label: "Facebook",
                        color: "bg-blue-600 hover:bg-blue-700",
                        icon: (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-current"
                            aria-hidden="true"
                          >
                            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Twitter/X",
                        color: "bg-slate-900 hover:bg-slate-700",
                        icon: (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4 fill-current"
                            aria-hidden="true"
                          >
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ),
                      },
                      {
                        label: "Copy link",
                        color: "bg-slate-100 hover:bg-slate-200 text-slate-700",
                        icon: (
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden="true"
                          >
                            <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                          </svg>
                        ),
                      },
                    ].map((s) => (
                      <button
                        key={s.label}
                        aria-label={s.label}
                        className={`flex flex-1 cursor-pointer items-center justify-center rounded-full py-2 text-sm text-white transition-colors duration-200 ${s.color}`}
                      >
                        {s.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
