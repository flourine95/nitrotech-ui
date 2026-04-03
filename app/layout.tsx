import { Be_Vietnam_Pro } from 'next/font/google';
import type { Metadata } from 'next';
import './globals.css';
import { ProgressBar } from '@/components/progress-bar';
import { ScrollToTop } from '@/components/scroll-to-top';
import { CompareProvider } from '@/components/compare-bar';
import { Toaster } from '@/components/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { NextAuthProvider } from '@/components/session-provider';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'NitroTech — Linh kiện điện tử, Laptop & Máy tính',
    template: '%s | NitroTech',
  },
  description:
    'Mua sắm linh kiện điện tử, laptop, PC chính hãng với giá tốt nhất. Giao hàng nhanh, bảo hành uy tín.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning className={beVietnamPro.variable}>
      <body className="bg-[#F8FAFC] font-sans text-[#0F172A] antialiased">
        <ProgressBar />
        <NextAuthProvider>
          <TooltipProvider>
            <CompareProvider>{children}</CompareProvider>
          </TooltipProvider>
          <Toaster />
          <ScrollToTop />
        </NextAuthProvider>
      </body>
    </html>
  );
}
