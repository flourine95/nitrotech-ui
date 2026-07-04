import type { Metadata } from 'next';
import { AlertCircle, Check, PackageOpen, RefreshCw, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ReturnsFaq } from './returns-faq';

export const metadata: Metadata = { title: 'Chính sách đổi trả' };

const conditions = [
  {
    title: 'Sản phẩm lỗi kỹ thuật',
    desc: 'Sản phẩm bị lỗi do nhà sản xuất, không hoạt động đúng chức năng khi nhận hàng.',
    iconBg: 'bg-blue-100 text-blue-600',
    icon: AlertCircle,
  },
  {
    title: 'Sai sản phẩm / Thiếu phụ kiện',
    desc: 'Nhận được sản phẩm không đúng với đơn đặt hàng hoặc thiếu phụ kiện đi kèm.',
    iconBg: 'bg-amber-100 text-amber-600',
    icon: PackageOpen,
  },
  {
    title: 'Đổi ý trong 7 ngày',
    desc: 'Đổi sang sản phẩm khác trong 7 ngày nếu sản phẩm còn nguyên hộp, chưa kích hoạt.',
    iconBg: 'bg-primary/10 text-primary',
    icon: RefreshCw,
  },
];

const returnSteps = [
  {
    step: '01',
    title: 'Yêu cầu đổi trả',
    desc: 'Liên hệ hotline 1800 6789 hoặc tạo yêu cầu trong tài khoản của bạn.',
  },
  {
    step: '02',
    title: 'Xác nhận yêu cầu',
    desc: 'Nhân viên xem xét và xác nhận yêu cầu trong vòng 2 giờ làm việc.',
  },
  {
    step: '03',
    title: 'Gửi sản phẩm về',
    desc: 'Đóng gói sản phẩm cẩn thận và gửi về địa chỉ kho của NitroTech.',
  },
  {
    step: '04',
    title: 'Kiểm tra sản phẩm',
    desc: 'Kỹ thuật viên kiểm tra tình trạng sản phẩm trong 1–2 ngày làm việc.',
  },
  {
    step: '05',
    title: 'Hoàn tiền / Đổi mới',
    desc: 'Hoàn tiền trong 3–5 ngày làm việc hoặc giao sản phẩm mới trong 2–3 ngày.',
  },
];

const returnTable = [
  {
    product: 'Laptop, PC Desktop',
    canReturn: true,
    note: 'Trong 30 ngày, còn nguyên hộp',
  },
  {
    product: 'CPU, GPU, RAM, SSD',
    canReturn: true,
    note: 'Trong 30 ngày, chưa lắp đặt',
  },
  {
    product: 'Màn hình',
    canReturn: true,
    note: 'Trong 30 ngày, còn nguyên hộp',
  },
  {
    product: 'Bàn phím, Chuột',
    canReturn: true,
    note: 'Trong 7 ngày, còn nguyên hộp',
  },
  {
    product: 'Phần mềm, License key',
    canReturn: false,
    note: 'Không hỗ trợ đổi trả',
  },
  {
    product: 'Sản phẩm đã kích hoạt',
    canReturn: false,
    note: 'Trừ trường hợp lỗi kỹ thuật',
  },
  {
    product: 'Sản phẩm đã qua sử dụng',
    canReturn: false,
    note: 'Không hỗ trợ đổi trả',
  },
];

export default function ReturnsPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <section>
          <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RefreshCw className="size-6" aria-hidden="true" />
          </div>
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight text-foreground">
            Đổi trả dễ dàng trong 30 ngày
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            Chúng tôi cam kết quy trình đổi trả minh bạch, nhanh chóng và không rắc rối.
          </p>
        </section>

      <div className="mt-12 flex flex-col gap-14">
        {/* Conditions */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-foreground">Điều kiện đổi trả</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {conditions.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border bg-card p-6"
                >
                  <div
                    className={`mb-4 flex size-12 items-center justify-center rounded-xl ${c.iconBg}`}
                  >
                    <Icon className="size-6" aria-hidden="true" />
                  </div>
                  <h3 className="mb-2 text-sm font-bold text-foreground">{c.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{c.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Steps */}
        <section>
          <h2 className="mb-6 text-xl font-bold text-foreground">Quy trình đổi trả</h2>
          <div className="flex flex-col gap-4">
            {returnSteps.map((s) => (
              <div
                key={s.step}
                className="flex gap-4 rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {s.step}
                </div>
                <div>
                  <div className="mb-1 font-semibold text-foreground">{s.title}</div>
                  <div className="text-sm text-muted-foreground">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Table */}
        <section>
          <h2 className="mb-5 text-xl font-bold text-foreground">
            Sản phẩm được / không được đổi trả
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="px-5 py-3.5 text-left font-semibold text-foreground">Sản phẩm</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-foreground">Đổi trả</th>
                  <th className="px-5 py-3.5 text-left font-semibold text-foreground">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {returnTable.map((row, i) => (
                  <tr key={row.product} className={i % 2 === 0 ? 'bg-card' : 'bg-muted/50'}>
                    <td className="px-5 py-3.5 font-medium text-foreground">{row.product}</td>
                    <td className="px-5 py-3.5">
                      {row.canReturn ? (
                        <Badge variant="secondary">
                          <Check data-icon="inline-start" aria-hidden="true" />
                          Được
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <X data-icon="inline-start" aria-hidden="true" />
                          Không
                        </Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="mb-5 text-xl font-bold text-foreground">Câu hỏi thường gặp</h2>
          <ReturnsFaq />
        </section>
        </div>
      </div>
    </main>
  );
}
