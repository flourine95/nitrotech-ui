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
  { slug: "laptop-gaming-vs-workstation", title: "Laptop Gaming vs Workstation: Nên chọn cái nào?", category: "So sánh", date: "12 tháng 1, 2025" },
  { slug: "ai-pc-2025", title: "AI PC 2025: Kỷ nguyên mới của máy tính cá nhân", category: "Tin tức", date: "10 tháng 1, 2025" },
  { slug: "man-hinh-oled-gaming", title: "Top 5 màn hình OLED gaming tốt nhất 2025", category: "Review", date: "9 tháng 1, 2025" },
]

const specsTable = [
  { spec: "Chip", m4: "Apple M4 (10-core CPU)", m3: "Apple M3 (8-core CPU)", m2: "Apple M2 (8-core CPU)" },
  { spec: "RAM", m4: "16GB / 24GB / 32GB", m3: "8GB / 16GB / 24GB", m2: "8GB / 16GB / 24GB" },
  { spec: "GPU", m4: "10-core / 38-core", m3: "10-core / 30-core", m2: "10-core / 19-core" },
  { spec: "Pin", m4: "Đến 24 giờ", m3: "Đến 22 giờ", m2: "Đến 18 giờ" },
  { spec: "Màn hình", m4: "14.2\" / 16.2\" Liquid Retina XDR", m3: "14.2\" / 16.2\" Liquid Retina XDR", m2: "13.6\" Liquid Retina" },
  { spec: "Giá khởi điểm", m4: "49.990.000đ", m3: "44.990.000đ", m2: "32.990.000đ" },
]

export default function BlogPostPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <div className="bg-slate-900 text-white py-14 px-6">
          <div className="max-w-4xl mx-auto">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400 mb-6">
              <Link href="/" className="hover:text-white transition-colors duration-150 cursor-pointer">Trang chủ</Link>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
              <Link href="/blog" className="hover:text-white transition-colors duration-150 cursor-pointer">Blog</Link>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
              <span className="text-slate-300 truncate max-w-52">Review MacBook Pro M4</span>
            </nav>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 mb-4 inline-block">Review</span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
              Review MacBook Pro M4: Hiệu năng vượt trội, pin &ldquo;trâu&rdquo; nhất từ trước đến nay
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold" aria-hidden="true">M</div>
                <span className="text-slate-300 font-medium">Minh Khoa</span>
              </div>
              <span>15 tháng 1, 2025</span>
              <span>12 phút đọc</span>
              <div className="flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <span>24.5K lượt xem</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex gap-10">
            {/* Article */}
            <article className="flex-1 min-w-0 prose-custom">
              <div className="space-y-6 text-slate-700 leading-relaxed">
                <section id="tong-quan">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Tổng quan</h2>
                  <p>Apple vừa ra mắt MacBook Pro M4 với những cải tiến đáng kể về hiệu năng và thời lượng pin. Sau 2 tuần sử dụng thực tế, chúng tôi có thể khẳng định đây là chiếc laptop mạnh mẽ nhất trong phân khúc mỏng nhẹ hiện tại.</p>
                  <p className="mt-3">Chip M4 mang đến bước nhảy vọt đáng kể so với thế hệ M3, đặc biệt trong các tác vụ AI và machine learning. Neural Engine 16-core mới có thể xử lý 38 nghìn tỷ phép tính mỗi giây — nhanh hơn 60% so với M3.</p>
                </section>

                <section id="thiet-ke">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Thiết kế &amp; Màn hình</h2>
                  <p>Thiết kế của MacBook Pro M4 không thay đổi nhiều so với thế hệ trước — điều này không hẳn là xấu. Khung nhôm nguyên khối vẫn mang lại cảm giác cao cấp và bền bỉ.</p>
                  <h3 className="text-lg font-bold text-slate-900 mt-4 mb-2">Màn hình Liquid Retina XDR</h3>
                  <p>Màn hình 14.2 inch với độ phân giải 3024 x 1964 pixels, tần số quét ProMotion 120Hz và độ sáng tối đa 1600 nits vẫn là một trong những màn hình laptop tốt nhất hiện tại.</p>
                  <blockquote className="border-l-4 border-blue-500 pl-5 py-2 bg-blue-50 rounded-r-xl my-4">
                    <p className="text-slate-700 italic">&ldquo;Màn hình MacBook Pro M4 vẫn là chuẩn mực mà các nhà sản xuất khác phải hướng tới. Màu sắc chính xác, độ sáng ấn tượng và tần số quét mượt mà.&rdquo;</p>
                    <cite className="text-sm text-slate-500 not-italic mt-1 block">— Nhóm kiểm thử NitroTech</cite>
                  </blockquote>
                </section>

                <section id="hieu-nang">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Hiệu năng chip M4</h2>
                  <p>Chip M4 được sản xuất trên tiến trình 3nm thế hệ 2 của TSMC, mang lại hiệu năng vượt trội trong khi tiêu thụ điện năng thấp hơn đáng kể so với các đối thủ x86.</p>
                  <p className="mt-3">Trong các bài test Cinebench R24, MacBook Pro M4 đạt điểm multi-core cao hơn 35% so với M3 và thậm chí vượt qua nhiều laptop Windows cao cấp sử dụng Intel Core Ultra 9.</p>
                </section>

                <section id="pin">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Thời lượng pin</h2>
                  <p>Apple tuyên bố MacBook Pro M4 có thể hoạt động đến 24 giờ — và trong thực tế, con số này khá chính xác với tác vụ văn phòng thông thường. Đây là cải thiện đáng kể so với 22 giờ của M3.</p>
                </section>

                <section id="so-sanh">
                  <h2 className="text-2xl font-bold text-slate-900 mb-4">So sánh thông số</h2>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">Thông số</th>
                          <th className="text-left px-4 py-3 font-semibold text-blue-700 bg-blue-50">MacBook Pro M4</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">MacBook Pro M3</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-700">MacBook Air M2</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specsTable.map((row, i) => (
                          <tr key={row.spec} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="px-4 py-3 font-medium text-slate-700">{row.spec}</td>
                            <td className="px-4 py-3 text-slate-900 bg-blue-50/30">{row.m4}</td>
                            <td className="px-4 py-3 text-slate-600">{row.m3}</td>
                            <td className="px-4 py-3 text-slate-600">{row.m2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="ket-luan">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">Kết luận</h2>
                  <p>MacBook Pro M4 là chiếc laptop tốt nhất Apple từng sản xuất. Nếu bạn đang dùng M2 hoặc cũ hơn, đây là thời điểm tốt để nâng cấp. Nếu bạn đang dùng M3, sự khác biệt không đủ lớn để justify việc nâng cấp ngay.</p>
                </section>
              </div>

              {/* Author bio */}
              <div className="mt-12 bg-slate-50 rounded-2xl border border-slate-200 p-6 flex gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold shrink-0" aria-hidden="true">M</div>
                <div>
                  <div className="font-bold text-slate-900 mb-1">Minh Khoa</div>
                  <div className="text-sm text-slate-500 mb-2">Editor-in-Chief tại NitroTech. Chuyên review laptop, PC và linh kiện với hơn 8 năm kinh nghiệm trong ngành công nghệ.</div>
                  <div className="flex gap-2">
                    <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">Laptop</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">Apple</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2.5 py-1 rounded-full">Gaming</span>
                  </div>
                </div>
              </div>

              {/* Related articles */}
              <div className="mt-10">
                <h2 className="text-xl font-bold text-slate-900 mb-5">Bài viết liên quan</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {relatedPosts.map((p) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="group bg-white rounded-2xl border border-slate-200 p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 mb-2 inline-block">{p.category}</span>
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-150 leading-snug mb-2">{p.title}</div>
                      <div className="text-xs text-slate-400">{p.date}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24 space-y-5">
                {/* TOC */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">Mục lục</h3>
                  <nav aria-label="Table of contents">
                    <ul className="space-y-1">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a href={`#${item.id}`} className="block text-sm text-slate-500 hover:text-slate-900 py-1 px-2 rounded-lg hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Share */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-900 mb-3 text-sm">Chia sẻ</h3>
                  <div className="flex gap-2">
                    {[
                      { label: "Facebook", color: "bg-blue-600 hover:bg-blue-700", icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                      { label: "Twitter/X", color: "bg-slate-900 hover:bg-slate-700", icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                      { label: "Copy link", color: "bg-slate-100 hover:bg-slate-200 text-slate-700", icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
                    ].map((s) => (
                      <button key={s.label} aria-label={s.label} className={`flex-1 flex items-center justify-center py-2 rounded-full text-white text-sm transition-colors duration-200 cursor-pointer ${s.color}`}>
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
