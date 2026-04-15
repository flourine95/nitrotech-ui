export default function DashboardSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt</h1>
        <p className="mt-1 text-sm text-slate-500">Quản lý cấu hình hệ thống</p>
      </div>

      {/* General */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">Thông tin chung</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tên cửa hàng</label>
            <input
              type="text"
              defaultValue="NitroTech"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email liên hệ</label>
            <input
              type="email"
              defaultValue="contact@nitrotech.vn"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Số điện thoại</label>
            <input
              type="tel"
              defaultValue="1900 1234"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">Thông báo</h2>
        <div className="space-y-3">
          {[
            {
              label: 'Đơn hàng mới',
              desc: 'Nhận thông báo khi có đơn hàng mới',
              checked: true,
            },
            {
              label: 'Sắp hết hàng',
              desc: 'Cảnh báo khi sản phẩm dưới 10 sản phẩm',
              checked: true,
            },
            {
              label: 'Đánh giá mới',
              desc: 'Thông báo khi khách hàng đánh giá sản phẩm',
              checked: false,
            },
            {
              label: 'Báo cáo hàng tuần',
              desc: 'Gửi báo cáo doanh thu qua email',
              checked: true,
            },
          ].map((item) => (
            <label
              key={item.label}
              className="flex cursor-pointer items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50"
            >
              <input
                type="checkbox"
                defaultChecked={item.checked}
                className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{item.label}</div>
                <div className="mt-0.5 text-xs text-slate-500">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-slate-900">Phương thức thanh toán</h2>
        <div className="space-y-3">
          {[
            { name: 'Chuyển khoản ngân hàng', enabled: true },
            { name: 'Thanh toán khi nhận hàng (COD)', enabled: true },
            { name: 'Ví điện tử (MoMo, ZaloPay)', enabled: true },
            { name: 'Thẻ tín dụng/ghi nợ', enabled: false },
          ].map((method) => (
            <div
              key={method.name}
              className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-slate-50"
            >
              <span className="text-sm text-slate-700">{method.name}</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked={method.enabled} className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-slate-200 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-500 after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        <button className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">
          Hủy
        </button>
        <button className="cursor-pointer rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
}
