import type { Metadata } from 'next';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Review MacBook Pro M4' };

const toc = [
  { id: 'tong-quan', label: 'Tổng quan' },
  { id: 'thiet-ke', label: 'Thiết kế & Màn hình' },
  { id: 'hieu-nang', label: 'Hiệu năng chip M4' },
  { id: 'pin', label: 'Thời lượng pin' },
  { id: 'so-sanh', label: 'So sánh thông số' },
  { id: 'ket-luan', label: 'Kết luận' },
];

const relatedPosts = [
  {
    slug: 'laptop-gaming-vs-workstation',
    title: 'Laptop Gaming vs Workstation: Nên chọn cái nào?',
    category: 'So sánh',
    date: '12 tháng 1, 2025',
  },
  {
    slug: 'ai-pc-2025',
    title: 'AI PC 2025: Kỷ nguyên mới của máy tính cá nhân',
    category: 'Tin tức',
    date: '10 tháng 1, 2025',
  },
  {
    slug: 'man-hinh-oled-gaming',
    title: 'Top 5 màn hình OLED gaming tốt nhất 2025',
    category: 'Review',
    date: '9 tháng 1, 2025',
  },
];

const specsTable = [
  {
    spec: 'Chip',
    m4: 'Apple M4 (10-core CPU)',
    m3: 'Apple M3 (8-core CPU)',
    m2: 'Apple M2 (8-core CPU)',
  },
  {
    spec: 'RAM',
    m4: '16GB / 24GB / 32GB',
    m3: '8GB / 16GB / 24GB',
    m2: '8GB / 16GB / 24GB',
  },
  {
    spec: 'GPU',
    m4: '10-core / 38-core',
    m3: '10-core / 30-core',
    m2: '10-core / 19-core',
  },
  { spec: 'Pin', m4: 'Đến 24 giờ', m3: 'Đến 22 giờ', m2: 'Đến 18 giờ' },
  {
    spec: 'Màn hình',
    m4: '14.2" / 16.2" Liquid Retina XDR',
    m3: '14.2" / 16.2" Liquid Retina XDR',
    m2: '13.6" Liquid Retina',
  },
  {
    spec: 'Giá khởi điểm',
    m4: '49.990.000đ',
    m3: '44.990.000đ',
    m2: '32.990.000đ',
  },
];

export default function BlogPostPage() {
  return (
    <main className="bg-background">
        <div className="mx-auto max-w-4xl px-6 pt-16">
            <Badge variant="secondary" className="mb-4">
              Review
            </Badge>
            <h1 className="mb-5 text-3xl leading-tight font-bold text-foreground md:text-4xl">
              Review MacBook Pro M4: Hiệu năng vượt trội, pin &ldquo;trâu&rdquo; nhất từ trước đến
              nay
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div
                  className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  M
                </div>
                <span className="font-medium text-foreground">Minh Khoa</span>
              </div>
              <span>15 tháng 1, 2025</span>
              <span>12 phút đọc</span>
              <div className="flex items-center gap-1">
                <Eye className="size-4" aria-hidden="true" />
                <span>24.5K lượt xem</span>
              </div>
            </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex gap-10">
            {/* Article */}
            <article className="prose-custom min-w-0 flex-1">
              <div className="flex flex-col gap-6 leading-relaxed text-foreground">
                <section id="tong-quan">
                  <h2 className="mb-3 text-2xl font-bold text-foreground">Tổng quan</h2>
                  <p>
                    Apple vừa ra mắt MacBook Pro M4 với những cải tiến đáng kể về hiệu năng và thời
                    lượng pin. Sau 2 tuần sử dụng thực tế, chúng tôi có thể khẳng định đây là chiếc
                    laptop mạnh mẽ nhất trong phân khúc mỏng nhẹ hiện tại.
                  </p>
                  <p className="mt-3">
                    Chip M4 mang đến bước nhảy vọt đáng kể so với thế hệ M3, đặc biệt trong các tác
                    vụ AI và machine learning. Neural Engine 16-core mới có thể xử lý 38 nghìn tỷ
                    phép tính mỗi giây — nhanh hơn 60% so với M3.
                  </p>
                </section>

                <section id="thiet-ke">
                  <h2 className="mb-3 text-2xl font-bold text-foreground">
                    Thiết kế &amp; Màn hình
                  </h2>
                  <p>
                    Thiết kế của MacBook Pro M4 không thay đổi nhiều so với thế hệ trước — điều này
                    không hẳn là xấu. Khung nhôm nguyên khối vẫn mang lại cảm giác cao cấp và bền
                    bỉ.
                  </p>
                  <h3 className="mt-4 mb-2 text-lg font-bold text-foreground">
                    Màn hình Liquid Retina XDR
                  </h3>
                  <p>
                    Màn hình 14.2 inch với độ phân giải 3024 x 1964 pixels, tần số quét ProMotion
                    120Hz và độ sáng tối đa 1600 nits vẫn là một trong những màn hình laptop tốt
                    nhất hiện tại.
                  </p>
                  <blockquote className="my-4 rounded-xl bg-muted p-5">
                    <p className="text-foreground italic">
                      &ldquo;Màn hình MacBook Pro M4 vẫn là chuẩn mực mà các nhà sản xuất khác phải
                      hướng tới. Màu sắc chính xác, độ sáng ấn tượng và tần số quét mượt mà.&rdquo;
                    </p>
                    <cite className="mt-1 block text-sm text-muted-foreground not-italic">
                      — Nhóm kiểm thử NitroTech
                    </cite>
                  </blockquote>
                </section>

                <section id="hieu-nang">
                  <h2 className="mb-3 text-2xl font-bold text-foreground">Hiệu năng chip M4</h2>
                  <p>
                    Chip M4 được sản xuất trên tiến trình 3nm thế hệ 2 của TSMC, mang lại hiệu năng
                    vượt trội trong khi tiêu thụ điện năng thấp hơn đáng kể so với các đối thủ x86.
                  </p>
                  <p className="mt-3">
                    Trong các bài test Cinebench R24, MacBook Pro M4 đạt điểm multi-core cao hơn 35%
                    so với M3 và thậm chí vượt qua nhiều laptop Windows cao cấp sử dụng Intel Core
                    Ultra 9.
                  </p>
                </section>

                <section id="pin">
                  <h2 className="mb-3 text-2xl font-bold text-foreground">Thời lượng pin</h2>
                  <p>
                    Apple tuyên bố MacBook Pro M4 có thể hoạt động đến 24 giờ — và trong thực tế,
                    con số này khá chính xác với tác vụ văn phòng thông thường. Đây là cải thiện
                    đáng kể so với 22 giờ của M3.
                  </p>
                </section>

                <section id="so-sanh">
                  <h2 className="mb-4 text-2xl font-bold text-foreground">So sánh thông số</h2>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-muted">
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            Thông số
                          </th>
                          <th className="bg-muted px-4 py-3 text-left font-semibold text-primary">
                            MacBook Pro M4
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            MacBook Pro M3
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-foreground">
                            MacBook Air M2
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {specsTable.map((row, i) => (
                          <tr
                            key={row.spec}
                            className={i % 2 === 0 ? 'bg-card' : 'bg-muted/50'}
                          >
                            <td className="px-4 py-3 font-medium text-foreground">{row.spec}</td>
                            <td className="bg-muted/50 px-4 py-3 text-foreground">{row.m4}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.m3}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row.m2}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="ket-luan">
                  <h2 className="mb-3 text-2xl font-bold text-foreground">Kết luận</h2>
                  <p>
                    MacBook Pro M4 là chiếc laptop tốt nhất Apple từng sản xuất. Nếu bạn đang dùng
                    M2 hoặc cũ hơn, đây là thời điểm tốt để nâng cấp. Nếu bạn đang dùng M3, sự khác
                    biệt không đủ lớn để justify việc nâng cấp ngay.
                  </p>
                </section>
              </div>

              {/* Author bio */}
              <div className="mt-12 flex gap-4 rounded-2xl border border-border bg-muted p-6">
                <div
                  className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
                  aria-hidden="true"
                >
                  M
                </div>
                <div>
                  <div className="mb-1 font-bold text-foreground">Minh Khoa</div>
                  <div className="mb-2 text-sm text-muted-foreground">
                    Editor-in-Chief tại NitroTech. Chuyên review laptop, PC và linh kiện với hơn 8
                    năm kinh nghiệm trong ngành công nghệ.
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      Laptop
                    </Badge>
                    <Badge variant="secondary">
                      Apple
                    </Badge>
                    <Badge variant="secondary">
                      Gaming
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Related articles */}
              <div className="mt-10">
                <h2 className="mb-5 text-xl font-bold text-foreground">Bài viết liên quan</h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  {relatedPosts.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="group cursor-pointer rounded-2xl border border-border bg-card p-4 transition-colors duration-200 hover:bg-muted/50"
                    >
                      <Badge variant="secondary" className="mb-2">
                        {p.category}
                      </Badge>
                      <div className="mb-2 text-sm leading-snug font-semibold text-foreground transition-colors duration-150 group-hover:text-primary">
                        {p.title}
                      </div>
                      <div className="text-xs text-muted-foreground">{p.date}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24 flex flex-col gap-5">
                {/* TOC */}
                <div className="rounded-2xl border border-border bg-card p-5 ">
                  <h3 className="mb-3 text-sm font-bold text-foreground">Mục lục</h3>
                  <nav aria-label="Table of contents">
                    <ul className="flex flex-col gap-1">
                      {toc.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            className="block cursor-pointer rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
  );
}
