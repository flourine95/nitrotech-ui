import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeaderServer as SiteHeader } from '@/components/site-header-server';
import { SiteFooter } from '@/components/site-footer';
import { SearchClient } from './search-client';

export const metadata: Metadata = { title: 'Tìm kiếm' };

export default function SearchPage() {
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
            <span className="font-medium text-slate-700">Tìm kiếm</span>
          </nav>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-8">
          <SearchClient />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
