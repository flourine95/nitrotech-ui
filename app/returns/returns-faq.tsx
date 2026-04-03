'use client';
import { useState } from 'react';

const faqs = [
  {
    q: 'Thời gian hoàn tiền mất bao lâu?',
    a: 'Sau khi nhận và kiểm tra sản phẩm, chúng tôi sẽ hoàn tiền trong 3–5 ngày làm việc qua phương thức thanh toán ban đầu.',
  },
  {
    q: 'Ai chịu phí vận chuyển khi đổi trả?',
    a: 'NitroTech chịu phí vận chuyển nếu lỗi do chúng tôi (sai hàng, lỗi kỹ thuật). Khách hàng chịu phí nếu đổi ý.',
  },
  {
    q: 'Tôi có thể đổi sang sản phẩm khác giá cao hơn không?',
    a: 'Có. Bạn chỉ cần thanh toán thêm phần chênh lệch giá.',
  },
  {
    q: 'Sản phẩm mở hộp rồi có đổi trả được không?',
    a: 'Có thể đổi trả nếu sản phẩm bị lỗi kỹ thuật. Trường hợp đổi ý, sản phẩm phải còn nguyên hộp và chưa kích hoạt.',
  },
];

export function ReturnsFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-colors duration-150 hover:bg-slate-50"
            aria-expanded={openFaq === i}
          >
            <span className="text-sm font-medium text-slate-900">{faq.q}</span>
            <svg
              viewBox="0 0 24 24"
              className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {openFaq === i && (
            <div className="border-t border-slate-100 px-6 pt-3 pb-4 text-sm leading-relaxed text-slate-600">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
