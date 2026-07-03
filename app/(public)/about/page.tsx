import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Headphones, ShieldCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Về NitroTech' };

const stats = [
  { value: '10+', label: 'Năm kinh nghiệm' },
  { value: '200K+', label: 'Khách hàng' },
  { value: '50K+', label: 'Sản phẩm' },
];

const values = [
  {
    title: 'Hàng chính hãng',
    desc: 'Sản phẩm có nguồn gốc rõ ràng từ nhà phân phối và thương hiệu uy tín.',
    icon: ShieldCheck,
    href: '/products',
    linkLabel: 'Xem danh mục',
  },
  {
    title: 'Tư vấn đúng nhu cầu',
    desc: 'Đội ngũ bán hàng ưu tiên cấu hình phù hợp thay vì đẩy khách mua quá mức.',
    icon: Headphones,
    href: '/contact',
    linkLabel: 'Liên hệ tư vấn',
  },
  {
    title: 'Giao nhanh',
    desc: 'Tối ưu quy trình xử lý đơn để khách nhận hàng sớm và theo dõi được trạng thái.',
    icon: Truck,
    href: '/shipping',
    linkLabel: 'Chính sách vận chuyển',
  },
  {
    title: 'Hậu mãi rõ ràng',
    desc: 'Chính sách bảo hành, đổi trả và hỗ trợ sau bán được trình bày minh bạch.',
    icon: BadgeCheck,
    href: '/warranty',
    linkLabel: 'Chính sách bảo hành',
  },
];

export default function AboutPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24">
        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-foreground md:text-5xl">
              NitroTech
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Hệ thống bán lẻ linh kiện điện tử, laptop và máy tính tập trung vào hàng chính hãng,
              tư vấn thực tế và trải nghiệm mua sắm rõ ràng.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild className="h-10 rounded-full px-5">
                <Link href="/products">
                  Xem sản phẩm
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-10 rounded-full px-5">
                <Link href="/contact">Liên hệ tư vấn</Link>
              </Button>
            </div>
          </div>

          <div className="border-l border-border pl-8 max-lg:border-l-0 max-lg:border-t max-lg:pt-6 max-lg:pl-0">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Quy mô vận hành</p>
            <div className="grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
            </div>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-sm font-semibold text-primary">Cách chúng tôi làm việc</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">Bán công nghệ bằng sự rõ ràng</h2>
            <p className="mt-4 leading-7 text-muted-foreground">
              NitroTech chọn cách giữ thông tin sản phẩm, giá, tồn kho và chính sách hậu mãi dễ hiểu.
              Khách hàng có thể tự so sánh, đặt hàng và nhận hỗ trợ mà không phải đoán bước tiếp theo.
            </p>
          </div>

          <div className="divide-y divide-border rounded-2xl border bg-card">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <article key={value.title} className="flex gap-4 p-5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{value.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{value.desc}</p>
                    <Link
                      href={value.href}
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {value.linkLabel}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-20 flex flex-col gap-5 rounded-2xl bg-muted/45 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cần cấu hình phù hợp?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Gửi nhu cầu sử dụng, ngân sách và thời gian nhận hàng, đội ngũ NitroTech sẽ tư vấn.
            </p>
          </div>
          <Button asChild className="h-10 rounded-full px-5 sm:shrink-0">
            <Link href="/contact">
              Bắt đầu tư vấn
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
