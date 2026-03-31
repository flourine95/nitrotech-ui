import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Yêu thích" }

const wishlist = [
  { slug: "macbook-pro-m4", name: "MacBook Pro M4", cat: "Laptop", price: "42.990.000₫", old: "47.990.000₫", inStock: true, badge: "Mới", badgeColor: "bg-blue-100 text-blue-700" },
  { slug: "rtx-4080-super", name: "RTX 4080 Super", cat: "Card đồ họa", price: "22.500.000₫", old: "25.000.000₫", inStock: true, badge: "-10%", badgeColor: "bg-amber-100 text-amber-700" },
  { slug: "lg-ultragear-27", name: "LG UltraGear 27\" 4K", cat: "Màn hình", price: "12.990.000₫", old: "14.500.000₫", inStock: false, badge: "Hết hàng", badgeColor: "bg-slate-100 text-slate-500" },
  { slug: "intel-i9-14900k", name: "Intel Core i9-14900K", cat: "CPU", price: "8.990.000₫", old: "10.500.000₫", inStock: true, badge: "Sale", badgeColor: "bg-green-100 text-green-700" },
]

export default function WishlistPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Yêu thích</h1>
        <span className="text-sm text-slate-400">{wishlist.length} sản phẩm</span>
      </div>

      {wishlist.length === 0 ? (
        <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-16 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </div>
          <p className="text-slate-500 text-sm mb-4">Chưa có sản phẩm yêu thích</p>
          <Link href="/products" className="px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer inline-block">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {wishlist.map((item) => (
            <div key={item.slug} className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden flex">
              {/* Image */}
              <Link href={`/products/${item.slug}`} className="w-28 bg-slate-50 flex items-center justify-center flex-shrink-0 border-r border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors duration-200">
                <svg viewBox="0 0 60 45" className="w-14 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="3" width="54" height="39" rx="3"/>
                  <rect x="8" y="8" width="44" height="29" rx="2" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                </svg>
              </Link>

              {/* Info */}
              <div className="flex-1 p-4 flex flex-col min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <div className="text-xs text-slate-400 mb-0.5">{item.cat}</div>
                    <Link href={`/products/${item.slug}`} className="font-semibold text-sm text-slate-900 hover:text-blue-600 transition-colors duration-150 cursor-pointer leading-snug line-clamp-2">
                      {item.name}
                    </Link>
                  </div>
                  <button className="p-1.5 rounded-full text-rose-400 hover:bg-rose-50 transition-colors duration-200 cursor-pointer flex-shrink-0" aria-label="Xóa khỏi yêu thích">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                    </svg>
                  </button>
                </div>

                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-sm text-slate-900">{item.price}</div>
                    <div className="text-xs text-slate-300 line-through">{item.old}</div>
                  </div>
                  {item.inStock ? (
                    <button className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer whitespace-nowrap">
                      Thêm vào giỏ
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-400">
                      Hết hàng
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add all to cart */}
      {wishlist.some(i => i.inStock) && (
        <div className="flex justify-end">
          <button className="px-6 py-2.5 rounded-full text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
            Thêm tất cả vào giỏ hàng
          </button>
        </div>
      )}
    </div>
  )
}
