import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeaderServer as SiteHeader } from '@/components/site-header-server';
import { SiteFooter } from '@/components/site-footer';
import { WarrantyAccordion } from './warranty-accordion';

export const metadata: Metadata = { title: 'Chính sách bảo hành' };

export default function WarrantyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Breadcrumb */}
        <div className="mx-auto max-w-7xl px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400">
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
            <span className="font-medium text-slate-700">Chính sách bảo hành</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-12">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900">
              <svg
                viewBox="0 0 24 24"
                className="h-8 w-8 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="mb-3 text-3xl font-bold text-slate-900">Chính sách bảo hành</h1>
            <p className="text-slate-500">
              NitroTech cam kết bảo hành chính hãng, minh bạch và nhanh chóng cho tất cả sản phẩm.
            </p>
          </div>
        </div>

        {/* Accordion */}
        <div className="mx-auto max-w-3xl px-6 py-12">
          <WarrantyAccordion />
        </div>

        {/* CTA */}
        <div className="bg-slate-900 px-6 py-12">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="mb-3 text-xl font-bold text-white">Cần hỗ trợ bảo hành?</h2>
            <p className="mb-6 text-slate-400">
              Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ bạn.
            </p>
            <Link
              href="/contact"
              className="inline-block cursor-pointer rounded-full bg-white px-8 py-3 font-semibold text-slate-900 transition-colors duration-200 hover:bg-slate-100"
            >
              Liên hệ ngay
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
