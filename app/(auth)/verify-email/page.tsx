import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { VerifyEmailContent } from './verify-email-content';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="rounded-3xl border bg-card p-8 text-center shadow-lg">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Spinner className="size-7 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Đang tải...</h2>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
