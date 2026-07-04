'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X } from 'lucide-react';
import { resendVerificationSchema, type ResendVerificationInput } from '@/schemas/auth';
import { verifyEmail, resendVerification } from '@/lib/api/auth';
import { getFriendlyErrorMessage } from '@/lib/utils/errors';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

type Status = 'loading' | 'success' | 'error';

export function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState('');
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResendVerificationInput>({
    resolver: zodResolver(resendVerificationSchema),
  });
  const currentStatus = token ? status : 'error';
  const currentMessage = token ? message : 'Token không hợp lệ hoặc đã hết hạn.';

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((error) => {
        setStatus('error');
        setMessage(getFriendlyErrorMessage(error, 'Xác thực thất bại. Token có thể đã hết hạn.'));
      });
  }, [token]);

  async function handleResend(data: ResendVerificationInput) {
    setResendError('');

    try {
      await resendVerification(data.email);
      setResent(true);
    } catch (error) {
      setResendError(getFriendlyErrorMessage(error, 'Gửi lại thất bại, vui lòng thử lại.'));
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border bg-card p-8 text-center shadow-lg">
        {currentStatus === 'loading' && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Spinner className="size-7 text-muted-foreground" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Đang xác thực...</h2>
            <p className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
          </>
        )}

        {currentStatus === 'success' && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="size-8 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Xác thực thành công!</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ.
            </p>
            <Link
              href="/login"
              className="inline-block cursor-pointer rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90"
            >
              Đăng nhập
            </Link>
          </>
        )}

        {currentStatus === 'error' && (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <X className="size-8 text-rose-600" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Xác thực thất bại</h2>
            <p className="mb-6 text-sm text-muted-foreground">{currentMessage}</p>

            {resent ? (
              <div className="rounded-2xl bg-green-100 px-4 py-3 text-sm text-green-600">
                Email xác thực đã được gửi lại. Vui lòng kiểm tra hộp thư.
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleResend)} className="text-left" noValidate>
                <p className="mb-3 text-center text-sm font-medium text-foreground">
                  Gửi lại email xác thực
                </p>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="Nhập email đã đăng ký"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  className="mb-3 h-auto rounded-full px-4 py-2.5"
                />
                {errors.email && <p className="mb-2 text-xs text-destructive">{errors.email.message}</p>}
                {resendError && <p className="mb-2 text-xs text-destructive">{resendError}</p>}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-auto w-full rounded-full py-2.5 font-semibold"
                >
                  {isSubmitting && <Spinner data-icon="inline-start" />}
                  {isSubmitting ? 'Đang gửi...' : 'Gửi lại'}
                </Button>
              </form>
            )}

            <Link
              href="/login"
              className="mt-4 block text-sm text-muted-foreground transition-colors duration-150 hover:text-foreground"
            >
              Về trang đăng nhập
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
