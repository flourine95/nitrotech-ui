"use client"
import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"

interface ProductActionsProps {
  slug: string
  price: string
  old: string
  discount: string
  variants: string[]
  colors: { name: string; color: string; ring: string }[]
  stockCount: number
  warranty: string
}

export function ProductActions({ slug, price, old, discount, variants, colors, stockCount, warranty }: ProductActionsProps) {
  const [qty, setQty] = useState(1)
  const [activeVariant, setActiveVariant] = useState(0)
  const [activeColor, setActiveColor] = useState(0)

  return (
    <>
      {/* Price */}
      <div className="flex items-baseline gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100">
        <span className="text-3xl font-bold text-slate-900">{price}</span>
        <span className="text-lg text-slate-300 line-through">{old}</span>
        <span className="text-sm font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">{discount}</span>
      </div>

      {/* Variants */}
      {variants.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-900 mb-2">Cấu hình</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v}
                onClick={() => setActiveVariant(i)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 cursor-pointer ${i === activeVariant ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 text-slate-600 hover:border-slate-400"}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-slate-900 mb-2">Màu sắc</p>
          <div className="flex gap-2">
            {colors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setActiveColor(i)}
                className={`w-8 h-8 rounded-full ${c.color} cursor-pointer transition-all duration-200 ${i === activeColor ? `ring-2 ring-offset-2 ${c.ring}` : "hover:ring-2 hover:ring-offset-2 hover:ring-slate-300"}`}
                aria-label={c.name}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-slate-900 mb-2">Số lượng</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer text-lg leading-none" aria-label="Giảm">−</button>
            <span className="px-4 py-2 text-sm font-semibold text-slate-900 min-w-12 text-center" aria-live="polite">{qty}</span>
            <button onClick={() => setQty(q => Math.min(stockCount, q + 1))} className="px-4 py-2 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer text-lg leading-none" aria-label="Tăng">+</button>
          </div>
          <span className="text-xs text-slate-400">Còn {stockCount} sản phẩm</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex gap-3 mb-6">
        <Link
          href="/cart"
          onClick={() => toast.success("Đã thêm vào giỏ hàng", { description: `${qty} × sản phẩm` })}
          className="flex-1 py-3.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer text-center"
        >
          Thêm vào giỏ
        </Link>
        <Link href="/checkout" className="flex-1 py-3.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200 cursor-pointer text-center">Mua ngay</Link>
        <Link href={`/compare?add=${slug}`} className="p-3.5 rounded-full border border-slate-200 text-slate-400 hover:text-blue-500 hover:border-blue-200 transition-colors duration-200 cursor-pointer" aria-label="So sánh" title="So sánh">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>
        </Link>
        <button
          onClick={() => toast.success("Đã thêm vào yêu thích")}
          className="p-3.5 rounded-full border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors duration-200 cursor-pointer"
          aria-label="Yêu thích"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>, text: warranty },
          { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>, text: "Giao trong 2 giờ" },
          { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text: "Đổi trả trong 30 ngày" },
          { icon: <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>, text: "Trả góp 0% lãi suất" },
        ].map((b) => (
          <div key={b.text} className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            <span className="text-blue-600 shrink-0">{b.icon}</span>{b.text}
          </div>
        ))}
      </div>
    </>
  )
}
