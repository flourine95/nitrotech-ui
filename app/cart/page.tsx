import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = { title: "Giỏ hàng" }

const cartItems = [
  { slug: "macbook-pro-m4", name: "MacBook Pro M4", variant: "16GB / 512GB / Space Black", price: 42990000, qty: 1, cat: "Laptop" },
  { slug: "rtx-4080-super", name: "RTX 4080 Super", variant: "16GB GDDR6X", price: 22500000, qty: 1, cat: "Card đồ họa" },
  { slug: "samsung-990-pro-2tb", name: "Samsung 990 Pro 2TB", variant: "PCIe 4.0 NVMe", price: 3290000, qty: 2, cat: "SSD NVMe" },
]

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + "₫"
}

const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0)
const shipping = 0
const discount = 500000
const total = subtotal + shipping - discount

export default function CartPage() {
  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Trang chủ</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-slate-700 font-medium">Giỏ hàng</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-8">Giỏ hàng ({cartItems.length} sản phẩm)</h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Cart items ── */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.slug} className="flex gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                  {/* Image */}
                  <Link href={`/products/${item.slug}`} className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 cursor-pointer hover:border-slate-300 transition-colors duration-200">
                    <svg viewBox="0 0 60 45" className="w-14 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="3" y="3" width="54" height="39" rx="3"/>
                      <rect x="8" y="8" width="44" height="29" rx="2" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                    </svg>
                  </Link>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-slate-400 mb-0.5">{item.cat}</div>
                    <Link href={`/products/${item.slug}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors duration-150 cursor-pointer text-sm leading-snug block mb-1">
                      {item.name}
                    </Link>
                    <div className="text-xs text-slate-400 mb-3">{item.variant}</div>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      {/* Qty */}
                      <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                        <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer text-base leading-none" aria-label="Giảm số lượng">−</button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-slate-900 min-w-10 text-center" aria-live="polite">{item.qty}</span>
                        <button className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 transition-colors duration-200 cursor-pointer text-base leading-none" aria-label="Tăng số lượng">+</button>
                      </div>
                      <div className="font-bold text-base text-slate-900">{fmt(item.price * item.qty)}</div>
                    </div>
                  </div>
                  {/* Remove */}
                  <button className="p-2 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors duration-200 cursor-pointer self-start shrink-0" aria-label={`Xóa ${item.name}`}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>
                  </button>
                </div>
              ))}

              {/* Coupon */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-3">Mã giảm giá</p>
                <div className="flex gap-3">
                  <label htmlFor="coupon" className="sr-only">Nhập mã giảm giá</label>
                  <input
                    id="coupon"
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    defaultValue="NITRO500"
                    className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-sm text-slate-700 focus:outline-none focus:border-blue-400 transition-colors duration-200"
                  />
                  <button className="px-5 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
                    Áp dụng
                  </button>
                </div>
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  Mã NITRO500 đã được áp dụng — giảm 500.000₫
                </p>
              </div>

              {/* Continue shopping */}
              <Link href="/products" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 cursor-pointer">
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Tiếp tục mua sắm
              </Link>

              {/* Gợi ý thêm vào giỏ */}
              <div className="pt-2">
                <h2 className="font-bold text-slate-900 mb-4">Có thể bạn cũng thích</h2>
                <div className="space-y-3">
                  {[
                    { slug: "corsair-32gb-ddr5", name: "Corsair Vengeance 32GB DDR5", cat: "RAM", price: "2.490.000₫", old: "2.990.000₫" },
                    { slug: "samsung-990-pro-1tb", name: "Samsung 990 Pro 1TB NVMe", cat: "SSD", price: "1.890.000₫", old: "2.190.000₫" },
                    { slug: "lg-ultragear-27", name: "LG UltraGear 27\" 4K 144Hz", cat: "Màn hình", price: "12.990.000₫", old: "14.500.000₫" },
                  ].map((p) => (
                    <div key={p.slug} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <Link href={`/products/${p.slug}`} className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 cursor-pointer">
                        <svg viewBox="0 0 40 30" className="w-9 h-auto text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <rect x="2" y="2" width="36" height="26" rx="2"/>
                          <rect x="5" y="5" width="30" height="20" rx="1" fill="rgba(59,130,246,0.04)" stroke="rgba(59,130,246,0.15)"/>
                        </svg>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-400 mb-0.5">{p.cat}</div>
                        <Link href={`/products/${p.slug}`} className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors duration-150 cursor-pointer truncate block">{p.name}</Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-slate-900">{p.price}</span>
                          <span className="text-xs text-slate-300 line-through">{p.old}</span>
                        </div>
                      </div>
                      <button className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors duration-200 cursor-pointer">
                        Thêm
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div>
              <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 sticky top-36">
                <h2 className="font-bold text-slate-900 text-base mb-5">Tóm tắt đơn hàng</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="text-slate-900 font-medium">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giảm giá (NITRO500)</span>
                    <span className="text-rose-600 font-medium">−{fmt(discount)}</span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Tổng cộng</span>
                    <span className="font-bold text-xl text-slate-900">{fmt(total)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Đã bao gồm VAT</p>
                </div>
                <Link href="/checkout" className="block w-full py-3.5 rounded-full text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors duration-200 cursor-pointer text-center mb-3">
                  Tiến hành thanh toán
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Thanh toán bảo mật SSL
                </div>

                {/* Payment methods */}
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-3 text-center">Chấp nhận thanh toán</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Visa", "Mastercard", "MoMo", "ZaloPay", "VNPay", "COD"].map((m) => (
                      <span key={m} className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
