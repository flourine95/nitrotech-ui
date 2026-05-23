'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth';
import { resetPassword } from '@/lib/api/auth';
import { ApiException } from '@/lib/api/client';
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordInput) {
    try {
      await resetPassword(token, data.newPassword);
      toast.success('Đặt lại mật khẩu thành công');
      router.push('/login');
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === 'INVALID_RESET_TOKEN') {
          toast.error('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
        } else {
          toast.error(e.error.message);
        }
      }
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm text-muted-foreground">Link không hợp lệ.</p>
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Yêu cầu link mới
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="mb-1 text-2xl font-bold">Đặt lại mật khẩu</h1>
        <p className="text-sm text-muted-foreground">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={!!errors.newPassword}>
            <FieldLabel htmlFor="newPassword">Mật khẩu mới</FieldLabel>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPass ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                {...register('newPassword')}
                aria-invalid={!!errors.newPassword}
                className="h-auto rounded-full px-4 py-3 pr-12"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPass(!showPass)}
                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPass ? (
                  <EyeOff data-icon="inline-start" aria-hidden="true" />
                ) : (
                  <Eye data-icon="inline-start" aria-hidden="true" />
                )}
              </Button>
            </div>
            {errors.newPassword && (
              <FieldDescription>{errors.newPassword.message}</FieldDescription>
            )}
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Nhập lại mật khẩu"
              {...register('confirmPassword')}
              aria-invalid={!!errors.confirmPassword}
              className="h-auto rounded-full px-4 py-3"
            />
            {errors.confirmPassword && (
              <FieldDescription>{errors.confirmPassword.message}</FieldDescription>
            )}
          </Field>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-auto w-full rounded-full py-3 font-semibold"
          >
            {isSubmitting && <Spinner data-icon="inline-start" />}
            {isSubmitting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
          </Button>
        </FieldGroup>
      </form>
    </>
  );
}

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
