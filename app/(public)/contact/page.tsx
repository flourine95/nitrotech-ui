import type { Metadata } from 'next';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { ContactForm } from './contact-form';

export const metadata: Metadata = { title: 'Liên hệ' };

const channels = [
  {
    title: 'Live Chat',
    desc: 'Phản hồi trong vòng 2 phút',
    detail: 'Thứ 2 – CN, 8:00 – 22:00',
    iconBg: 'bg-blue-100 text-blue-600',
    icon: MessageCircle,
  },
  {
    title: 'Hotline',
    desc: '1800 6789 (miễn phí)',
    detail: 'Thứ 2 – CN, 8:00 – 20:00',
    iconBg: 'bg-primary/10 text-primary',
    icon: Phone,
  },
  {
    title: 'Email',
    desc: 'support@nitrotech.vn',
    detail: 'Phản hồi trong 24 giờ',
    iconBg: 'bg-violet-100 text-violet-600',
    icon: Mail,
  },
];

export default function ContactPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Liên hệ với chúng tôi</h1>
        <p className="mb-10 text-muted-foreground">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Form */}
          <div className="rounded-2xl border border-border bg-card p-8">
            <ContactForm />
          </div>

          {/* Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="mb-5 text-lg font-bold text-foreground">Thông tin liên hệ</h2>
              <div className="flex flex-col gap-4">
                {[
                  {
                    label: 'Địa chỉ',
                    value: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
                    icon: MapPin,
                  },
                  {
                    label: 'Điện thoại',
                    value: '1800 6789 (miễn phí)',
                    icon: Phone,
                  },
                  {
                    label: 'Email',
                    value: 'support@nitrotech.vn',
                    icon: Mail,
                  },
                  {
                    label: 'Giờ làm việc',
                    value: 'Thứ 2 – Chủ nhật: 8:00 – 22:00',
                    icon: Clock,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="mb-0.5 text-xs text-muted-foreground">{item.label}</div>
                        <div className="text-sm font-medium text-foreground">{item.value}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="mb-4 text-lg font-bold text-foreground">Kênh hỗ trợ</h2>
              <div className="flex flex-col gap-3">
                {channels.map((c) => {
                  const Icon = c.icon;
                  return (
                    <div
                      key={c.title}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
                    >
                      <div
                        className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${c.iconBg}`}
                      >
                        <Icon className="size-6" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{c.title}</div>
                        <div className="text-sm text-foreground">{c.desc}</div>
                        <div className="text-xs text-muted-foreground">{c.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
