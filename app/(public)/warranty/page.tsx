import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WarrantyAccordion } from './warranty-accordion';

export const metadata: Metadata = { title: 'Chính sách bảo hành' };

export default function WarrantyPage() {
  return (
    <main className="bg-background">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </div>
            <h1 className="max-w-xl text-3xl font-bold tracking-tight text-foreground">
              Chính sách bảo hành
            </h1>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              NitroTech cam kết bảo hành chính hãng, minh bạch và nhanh chóng cho tất cả sản phẩm.
            </p>
          </div>

          <WarrantyAccordion />
        </section>

        <div className="mt-12 flex flex-col gap-5 rounded-2xl bg-muted/45 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Cần hỗ trợ bảo hành?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Đội ngũ kỹ thuật của chúng tôi luôn sẵn sàng hỗ trợ bạn.
            </p>
          </div>
          <Button asChild className="h-10 rounded-full px-5 sm:shrink-0">
            <Link href="/contact">Liên hệ ngay</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
