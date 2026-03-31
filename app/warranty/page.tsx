import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { WarrantyAccordion } from "./warranty-accordion"

export const metadata: Metadata = { title: "Chính sách bảo hành" }

export default function WarrantyPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">Trang chủ</Link>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            <span className="text-slate-700 font-medium">Chính sách bảo hành</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="bg-slate-50 border-b border-slate-200 py-12 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Chính sách bảo hành</h1>
            <p className="text-slate-500">NitroTech cam kết bảo hành chính hãng, minh bạch và nhanh chóng cho tất cả sản phẩm.</p>
          </div>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto px-6 py-12">
          <WarrantyAccordion />
        </div>

        {/* CTA */}
        <div className="bg-slate-900 py-12 px-6">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-xl font-bold text-white mb-3">Cần hỗ trợ bảo hành?</h2>
            <p className="text-slate-400 mb-6">Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
            <Link href="/contact" className="inline-block px-8 py-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors duration-200 cursor-pointer">
              Liên hệ ngay
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
