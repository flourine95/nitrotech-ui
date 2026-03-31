import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = { title: "Tin tức & Review" }

const categories = ["Tất cả", "Review", "Tin tức", "Hướng dẫn", "So sánh", "Thủ thuật"]

const tags = ["MacBook", "RTX 4090", "Gaming", "AI", "SSD", "RAM DDR5", "Intel", "AMD", "OLED", "Cooling"]

const featured = {
  slug: "review-macbook-pro-m4",
  category: "Review",
  title: "Review MacBook Pro M4: Hiệu năng vượt trội, pin 'trâu' nhất từ trước đến nay",
  excerpt: "Apple vừa ra mắt MacBook Pro M4 với những cải tiến đáng kể về hiệu năng và thời lượng pin. Chúng tôi đã có 2 tuần trải nghiệm thực tế và đây là đánh giá chi tiết nhất.",
  author: "Minh Khoa",
  date: "15 tháng 1, 2025",
  readTime: "12 phút đọc",
  authorColor: "bg-blue-500",
}

const posts = [
  { slug: "rtx-5090-leak", category: "Tin tức", title: "RTX 5090 lộ điểm benchmark: Mạnh hơn 60% so với RTX 4090", excerpt: "Những thông tin rò rỉ mới nhất về card đồ họa flagship của NVIDIA hứa hẹn sẽ thay đổi cuộc chơi gaming.", author: "Văn Hùng", date: "14 tháng 1, 2025", readTime: "5 phút đọc", authorColor: "bg-emerald-500" },
  { slug: "chon-ram-ddr5", category: "Hướng dẫn", title: "Hướng dẫn chọn RAM DDR5 2025: Tốc độ nào là đủ?", excerpt: "DDR5 đã trở thành tiêu chuẩn mới nhưng không phải ai cũng biết cách chọn đúng. Bài viết này sẽ giải đáp mọi thắc mắc.", author: "Thu Hà", date: "13 tháng 1, 2025", readTime: "8 phút đọc", authorColor: "bg-amber-500" },
  { slug: "laptop-gaming-vs-workstation", category: "So sánh", title: "Laptop Gaming vs Workstation: Nên chọn cái nào cho công việc?", excerpt: "Ranh giới giữa laptop gaming và workstation ngày càng mờ nhạt. Hãy cùng phân tích để đưa ra lựa chọn phù hợp nhất.", author: "Minh Khoa", date: "12 tháng 1, 2025", readTime: "10 phút đọc", authorColor: "bg-blue-500" },
  { slug: "ssd-nvme-gen5", category: "Review", title: "Review SSD NVMe Gen 5: Tốc độ 14GB/s có thực sự cần thiết?", excerpt: "SSD Gen 5 đã ra mắt với tốc độ đọc lên đến 14GB/s. Nhưng liệu bạn có thực sự cần đến tốc độ này trong công việc hàng ngày?", author: "Văn Hùng", date: "11 tháng 1, 2025", readTime: "7 phút đọc", authorColor: "bg-emerald-500" },
  { slug: "ai-pc-2025", category: "Tin tức", title: "AI PC 2025: Kỷ nguyên mới của máy tính cá nhân", excerpt: "Intel, AMD và Qualcomm đều đang đẩy mạnh chip AI. Điều này có ý nghĩa gì với người dùng thông thường?", author: "Thu Hà", date: "10 tháng 1, 2025", readTime: "6 phút đọc", authorColor: "bg-amber-500" },
  { slug: "man-hinh-oled-gaming", category: "Review", title: "Top 5 màn hình OLED gaming tốt nhất 2025", excerpt: "OLED gaming monitor đang ngày càng phổ biến với giá thành hợp lý hơn. Đây là những lựa chọn tốt nhất hiện tại.", author: "Minh Khoa", date: "9 tháng 1, 2025", readTime: "9 phút đọc", authorColor: "bg-blue-500" },
]

const popularPosts = [
  { slug: "review-macbook-pro-m4", title: "Review MacBook Pro M4: Hiệu năng vượt trội", date: "15 tháng 1, 2025" },
  { slug: "chon-ram-ddr5", title: "Hướng dẫn chọn RAM DDR5 2025", date: "13 tháng 1, 2025" },
  { slug: "man-hinh-oled-gaming", title: "Top 5 màn hình OLED gaming tốt nhất 2025", date: "9 tháng 1, 2025" },
  { slug: "ai-pc-2025", title: "AI PC 2025: Kỷ nguyên mới của máy tính cá nhân", date: "10 tháng 1, 2025" },
]

function ThumbnailPlaceholder({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Review: "#DBEAFE",
    "Tin tức": "#DCFCE7",
    "Hướng dẫn": "#FEF3C7",
    "So sánh": "#EDE9FE",
    "Thủ thuật": "#FCE7F3",
  }
  const bg = colors[category] ?? "#F1F5F9"
  return (
    <svg viewBox="0 0 400 220" className="w-full h-full" aria-hidden="true">
      <rect width="400" height="220" fill={bg} />
      <rect x="140" y="60" width="120" height="80" rx="8" fill="white" fillOpacity="0.6" />
      <rect x="155" y="75" width="90" height="8" rx="4" fill="currentColor" fillOpacity="0.2" />
      <rect x="155" y="90" width="70" height="8" rx="4" fill="currentColor" fillOpacity="0.15" />
      <rect x="155" y="105" width="80" height="8" rx="4" fill="currentColor" fillOpacity="0.1" />
      <circle cx="200" cy="155" r="12" fill="white" fillOpacity="0.5" />
    </svg>
  )
}

const categoryColors: Record<string, string> = {
  Review: "bg-blue-100 text-blue-700",
  "Tin tức": "bg-emerald-100 text-emerald-700",
  "Hướng dẫn": "bg-amber-100 text-amber-700",
  "So sánh": "bg-violet-100 text-violet-700",
  "Thủ thuật": "bg-pink-100 text-pink-700",
}

export default function BlogPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Trang chủ</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-slate-700 font-medium">Tin tức & Review</span>
          </nav>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-8">Tin tức & Review</h1>

          <div className="flex gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Featured */}
              <Link href={`/blog/${featured.slug}`} className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 mb-8 cursor-pointer">
                <div className="aspect-[16/7] overflow-hidden text-slate-400">
                  <ThumbnailPlaceholder category={featured.category} />
                </div>
                <div className="p-6">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[featured.category] ?? "bg-slate-100 text-slate-600"}`}>
                    {featured.category}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2 group-hover:text-blue-600 transition-colors duration-200 leading-snug">
                    {featured.title}
                  </h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{featured.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full ${featured.authorColor} flex items-center justify-center text-white text-xs font-bold`} aria-hidden="true">
                      {featured.author[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-700">{featured.author}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-400">{featured.date}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-400">{featured.readTime}</span>
                  </div>
                </div>
              </Link>

              {/* Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 flex flex-col cursor-pointer">
                    <div className="aspect-video overflow-hidden text-slate-400">
                      <ThumbnailPlaceholder category={post.category} />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full w-fit mb-2 ${categoryColors[post.category] ?? "bg-slate-100 text-slate-600"}`}>
                        {post.category}
                      </span>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2 flex-1">{post.excerpt}</p>
                      <div className="flex items-center gap-2 mt-auto">
                        <div className={`w-6 h-6 rounded-full ${post.authorColor} flex items-center justify-center text-white text-[10px] font-bold`} aria-hidden="true">
                          {post.author[0]}
                        </div>
                        <span className="text-xs text-slate-500">{post.author}</span>
                        <span className="text-slate-300 text-xs">·</span>
                        <span className="text-xs text-slate-400">{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Danh mục</h3>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <button key={cat} className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors duration-150 cursor-pointer">
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Bài viết nổi bật</h3>
                <div className="space-y-4">
                  {popularPosts.map((p, i) => (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="flex gap-3 group cursor-pointer">
                      <span className="text-2xl font-bold text-slate-200 leading-none w-6 flex-shrink-0">{i + 1}</span>
                      <div>
                        <div className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors duration-150 leading-snug line-clamp-2">{p.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{p.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button key={tag} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-colors duration-150 cursor-pointer">
                      {tag}
                    </button>
                  ))}
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
