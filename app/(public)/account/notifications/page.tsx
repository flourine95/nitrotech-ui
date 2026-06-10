import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Thông báo' };

export default function NotificationsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Thông báo</h1>
        <p className="mt-1 text-sm text-slate-400">
          Các cập nhật về đơn hàng và tài khoản sẽ hiển thị tại đây.
        </p>
      </div>

      <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5" />
            <path d="M9 17a3 3 0 006 0" />
          </svg>
        </div>
        <h2 className="mt-4 font-semibold text-slate-900">Chưa có thông báo</h2>
        <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
          Khi đơn hàng được xác nhận, giao cho vận chuyển hoặc có cập nhật quan trọng, bạn sẽ thấy
          thông báo ở đây.
        </p>
      </div>
    </div>
  );
}
