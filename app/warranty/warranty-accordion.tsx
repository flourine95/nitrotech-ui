"use client"
import { useState } from "react"
import type { ReactNode } from "react"

const warrantyByCategory = [
  { category: "Laptop", duration: "12 – 24 tháng", note: "Tùy hãng sản xuất" },
  { category: "CPU / GPU", duration: "36 tháng", note: "Bảo hành chính hãng" },
  { category: "RAM / SSD", duration: "36 – 60 tháng", note: "Tùy thương hiệu" },
  { category: "Màn hình", duration: "24 tháng", note: "Bao gồm lỗi điểm ảnh" },
  { category: "Bàn phím / Chuột", duration: "12 tháng", note: "Lỗi kỹ thuật" },
  { category: "Tai nghe", duration: "12 tháng", note: "Lỗi kỹ thuật" },
]

const steps = [
  { step: "01", title: "Liên hệ hỗ trợ", desc: "Gọi hotline 1800 6789 hoặc mang sản phẩm đến cửa hàng gần nhất." },
  { step: "02", title: "Kiểm tra sản phẩm", desc: "Kỹ thuật viên kiểm tra và xác nhận lỗi trong vòng 30 phút." },
  { step: "03", title: "Tiếp nhận bảo hành", desc: "Lập phiếu bảo hành, thông báo thời gian hoàn trả dự kiến." },
  { step: "04", title: "Sửa chữa / Đổi mới", desc: "Sửa chữa hoặc đổi sản phẩm mới tùy theo tình trạng lỗi." },
]

const accordionItems: { id: string; title: string; content: ReactNode }[] = [
  {
    id: "dieu-kien",
    title: "Điều kiện bảo hành",
    content: (
      <ul className="space-y-2 text-slate-600 text-sm">
        {["Sản phẩm còn trong thời hạn bảo hành", "Tem bảo hành còn nguyên vẹn, không bị rách hoặc tẩy xóa", "Sản phẩm có hóa đơn mua hàng tại NitroTech", "Lỗi do nhà sản xuất, không phải do tác động bên ngoài", "Sản phẩm không bị ngấm nước, cháy nổ, hoặc va đập mạnh"].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "thoi-gian",
    title: "Thời gian bảo hành theo danh mục",
    content: (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Danh mục</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Thời gian</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-700">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {warrantyByCategory.map((row, i) => (
              <tr key={row.category} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                <td className="px-4 py-3 font-medium text-slate-900">{row.category}</td>
                <td className="px-4 py-3 text-slate-700">{row.duration}</td>
                <td className="px-4 py-3 text-slate-500">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: "quy-trinh",
    title: "Quy trình bảo hành",
    content: (
      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.step} className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shrink-0">{s.step}</div>
            <div>
              <div className="font-semibold text-slate-900 mb-1">{s.title}</div>
              <div className="text-sm text-slate-600">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "khong-bao-hanh",
    title: "Các trường hợp không được bảo hành",
    content: (
      <ul className="space-y-2 text-slate-600 text-sm">
        {["Hư hỏng do va đập, rơi vỡ, bị ép lực", "Ngấm nước, ẩm ướt, tiếp xúc hóa chất", "Tự ý tháo lắp, sửa chữa không đúng kỹ thuật", "Tem bảo hành bị rách, tẩy xóa hoặc không còn", "Hư hỏng do thiên tai, hỏa hoạn, điện áp bất thường", "Sản phẩm hết hạn bảo hành"].map((item) => (
          <li key={item} className="flex items-start gap-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "lien-he",
    title: "Liên hệ bảo hành",
    content: (
      <div className="space-y-3 text-sm text-slate-600">
        <p><span className="font-semibold text-slate-900">Hotline bảo hành:</span> 1800 6789 (miễn phí, 8:00 – 20:00)</p>
        <p><span className="font-semibold text-slate-900">Email:</span> warranty@nitrotech.vn</p>
        <p><span className="font-semibold text-slate-900">Địa chỉ:</span> 123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
        <p><span className="font-semibold text-slate-900">Giờ tiếp nhận:</span> Thứ 2 – Chủ nhật, 8:00 – 18:00</p>
      </div>
    ),
  },
]

export function WarrantyAccordion() {
  const [openId, setOpenId] = useState<string | null>("dieu-kien")

  return (
    <div className="space-y-3">
      {accordionItems.map((item) => (
        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <button
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
            className="w-full flex items-center justify-between px-6 py-4 text-left cursor-pointer hover:bg-slate-50 transition-colors duration-150"
            aria-expanded={openId === item.id}
          >
            <span className="font-semibold text-slate-900">{item.title}</span>
            <svg
              viewBox="0 0 24 24"
              className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${openId === item.id ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          {openId === item.id && (
            <div className="px-6 pb-5 border-t border-slate-100 pt-4">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
