import Link from "next/link"

const footerLinks = {
  "Sản phẩm": [
    { label: "Laptop Gaming", href: "/products?cat=laptop-gaming" },
    { label: "Laptop Văn phòng", href: "/products?cat=laptop-office" },
    { label: "PC Desktop", href: "/products?cat=desktop" },
    { label: "Linh kiện", href: "/products?cat=components" },
    { label: "Màn hình", href: "/products?cat=monitors" },
    { label: "Phụ kiện", href: "/products?cat=accessories" },
  ],
  "Hỗ trợ": [
    { label: "Tra cứu đơn hàng", href: "#" },
    { label: "Chính sách bảo hành", href: "#" },
    { label: "Hướng dẫn mua hàng", href: "#" },
    { label: "Trả góp 0%", href: "#" },
    { label: "Liên hệ", href: "#" },
  ],
  "Công ty": [
    { label: "Về NitroTech", href: "#" },
    { label: "Tuyển dụng", href: "#" },
    { label: "Tin tức", href: "#" },
    { label: "Chính sách bảo mật", href: "#" },
  ],
}

const socials = [
  { label: "Facebook", href: "#", icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
  { label: "YouTube", href: "#", icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg> },
  { label: "TikTok", href: "#", icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/></svg> },
]

export function SiteFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 cursor-pointer w-fit">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-white fill-current" aria-hidden="true"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <span className="font-bold text-lg text-slate-900">Nitro<span className="text-blue-600">Tech</span></span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-xs">
              Hệ thống bán lẻ linh kiện điện tử, laptop và máy tính hàng đầu Việt Nam. Chính hãng — Giá tốt — Giao nhanh.
            </p>
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors duration-200 cursor-pointer"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-slate-900 text-sm mb-4">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-slate-500 text-sm hover:text-slate-900 transition-colors duration-200 cursor-pointer">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-xs">© 2025 NitroTech. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {["Visa", "Mastercard", "MoMo", "ZaloPay", "VNPay"].map((m) => (
              <span key={m} className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
