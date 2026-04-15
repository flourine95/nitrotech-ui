import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeaderServer as SiteHeader } from '@/components/site-header-server';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = { title: 'Đặt hàng thành công' };

export default function CheckoutSuccessPage() {
  return (
    <>
      <SiteHeader cartCount={0} />
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16">
        <div className="w-full max-w-lg text-center">
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 fill-current text-green-600"
              aria-hidden="true"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-slate-900">Đặt hàng thành công!</h1>
          <p className="mb-8 text-slate-500">
            Cảm ơn bạn đã mua hàng tại NitroTech. Đơn hàng của bạn đang được xử lý.
          </p>

          {/* Order info card */}
          <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="mb-0.5 text-xs text-slate-400">Mã đơn hàng</div>
                <div className="font-bold text-slate-900">NT-2025-0313</div>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-700">
                Đang xử lý
              </span>
            </div>

            <div className="mb-4 space-y-3">
              {[
                {
                  name: 'MacBook Pro M4',
                  variant: '16GB / 512GB',
                  price: '42.990.000₫',
                },
                {
                  name: 'RTX 4080 Super',
                  variant: '16GB GDDR6X',
                  price: '22.500.000₫',
                },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden="true"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" />
                      <path d="M8 21h8M12 17v4" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.variant}</div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold text-slate-900">{item.price}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Tổng cộng</span>
                <span className="font-bold text-slate-900">65.490.000₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phương thức</span>
                <span className="text-slate-700">Thẻ tín dụng ****4242</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giao hàng</span>
                <span className="text-slate-700">Dự kiến trong 2 giờ</span>
              </div>
            </div>
          </div>

          {/* Email notice */}
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 shrink-0 text-blue-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <p className="text-sm text-blue-700">
              Xác nhận đơn hàng đã được gửi đến{' '}
              <span className="font-semibold">email@example.com</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/account/orders/NT-2025-0313"
              className="flex-1 cursor-pointer rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
            >
              Theo dõi đơn hàng
            </Link>
            <Link
              href="/products"
              className="flex-1 cursor-pointer rounded-full bg-slate-900 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
