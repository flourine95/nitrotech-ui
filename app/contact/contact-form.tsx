"use client"
import { useState } from "react"

const subjects = [
  "Tư vấn sản phẩm",
  "Hỗ trợ đơn hàng",
  "Bảo hành & Sửa chữa",
  "Đổi trả hàng",
  "Hợp tác kinh doanh",
  "Khác",
]

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Gửi thành công!</h2>
        <p className="text-slate-500 mb-6">Chúng tôi sẽ phản hồi bạn trong vòng 24 giờ.</p>
        <button
          onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }) }}
          className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 transition-colors duration-200 cursor-pointer"
        >
          Gửi tin nhắn khác
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Gửi tin nhắn</h2>
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
        <input
          id="name" type="text" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nguyễn Văn A"
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">Email <span className="text-rose-500">*</span></label>
          <input
            id="email" type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="email@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
          <input
            id="phone" type="tel" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0912 345 678"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1.5">Chủ đề <span className="text-rose-500">*</span></label>
        <select
          id="subject" required value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 bg-white cursor-pointer"
        >
          <option value="">Chọn chủ đề...</option>
          {subjects.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung <span className="text-rose-500">*</span></label>
        <textarea
          id="message" required rows={5} value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Mô tả chi tiết vấn đề của bạn..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all duration-200 resize-none"
        />
      </div>
      <button type="submit" className="w-full py-3 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-700 transition-colors duration-200 cursor-pointer">
        Gửi tin nhắn
      </button>
    </form>
  )
}
