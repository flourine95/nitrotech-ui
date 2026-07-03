import type { Metadata } from 'next';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Tin tức & Review' };

const categories = ['Tất cả', 'Review', 'Tin tức', 'Hướng dẫn', 'So sánh', 'Thủ thuật'];

const tags = [
  'MacBook',
  'RTX 4090',
  'Gaming',
  'AI',
  'SSD',
  'RAM DDR5',
  'Intel',
  'AMD',
  'OLED',
  'Cooling',
];

const featured = {
  slug: 'review-macbook-pro-m4',
  category: 'Review',
  title: "Review MacBook Pro M4: Hiệu năng vượt trội, pin 'trâu' nhất từ trước đến nay",
  excerpt:
    'Apple vừa ra mắt MacBook Pro M4 với những cải tiến đáng kể về hiệu năng và thời lượng pin. Chúng tôi đã có 2 tuần trải nghiệm thực tế và đây là đánh giá chi tiết nhất.',
  author: 'Minh Khoa',
  date: '15 tháng 1, 2025',
  readTime: '12 phút đọc',
  authorColor: 'bg-primary',
};

const posts = [
  {
    slug: 'rtx-5090-leak',
    category: 'Tin tức',
    title: 'RTX 5090 lộ điểm benchmark: Mạnh hơn 60% so với RTX 4090',
    excerpt:
      'Những thông tin rò rỉ mới nhất về card đồ họa flagship của NVIDIA hứa hẹn sẽ thay đổi cuộc chơi gaming.',
    author: 'Văn Hùng',
    date: '14 tháng 1, 2025',
    readTime: '5 phút đọc',
    authorColor: 'bg-primary',
  },
  {
    slug: 'chon-ram-ddr5',
    category: 'Hướng dẫn',
    title: 'Hướng dẫn chọn RAM DDR5 2025: Tốc độ nào là đủ?',
    excerpt:
      'DDR5 đã trở thành tiêu chuẩn mới nhưng không phải ai cũng biết cách chọn đúng. Bài viết này sẽ giải đáp mọi thắc mắc.',
    author: 'Thu Hà',
    date: '13 tháng 1, 2025',
    readTime: '8 phút đọc',
    authorColor: 'bg-primary',
  },
  {
    slug: 'laptop-gaming-vs-workstation',
    category: 'So sánh',
    title: 'Laptop Gaming vs Workstation: Nên chọn cái nào cho công việc?',
    excerpt:
      'Ranh giới giữa laptop gaming và workstation ngày càng mờ nhạt. Hãy cùng phân tích để đưa ra lựa chọn phù hợp nhất.',
    author: 'Minh Khoa',
    date: '12 tháng 1, 2025',
    readTime: '10 phút đọc',
    authorColor: 'bg-primary',
  },
  {
    slug: 'ssd-nvme-gen5',
    category: 'Review',
    title: 'Review SSD NVMe Gen 5: Tốc độ 14GB/s có thực sự cần thiết?',
    excerpt:
      'SSD Gen 5 đã ra mắt với tốc độ đọc lên đến 14GB/s. Nhưng liệu bạn có thực sự cần đến tốc độ này trong công việc hàng ngày?',
    author: 'Văn Hùng',
    date: '11 tháng 1, 2025',
    readTime: '7 phút đọc',
    authorColor: 'bg-primary',
  },
  {
    slug: 'ai-pc-2025',
    category: 'Tin tức',
    title: 'AI PC 2025: Kỷ nguyên mới của máy tính cá nhân',
    excerpt:
      'Intel, AMD và Qualcomm đều đang đẩy mạnh chip AI. Điều này có ý nghĩa gì với người dùng thông thường?',
    author: 'Thu Hà',
    date: '10 tháng 1, 2025',
    readTime: '6 phút đọc',
    authorColor: 'bg-primary',
  },
  {
    slug: 'man-hinh-oled-gaming',
    category: 'Review',
    title: 'Top 5 màn hình OLED gaming tốt nhất 2025',
    excerpt:
      'OLED gaming monitor đang ngày càng phổ biến với giá thành hợp lý hơn. Đây là những lựa chọn tốt nhất hiện tại.',
    author: 'Minh Khoa',
    date: '9 tháng 1, 2025',
    readTime: '9 phút đọc',
    authorColor: 'bg-primary',
  },
];

const popularPosts = [
  {
    slug: 'review-macbook-pro-m4',
    title: 'Review MacBook Pro M4: Hiệu năng vượt trội',
    date: '15 tháng 1, 2025',
  },
  {
    slug: 'chon-ram-ddr5',
    title: 'Hướng dẫn chọn RAM DDR5 2025',
    date: '13 tháng 1, 2025',
  },
  {
    slug: 'man-hinh-oled-gaming',
    title: 'Top 5 màn hình OLED gaming tốt nhất 2025',
    date: '9 tháng 1, 2025',
  },
  {
    slug: 'ai-pc-2025',
    title: 'AI PC 2025: Kỷ nguyên mới của máy tính cá nhân',
    date: '10 tháng 1, 2025',
  },
];


export default function BlogPage() {
  return (
    <main className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Tin tức & Review</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Góc cập nhật sản phẩm, hướng dẫn chọn cấu hình và review thiết bị từ NitroTech.
            </p>
          </header>

          <div className="flex gap-8">
            {/* Main content */}
            <div className="min-w-0 flex-1">
              {/* Featured */}
              <Link
                href={`/blog/${featured.slug}`}
                className="group mb-8 block cursor-pointer rounded-2xl border border-border bg-card p-6"
              >
                  <Badge variant="secondary">
                    {featured.category}
                  </Badge>
                  <h2 className="mt-3 mb-2 text-xl leading-snug font-bold text-foreground transition-colors duration-200 group-hover:text-primary">
                    {featured.title}
                  </h2>
                  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`size-7 rounded-full ${featured.authorColor} flex items-center justify-center text-xs font-bold text-primary-foreground`}
                      aria-hidden="true"
                    >
                      {featured.author[0]}
                    </div>
                    <span className="text-sm font-medium text-foreground">{featured.author}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{featured.date}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">{featured.readTime}</span>
                  </div>
              </Link>

              {/* Grid */}
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blog/${post.slug}`}
                    className="group flex cursor-pointer flex-col rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="flex flex-1 flex-col">
                      <Badge variant="secondary" className="mb-2">
                        {post.category}
                      </Badge>
                      <h3 className="mb-2 line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors duration-200 group-hover:text-primary">
                        {post.title}
                      </h3>
                      <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <div className="mt-auto flex items-center gap-2">
                        <div
                          className={`size-6 rounded-full ${post.authorColor} flex items-center justify-center text-[10px] font-bold text-primary-foreground`}
                          aria-hidden="true"
                        >
                          {post.author[0]}
                        </div>
                        <span className="text-xs text-muted-foreground">{post.author}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden w-72 shrink-0 lg:block">
              <div className="flex flex-col gap-6">
              {/* Categories */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-4 font-bold text-foreground">Danh mục</h3>
                <div className="flex flex-col gap-1">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Popular */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-4 font-bold text-foreground">Bài viết nổi bật</h3>
                <div className="flex flex-col gap-4">
                  {popularPosts.map((p, i) => (
                    <Link
                      key={p.slug}
                      href={`/blog/${p.slug}`}
                      className="group flex cursor-pointer gap-3"
                    >
                      <span className="w-6 shrink-0 text-2xl leading-none font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <div>
                        <div className="line-clamp-2 text-sm leading-snug font-medium text-foreground transition-colors duration-150 group-hover:text-primary">
                          {p.title}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{p.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="mb-4 font-bold text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="rounded-full"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
  );
}
