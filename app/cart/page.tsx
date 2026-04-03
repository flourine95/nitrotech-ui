import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = { title: 'Giỏ hàng' };

const cartItems = [
  {
    slug: 'macbook-pro-m4',
    name: 'MacBook Pro M4',
    variant: '16GB / 512GB / Space Black',
    price: 42990000,
    qty: 1,
    cat: 'Laptop',
  },
  {
    slug: 'rtx-4080-super',
    name: 'RTX 4080 Super',
    variant: '16GB GDDR6X',
    price: 22500000,
    qty: 1,
    cat: 'Card đồ họa',
  },
  {
    slug: 'samsung-990-pro-2tb',
    name: 'Samsung 990 Pro 2TB',
    variant: 'PCIe 4.0 NVMe',
    price: 3290000,
    qty: 2,
    cat: 'SSD NVMe',
  },
];

function fmt(n: number) {
  return n.toLocaleString('vi-VN') + '₫';
}

const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
const shipping = 0;
const discount = 500000;
const total = subtotal + shipping - discount;

export default function CartPage() {
  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Breadcrumb */}
        <div className="border-b border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-6 py-3 text-sm text-slate-400">
            <Link
              href="/"
              className="cursor-pointer transition-colors duration-150 hover:text-slate-700"
            >
              Trang chủ
            </Link>
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span className="font-medium text-slate-700">Giỏ hàng</span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <h1 className="mb-8 text-2xl font-bold text-slate-900">
            Giỏ hàng ({cartItems.length} sản phẩm)
          </h1>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Cart items ── */}
            <div className="space-y-4 lg:col-span-2">
              {cartItems.map((item) => (
                <div
                  key={item.slug}
                  className="flex gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.slug}`}
                    className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 transition-colors duration-200 hover:border-slate-300"
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
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 text-xs text-slate-400">{item.cat}</div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="mb-1 block cursor-pointer text-sm leading-snug font-semibold text-slate-900 transition-colors duration-150 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    <div className="mb-3 text-xs text-slate-400">{item.variant}</div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Qty */}
                      <div className="flex items-center overflow-hidden rounded-full border border-slate-200">
                        <button
                          className="cursor-pointer px-3 py-1.5 text-base leading-none text-slate-600 transition-colors duration-200 hover:bg-slate-100"
                          aria-label="Giảm số lượng"
                        >
                          −
                        </button>
                        <span
                          className="min-w-10 px-3 py-1.5 text-center text-sm font-semibold text-slate-900"
                          aria-live="polite"
                        >
                          {item.qty}
                        </span>
                        <button
                          className="cursor-pointer px-3 py-1.5 text-base leading-none text-slate-600 transition-colors duration-200 hover:bg-slate-100"
                          aria-label="Tăng số lượng"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-base font-bold text-slate-900">
                        {fmt(item.price * item.qty)}
                      </div>
                    </div>
                  </div>
                  {/* Remove */}
                  <button
                    className="shrink-0 cursor-pointer self-start rounded-full p-2 text-slate-300 transition-colors duration-200 hover:bg-rose-50 hover:text-rose-500"
                    aria-label={`Xóa ${item.name}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Coupon */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-slate-900">Mã giảm giá</p>
                <div className="flex gap-3">
                  <label htmlFor="coupon" className="sr-only">
                    Nhập mã giảm giá
                  </label>
                  <input
                    id="coupon"
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    defaultValue="NITRO500"
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                  />
                  <button className="cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700">
                    Áp dụng
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-green-600">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Mã NITRO500 đã được áp dụng — giảm 500.000₫
                </p>
              </div>

              {/* Continue shopping */}
              <Link
                href="/products"
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-500 transition-colors duration-200 hover:text-slate-900"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Tiếp tục mua sắm
              </Link>

              {/* Gợi ý thêm vào giỏ */}
              <div className="pt-2">
                <h2 className="mb-4 font-bold text-slate-900">Có thể bạn cũng thích</h2>
                <div className="space-y-3">
                  {[
                    {
                      slug: 'corsair-32gb-ddr5',
                      name: 'Corsair Vengeance 32GB DDR5',
                      cat: 'RAM',
                      price: '2.490.000₫',
                      old: '2.990.000₫',
                    },
                    {
                      slug: 'samsung-990-pro-1tb',
                      name: 'Samsung 990 Pro 1TB NVMe',
                      cat: 'SSD',
                      price: '1.890.000₫',
                      old: '2.190.000₫',
                    },
                    {
                      slug: 'lg-ultragear-27',
                      name: 'LG UltraGear 27" 4K 144Hz',
                      cat: 'Màn hình',
                      price: '12.990.000₫',
                      old: '14.500.000₫',
                    },
                  ].map((p) => (
                    <div
                      key={p.slug}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-200 hover:shadow-md"
                    >
                      <Link
                        href={`/products/${p.slug}`}
                        className="flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-100 bg-slate-50"
                      >
                        <svg
                          viewBox="0 0 40 30"
                          className="h-auto w-9 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <rect x="2" y="2" width="36" height="26" rx="2" />
                          <rect
                            x="5"
                            y="5"
                            width="30"
                            height="20"
                            rx="1"
                            fill="rgba(59,130,246,0.04)"
                            stroke="rgba(59,130,246,0.15)"
                          />
                        </svg>
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="mb-0.5 text-xs text-slate-400">{p.cat}</div>
                        <Link
                          href={`/products/${p.slug}`}
                          className="block cursor-pointer truncate text-sm font-semibold text-slate-900 transition-colors duration-150 hover:text-blue-600"
                        >
                          {p.name}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{p.price}</span>
                          <span className="text-xs text-slate-300 line-through">{p.old}</span>
                        </div>
                      </div>
                      <button className="shrink-0 cursor-pointer rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors duration-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white">
                        Thêm
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Order summary ── */}
            <div>
              <div className="sticky top-36 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-base font-bold text-slate-900">Tóm tắt đơn hàng</h2>
                <div className="mb-5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tạm tính ({cartItems.length} sản phẩm)</span>
                    <span className="font-medium text-slate-900">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Phí vận chuyển</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giảm giá (NITRO500)</span>
                    <span className="font-medium text-rose-600">−{fmt(discount)}</span>
                  </div>
                </div>
                <div className="mb-6 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-slate-900">{fmt(total)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Đã bao gồm VAT</p>
                </div>
                <Link
                  href="/checkout"
                  className="mb-3 block w-full cursor-pointer rounded-full bg-blue-600 py-3.5 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500"
                >
                  Tiến hành thanh toán
                </Link>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Thanh toán bảo mật SSL
                </div>

                {/* Payment methods */}
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <p className="mb-3 text-center text-xs text-slate-400">Chấp nhận thanh toán</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Visa', 'Mastercard', 'MoMo', 'ZaloPay', 'VNPay', 'COD'].map((m) => (
                      <span
                        key={m}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500"
                      >
                        {m}
                      </span>
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
  );
}
