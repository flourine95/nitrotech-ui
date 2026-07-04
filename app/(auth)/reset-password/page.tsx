import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResetPasswordForm } from './reset-password-form';

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border bg-card p-8 shadow-lg">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}>
          <ResetPasswordForm />
        </Suspense>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
