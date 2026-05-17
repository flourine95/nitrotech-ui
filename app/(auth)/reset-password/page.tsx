'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/auth';
import { resetPassword } from '@/lib/api/auth';
import { ApiException } from '@/lib/client';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
        <p className="mb-4 text-sm text-slate-500">Link không hợp lệ.</p>
        <Link
          href="/forgot-password"
          className="cursor-pointer text-sm text-blue-600 hover:text-blue-700"
        >
          Yêu cầu link mới
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Đặt lại mật khẩu</h1>
        <p className="text-sm text-slate-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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
          {isSubmitting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
        </Button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-100" />}>
          <ResetPasswordForm />
        </Suspense>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="flex cursor-pointer items-center justify-center gap-1.5 text-sm text-slate-500 transition-colors duration-150 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
