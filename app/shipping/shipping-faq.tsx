"use client"
import { useState } from "react"

const faqs = [
  { q: "Đơn hàng mất bao lâu để giao?", a: "Nội thành TP.HCM và Hà Nội: 1–2 ngày. Các tỉnh thành khác: 2–4 ngày. Vùng sâu xa: 4–7 ngày làm việc." },
  { q: "Tôi có thể theo dõi đơn hàng không?", a: "Có. Sau khi đơn được giao cho đơn vị vận chuyển, bạn sẽ nhận được mã tracking qua SMS và email để theo dõi trực tiếp." },
  { q: "Đơn hàng trên 500K có được miễn phí vận chuyển không?", a: "Đúng vậy. Tất cả đơn hàng từ 500.000đ trở lên được miễn phí vận chuyển tiêu chuẩn toàn quốc." },
  { q: "Tôi có thể thay đổi địa chỉ giao hàng sau khi đặt không?", a: "Bạn có thể thay đổi địa chỉ trong vòng 1 giờ sau khi đặt hàng bằng cách liên hệ hotline 1800 6789." },
  { q: "Nếu không có nhà khi giao hàng thì sao?", a: "Shipper sẽ liên hệ trước khi giao. Nếu không liên lạc được, đơn hàng sẽ được giao lại tối đa 2 lần trước khi hoàn về kho." },
]

export function ShippingFaq() {
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
