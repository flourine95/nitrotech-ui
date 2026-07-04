import { Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { LoginForm } from './login-form';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md"><Spinner /></div>}>
      <LoginForm />
    </Suspense>
  );
}
