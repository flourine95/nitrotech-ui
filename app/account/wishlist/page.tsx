import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Yêu thích" }

const wishlist = [
  {
    slug: "macbook-pro-m4",
    name: "MacBook Pro M4",
    cat: "Laptop",
    price: "42.990.000₫",
    old: "47.990.000₫",
    inStock: true,
    badge: "Mới",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    slug: "rtx-4080-super",
    name: "RTX 4080 Super",
    cat: "Card đồ họa",
    price: "22.500.000₫",
    old: "25.000.000₫",
    inStock: true,
    badge: "-10%",
    badgeColor: "bg-amber-100 text-amber-700",
  },
  {
    slug: "lg-ultragear-27",
    name: 'LG UltraGear 27" 4K',
    cat: "Màn hình",
    price: "12.990.000₫",
    old: "14.500.000₫",
    inStock: false,
    badge: "Hết hàng",
    badgeColor: "bg-slate-100 text-slate-500",
  },
  {
    slug: "intel-i9-14900k",
    name: "Intel Core i9-14900K",
    cat: "CPU",
    price: "8.990.000₫",
    old: "10.500.000₫",
    inStock: true,
    badge: "Sale",
    badgeColor: "bg-green-100 text-green-700",
  },
]

export default function WishlistPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Yêu thích</h1>
        <span className="text-sm text-slate-400">
          {wishlist.length} sản phẩm
        </span>
      </div>

      {wishlist.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </div>
          <p className="mb-4 text-sm text-slate-500">
            Chưa có sản phẩm yêu thích
          </p>
          <Link
            href="/products"
            className="inline-block cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {wishlist.map((item) => (
            <div
              key={item.slug}
              className="flex overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              {/* Image */}
              <Link
                href={`/products/${item.slug}`}
                className="flex w-28 shrink-0 cursor-pointer items-center justify-center border-r border-slate-100 bg-slate-50 transition-colors duration-200 hover:bg-slate-100"
              >
                <svg
                  viewBox="0 0 60 45"
                  className="h-auto w-14 text-slate-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="54" height="39" rx="3" />
                  <rect
                    x="8"
                    y="8"
                    width="44"
                    height="29"
                    rx="2"
                    fill="rgba(59,130,246,0.04)"
                    stroke="rgba(59,130,246,0.15)"
                  />
                </svg>
              </Link>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-0.5 text-xs text-slate-400">
                      {item.cat}
                    </div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="line-clamp-2 cursor-pointer text-sm leading-snug font-semibold text-slate-900 transition-colors duration-150 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                  </div>
                  <button
                    className="shrink-0 cursor-pointer rounded-full p-1.5 text-rose-400 transition-colors duration-200 hover:bg-rose-50"
                    aria-label="Xóa khỏi yêu thích"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 fill-current"
                      aria-hidden="true"
                    >
                      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <div>
                    <div className="text-sm font-bold text-slate-900">
                      {item.price}
                    </div>
                    <div className="text-xs text-slate-300 line-through">
                      {item.old}
                    </div>
                  </div>
                  {item.inStock ? (
                    <button className="cursor-pointer rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors duration-200 hover:bg-slate-700">
                      Thêm vào giỏ
                    </button>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-400">
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
      {wishlist.some((i) => i.inStock) && (
        <div className="flex justify-end">
          <button className="cursor-pointer rounded-full border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100">
            Thêm tất cả vào giỏ hàng
          </button>
        </div>
      )}
    </div>
  )
}
