import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { LoginClient } from './login-client';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md"><Spinner /></div>}>
      <LoginClient />
    </Suspense>
  );
}
