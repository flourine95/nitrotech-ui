'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';

export default function CheckoutPage() {
  const [payMethod, setPayMethod] = useState('cod');
  const [step, setStep] = useState(1);

  const orderItems = [
    {
      name: 'MacBook Pro M4',
      variant: '16GB / 512GB',
      price: '42.990.000₫',
      qty: 1,
    },
    {
      name: 'RTX 4080 Super',
      variant: '16GB GDDR6X',
      price: '22.500.000₫',
      qty: 1,
    },
    {
      name: 'Samsung 990 Pro 2TB',
      variant: 'PCIe 4.0',
      price: '3.290.000₫',
      qty: 2,
    },
  ];

  const steps = ['Thông tin', 'Vận chuyển', 'Thanh toán'];

  return (
    <>
      <SiteHeader cartCount={3} />
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Step indicator */}
          <nav
            className="mb-10 flex items-center justify-center gap-0"
            aria-label="Các bước thanh toán"
          >
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <button
                  onClick={() => setStep(i + 1)}
                  className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${step === i + 1 ? 'bg-slate-900 text-white' : step > i + 1 ? 'text-green-600' : 'text-slate-400'}`}
                  aria-current={step === i + 1 ? 'step' : undefined}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${step === i + 1 ? 'bg-white text-slate-900' : step > i + 1 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}
                  >
                    {step > i + 1 ? (
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  {s}
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-1 h-px w-8 ${step > i + 1 ? 'bg-green-400' : 'bg-slate-200'}`}
                    aria-hidden="true"
                  />
                )}
              </div>
            ))}
          </nav>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* ── Form ── */}
            <div className="space-y-6 lg:col-span-3">
              {/* Shipping info */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-slate-900">Thông tin giao hàng</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    {
                      id: 'fname',
                      label: 'Họ',
                      placeholder: 'Nguyễn',
                      type: 'text',
                    },
                    {
                      id: 'lname',
                      label: 'Tên',
                      placeholder: 'Văn A',
                      type: 'text',
                    },
                    {
                      id: 'phone',
                      label: 'Số điện thoại',
                      placeholder: '0901 234 567',
                      type: 'tel',
                      full: true,
                    },
                    {
                      id: 'email',
                      label: 'Email',
                      placeholder: 'email@example.com',
                      type: 'email',
                      full: true,
                    },
                    {
                      id: 'address',
                      label: 'Địa chỉ',
                      placeholder: 'Số nhà, tên đường',
                      type: 'text',
                      full: true,
                    },
                    {
                      id: 'ward',
                      label: 'Phường/Xã',
                      placeholder: 'Phường 1',
                      type: 'text',
                    },
                    {
                      id: 'district',
                      label: 'Quận/Huyện',
                      placeholder: 'Quận 1',
                      type: 'text',
                    },
                  ].map((f) => (
                    <div key={f.id} className={f.full ? 'sm:col-span-2' : ''}>
                      <label
                        htmlFor={f.id}
                        className="mb-1.5 block text-sm font-medium text-slate-700"
                      >
                        {f.label}
                      </label>
                      <input
                        id={f.id}
                        type={f.type}
                        placeholder={f.placeholder}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="city"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Tỉnh/Thành phố
                    </label>
                    <select
                      id="city"
                      className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                    >
                      <option>TP. Hồ Chí Minh</option>
                      <option>Hà Nội</option>
                      <option>Đà Nẵng</option>
                      <option>Cần Thơ</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="note"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      id="note"
                      rows={2}
                      placeholder="Ghi chú cho đơn hàng..."
                      className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </section>

              {/* Shipping method */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-slate-900">Phương thức vận chuyển</h2>
                <div className="space-y-3">
                  {[
                    {
                      id: 'express',
                      label: 'Giao hàng nhanh 2 giờ',
                      desc: 'TP.HCM & Hà Nội',
                      price: 'Miễn phí',
                      badge: 'Khuyến nghị',
                    },
                    {
                      id: 'standard',
                      label: 'Giao hàng tiêu chuẩn',
                      desc: '1-2 ngày làm việc',
                      price: '30.000₫',
                    },
                    {
                      id: 'economy',
                      label: 'Giao hàng tiết kiệm',
                      desc: '3-5 ngày làm việc',
                      price: '15.000₫',
                    },
                  ].map((m, i) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors duration-200 ${i === 0 ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        defaultChecked={i === 0}
                        className="shrink-0 accent-slate-900"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{m.label}</span>
                          {m.badge && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              {m.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">{m.desc}</div>
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold ${i === 0 ? 'text-green-600' : 'text-slate-900'}`}
                      >
                        {m.price}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              {/* Payment method */}
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-slate-900">Phương thức thanh toán</h2>
                <div className="space-y-3">
                  {[
                    {
                      id: 'cod',
                      label: 'Thanh toán khi nhận hàng (COD)',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ),
                    },
                    {
                      id: 'card',
                      label: 'Thẻ tín dụng / Ghi nợ',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      ),
                    },
                    {
                      id: 'momo',
                      label: 'Ví MoMo',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-6a4 4 0 100-8 4 4 0 000 8z" />
                        </svg>
                      ),
                    },
                    {
                      id: 'bank',
                      label: 'Chuyển khoản ngân hàng',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 10v11M12 10v11M16 10v11" />
                        </svg>
                      ),
                    },
                    {
                      id: 'installment',
                      label: 'Trả góp 0% (12 tháng)',
                      icon: (
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M9 14l6-6M9 8h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                    },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors duration-200 ${payMethod === m.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={payMethod === m.id}
                        onChange={() => setPayMethod(m.id)}
                        className="shrink-0 accent-slate-900"
                      />
                      <span className="shrink-0 text-slate-500">{m.icon}</span>
                      <span className="text-sm font-medium text-slate-900">{m.label}</span>
                    </label>
                  ))}
                </div>

                {/* Card form */}
                {payMethod === 'card' && (
                  <div className="mt-4 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <div>
                      <label
                        htmlFor="card-number"
                        className="mb-1 block text-xs font-medium text-slate-600"
                      >
                        Số thẻ
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="card-expiry"
                          className="mb-1 block text-xs font-medium text-slate-600"
                        >
                          Ngày hết hạn
                        </label>
                        <input
                          id="card-expiry"
                          type="text"
                          placeholder="MM/YY"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="card-cvv"
                          className="mb-1 block text-xs font-medium text-slate-600"
                        >
                          CVV
                        </label>
                        <input
                          id="card-cvv"
                          type="text"
                          placeholder="123"
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm transition-colors duration-200 focus:border-blue-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* ── Order summary ── */}
            <div className="lg:col-span-2">
              <div className="sticky top-36 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-5 font-bold text-slate-900">Đơn hàng của bạn</h2>
                <div className="mb-5 space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.name} className="flex gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50">
                        <svg
                          viewBox="0 0 40 30"
                          className="h-auto w-8 text-slate-300"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          aria-hidden="true"
                        >
                          <rect x="2" y="2" width="36" height="26" rx="2" />
                          <rect
                            x="5"
                            y="5"
                            width="30"
                            height="20"
                            rx="1"
                            fill="rgba(59,130,246,0.04)"
                            stroke="rgba(59,130,246,0.15)"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm leading-snug font-medium text-slate-900">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.variant} × {item.qty}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-semibold text-slate-900">
                        {item.price}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-5 space-y-2.5 border-t border-slate-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tạm tính</span>
                    <span className="font-medium text-slate-900">68.780.000₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Vận chuyển</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Giảm giá</span>
                    <span className="font-medium text-rose-600">−500.000₫</span>
                  </div>
                </div>

                <div className="mb-6 border-t border-slate-100 pt-4">
                  <div className="flex justify-between">
                    <span className="font-bold text-slate-900">Tổng cộng</span>
                    <span className="text-xl font-bold text-slate-900">68.280.000₫</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Đã bao gồm VAT</p>
                </div>

                <button className="mb-3 w-full cursor-pointer rounded-full bg-blue-600 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500">
                  Đặt hàng ngay
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Thanh toán bảo mật 256-bit SSL
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4 text-center">
                  <Link
                    href="/cart"
                    className="flex cursor-pointer items-center justify-center gap-1 text-sm text-slate-500 transition-colors duration-150 hover:text-slate-900"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    Quay lại giỏ hàng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
