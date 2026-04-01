export default function DashboardSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Cài đặt</h1>
        <p className="text-sm text-slate-500 mt-1">Quản lý cấu hình hệ thống</p>
      </div>

      {/* General */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Thông tin chung</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tên cửa hàng</label>
            <input type="text" defaultValue="NitroTech" className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Email liên hệ</label>
            <input type="email" defaultValue="contact@nitrotech.vn" className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Số điện thoại</label>
            <input type="tel" defaultValue="1900 1234" className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Thông báo</h2>
        <div className="space-y-3">
          {[
            { label: "Đơn hàng mới", desc: "Nhận thông báo khi có đơn hàng mới", checked: true },
            { label: "Sắp hết hàng", desc: "Cảnh báo khi sản phẩm dưới 10 sản phẩm", checked: true },
            { label: "Đánh giá mới", desc: "Thông báo khi khách hàng đánh giá sản phẩm", checked: false },
            { label: "Báo cáo hàng tuần", desc: "Gửi báo cáo doanh thu qua email", checked: true },
          ].map((item) => (
            <label key={item.label} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <input type="checkbox" defaultChecked={item.checked} className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer" />
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{item.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Phương thức thanh toán</h2>
        <div className="space-y-3">
          {[
            { name: "Chuyển khoản ngân hàng", enabled: true },
            { name: "Thanh toán khi nhận hàng (COD)", enabled: true },
            { name: "Ví điện tử (MoMo, ZaloPay)", enabled: true },
            { name: "Thẻ tín dụng/ghi nợ", enabled: false },
          ].map((method) => (
            <div key={method.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="text-sm text-slate-700">{method.name}</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={method.enabled} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-3">
        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">
          Hủy
        </button>
        <button className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer">
          Lưu thay đổi
        </button>
      </div>
    </div>
  )
}
