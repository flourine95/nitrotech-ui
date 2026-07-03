import type { Metadata } from 'next';
import { CheckSquare, Home, ShoppingBag, Truck } from 'lucide-react';
import { ShippingFaq } from './shipping-faq';

export const metadata: Metadata = { title: 'Chính sách vận chuyển' };

const shippingTable = [
  {
    region: 'TP. Hồ Chí Minh',
    standard: 'Miễn phí',
    express: '15.000đ',
    sameDay: '30.000đ',
  },
  {
    region: 'Hà Nội',
    standard: 'Miễn phí',
    express: '20.000đ',
    sameDay: 'Không hỗ trợ',
  },
  {
    region: 'Đà Nẵng',
    standard: 'Miễn phí',
    express: '25.000đ',
    sameDay: 'Không hỗ trợ',
  },
  {
    region: 'Tỉnh thành khác',
    standard: '30.000đ',
    express: '50.000đ',
    sameDay: 'Không hỗ trợ',
  },
  {
    region: 'Vùng sâu / xa',
    standard: '50.000đ',
    express: 'Không hỗ trợ',
    sameDay: 'Không hỗ trợ',
  },
];

const deliverySteps = [
  {
    icon: ShoppingBag,
    title: 'Đặt hàng',
    desc: 'Chọn sản phẩm và hoàn tất thanh toán trên website hoặc ứng dụng.',
  },
  {
    icon: CheckSquare,
    title: 'Xác nhận đơn',
    desc: 'Hệ thống xác nhận và kho hàng chuẩn bị đơn trong 1–2 giờ.',
  },
  {
    icon: Truck,
    title: 'Vận chuyển',
    desc: 'Đơn hàng được bàn giao cho đối tác vận chuyển và cập nhật tracking.',
  },
  {
    icon: Home,
    title: 'Giao thành công',
    desc: 'Nhận hàng, kiểm tra và xác nhận. Liên hệ ngay nếu có vấn đề.',
  },
];

const partners = [
  { name: 'GHN', desc: 'Giao Hàng Nhanh' },
  { name: 'GHTK', desc: 'Giao Hàng Tiết Kiệm' },
  { name: 'VNPost', desc: 'Bưu điện Việt Nam' },
  { name: 'J&T', desc: 'J&T Express' },
];

export default function ShippingPage() {
  return (
    <main>
        <div className="mx-auto max-w-4xl px-6 py-16">
          <h1 className="mb-2 text-3xl font-bold text-foreground">Chính sách vận chuyển</h1>
          <p className="mb-10 text-muted-foreground">Giao hàng nhanh chóng, an toàn trên toàn quốc.</p>

          {/* Shipping table */}
          <section className="mb-12">
            <h2 className="mb-4 text-xl font-bold text-foreground">Bảng phí vận chuyển</h2>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="px-5 py-3.5 text-left font-semibold text-foreground">Khu vực</th>
                    <th className="px-5 py-3.5 text-left font-semibold text-foreground">
                      Tiêu chuẩn (2–4 ngày)
                    </th>
                    <th className="px-5 py-3.5 text-left font-semibold text-foreground">
                      Nhanh (1–2 ngày)
                    </th>
                    <th className="px-5 py-3.5 text-left font-semibold text-foreground">
                      Hỏa tốc (2–4 giờ)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shippingTable.map((row, i) => (
                    <tr key={row.region} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                      <td className="px-5 py-3.5 font-medium text-foreground">{row.region}</td>
                      <td className="px-5 py-3.5 font-medium text-primary">{row.standard}</td>
                      <td className="px-5 py-3.5 text-foreground">{row.express}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{row.sameDay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              * Miễn phí vận chuyển tiêu chuẩn cho đơn hàng từ 500.000đ
            </p>
          </section>

          {/* Steps */}
          <section className="mb-12">
            <h2 className="mb-6 text-xl font-bold text-foreground">Quy trình giao hàng</h2>
            <div className="grid gap-4 sm:grid-cols-4">
              {deliverySteps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="rounded-2xl border border-border bg-card p-5 text-center"
                  >
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <Icon className="size-6" aria-hidden="true" />
                    </div>
                    <div className="mb-1 text-sm font-semibold text-foreground">{s.title}</div>
                    <div className="text-xs leading-relaxed text-muted-foreground">{s.desc}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-12">
            <h2 className="mb-5 text-xl font-bold text-foreground">Câu hỏi thường gặp</h2>
            <ShippingFaq />
          </section>

          {/* Partners */}
          <section>
            <h2 className="mb-5 text-xl font-bold text-foreground">Đối tác vận chuyển</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {partners.map((p) => (
                <div
                  key={p.name}
                  className="rounded-2xl border border-border bg-card p-5 text-center"
                >
                  <div className="mb-1 text-lg font-bold text-foreground">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.desc}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
  );
}
