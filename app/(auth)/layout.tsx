import Link from 'next/link';
import { ReactNode } from 'react';
import { LogoIcon } from '@/components/icons';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="public-theme relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Animated gradient orbs - subtle and natural */}
      <div className="absolute inset-0">
        <div className="absolute left-[10%] top-[20%] h-[500px] w-[500px] animate-pulse rounded-full bg-blue-400/15 blur-3xl" />
        <div className="absolute right-[10%] bottom-[20%] h-[500px] w-[500px] animate-pulse rounded-full bg-slate-400/15 blur-3xl delay-1000" />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content with fade-in animation */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 px-6 duration-700">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="group flex items-center gap-2.5 transition-transform hover:scale-105">
            <LogoIcon className="h-8 w-8 text-slate-900 transition-colors group-hover:text-blue-600" />
            <span className="text-2xl font-bold text-slate-900">
              Nitro<span className="text-blue-600">Tech</span>
            </span>
          </Link>
        </div>

        {/* Main content */}
        {children}
      </div>
    </div>
  );
}
