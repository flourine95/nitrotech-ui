"use client"
import { useState } from "react"

const faqs = [
  { q: "Thời gian hoàn tiền mất bao lâu?", a: "Sau khi nhận và kiểm tra sản phẩm, chúng tôi sẽ hoàn tiền trong 3–5 ngày làm việc qua phương thức thanh toán ban đầu." },
  { q: "Ai chịu phí vận chuyển khi đổi trả?", a: "NitroTech chịu phí vận chuyển nếu lỗi do chúng tôi (sai hàng, lỗi kỹ thuật). Khách hàng chịu phí nếu đổi ý." },
  { q: "Tôi có thể đổi sang sản phẩm khác giá cao hơn không?", a: "Có. Bạn chỉ cần thanh toán thêm phần chênh lệch giá." },
  { q: "Sản phẩm mở hộp rồi có đổi trả được không?", a: "Có thể đổi trả nếu sản phẩm bị lỗi kỹ thuật. Trường hợp đổi ý, sản phẩm phải còn nguyên hộp và chưa kích hoạt." },
]

export function ReturnsFaq() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <button
            onClick={() => setOpenFaq(openFaq === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-slate-50 transition-colors duration-150"
            aria-expanded={openFaq === i}
          >
            <span className="font-medium text-slate-900 text-sm">{faq.q}</span>
            <svg viewBox="0 0 24 24" className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {openFaq === i && (
            <div className="px-6 pb-4 border-t border-slate-100 pt-3 text-sm text-slate-600 leading-relaxed">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
