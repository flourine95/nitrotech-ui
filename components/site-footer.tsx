import Link from 'next/link';
import { FacebookIcon, YouTubeIcon, TikTokIcon, BrandLogo } from '@/components/icons';

const footerLinks = {
  'Sản phẩm': [
    { label: 'Laptop Gaming', href: '/products?category=laptop-gaming' },
    { label: 'Laptop Văn phòng', href: '/products?category=laptop-van-phong' },
    { label: 'PC Desktop', href: '/products?category=pc-may-tinh-de-ban' },
    { label: 'Linh kiện', href: '/products?category=linh-kien-may-tinh' },
    { label: 'Màn hình', href: '/products?category=man-hinh-may-tinh' },
    { label: 'Phụ kiện', href: '/products?category=phu-kien-gear' },
  ],
  'Hỗ trợ': [
    { label: 'Tra cứu đơn hàng', href: '/account/orders' },
    { label: 'Chính sách bảo hành', href: '/warranty' },
    { label: 'Chính sách vận chuyển', href: '/shipping' },
    { label: 'Đổi trả', href: '/returns' },
    { label: 'Liên hệ', href: '/contact' },
  ],
  'Công ty': [
    { label: 'Về NitroTech', href: '/about' },
    { label: 'Tuyển dụng', href: '/about' },
    { label: 'Tin tức & Review', href: '/blog' },
    { label: 'Chính sách bảo mật', href: '/privacy' },
    { label: 'Điều khoản sử dụng', href: '/terms' },
  ],
};

const socials = [
  {
    label: 'Facebook',
    href: '#',
    icon: FacebookIcon,
  },
  {
    label: 'YouTube',
    href: '#',
    icon: YouTubeIcon,
  },
  {
    label: 'TikTok',
    href: '#',
    icon: TikTokIcon,
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white pt-14 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <BrandLogo interactive={false} className="mb-4" />
            <p className="mb-5 max-w-xs text-sm leading-relaxed text-slate-500">
              Hệ thống bán lẻ linh kiện điện tử, laptop và máy tính hàng đầu Việt Nam. Chính hãng —
              Giá tốt — Giao nhanh.
            </p>
            <div className="flex gap-2">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-900"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-4 text-sm font-semibold text-slate-900">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="cursor-pointer text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 sm:flex-row">
          <p className="text-xs text-slate-400">© 2025 NitroTech. Tất cả quyền được bảo lưu.</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Visa', 'Mastercard', 'MoMo', 'ZaloPay', 'VNPay'].map((m) => (
              <span
                key={m}
                className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs text-slate-500"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
