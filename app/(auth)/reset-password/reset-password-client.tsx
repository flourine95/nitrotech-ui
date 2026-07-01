'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth';
import { resetPassword } from '@/lib/api/auth';
import { getFriendlyErrorMessage } from '@/lib/utils/errors';
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function ResetPasswordClient() {
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
      router.replace('/login');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Đặt lại mật khẩu thất bại'));
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
