"use client"
import Link from "next/link"

interface ProductCardProps {
  slug: string
  name: string
  cat: string
  price: string
  old: string
  badge: string
  badgeColor: string
  accent?: string
  rating: number
  reviews: number
  specs?: string[]
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} viewBox="0 0 24 24" className={`w-3 h-3 ${s <= Math.floor(rating) ? "text-amber-400" : "text-slate-200"} fill-current`} aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export function ProductCard({ slug, name, cat, price, old, badge, badgeColor, accent = "", rating, reviews, specs }: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className={`group rounded-3xl bg-white border border-slate-200 ${accent} transition-all duration-200 cursor-pointer overflow-hidden shadow-sm hover:shadow-lg flex flex-col`}
    >
      <div className="relative h-44 bg-slate-50 flex items-center justify-center border-b border-slate-100">
        <svg viewBox="0 0 80 60" className="w-24 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <rect x="5" y="5" width="70" height="50" rx="4"/>
          <rect x="12" y="12" width="56" height="36" rx="2" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
        </svg>
        <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${badgeColor}`}>{badge}</span>
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Link
            href={`/compare?add=${slug}`}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-colors duration-200 cursor-pointer"
            aria-label="So sánh sản phẩm này"
            title="So sánh"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="3" y="3" width="7" height="18" rx="1"/>
              <rect x="14" y="3" width="7" height="18" rx="1"/>
            </svg>
          </Link>
          <button
            onClick={(e) => e.preventDefault()}
            className="p-1.5 rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors duration-200 cursor-pointer"
            aria-label="Yêu thích"
          >
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="text-sm text-slate-400 mb-1">{cat}</div>
        <div className="font-semibold text-base text-slate-900 mb-2 leading-snug">{name}</div>
        {specs && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {specs.map((s) => (
              <span key={s} className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{s}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-1.5 mb-4">
          <Stars rating={rating} />
          <span className="text-xs text-slate-400">({reviews})</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="font-bold text-base text-slate-900">{price}</div>
            <div className="text-sm text-slate-300 line-through">{old}</div>
          </div>
          <button
            onClick={(e) => e.preventDefault()}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
          >
            Mua
          </button>
        </div>
      </div>
    </Link>
  )
}
