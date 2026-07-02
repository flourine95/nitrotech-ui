'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function OrdersError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-3xl border border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100">
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 text-rose-600"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v5" />
          <path d="M12 16h.01" />
        </svg>
      </div>
      <h1 className="mt-4 text-lg font-semibold text-slate-900">Không thể tải danh sách đơn hàng</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Vui lòng thử lại sau hoặc mở chi tiết đơn hàng từ liên kết trực tiếp nếu bạn đã có mã đơn.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="cursor-pointer rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
        >
          Thử lại
        </button>
        <Link
          href="/products"
          className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
