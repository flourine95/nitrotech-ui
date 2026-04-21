'use client';
import { Suspense } from 'react';
import { VerifyEmailContent } from './verify-email-content';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 animate-spin text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".3" />
                <path d="M21 12a9 9 0 00-9-9" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Đang tải...</h2>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
