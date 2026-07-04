'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { login } from '@/lib/api/auth';
import { getFriendlyErrorMessage } from '@/lib/utils/errors';
import { OAuthButtons } from '@/components/auth/oauth-buttons';
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

function safeRedirect(value: string | null) {
  if (!value?.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginInput) {
    try {
      await login(data.email, data.password);

      toast.success('Đăng nhập thành công');
      router.replace(safeRedirect(searchParams.get('from')));
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Đăng nhập thất bại'));
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold">Đăng nhập</h1>
          <p className="text-sm text-muted-foreground">Chào mừng bạn quay lại NitroTech</p>
        </div>

        <OAuthButtons mode="login" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                autoComplete="email"
                {...register('email')}
                aria-invalid={!!errors.email}
                className="h-auto rounded-full px-4 py-3"
              />
              {errors.email && <FieldDescription>{errors.email.message}</FieldDescription>}
            </Field>

            <Field data-invalid={!!errors.password}>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
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
              {errors.password && <FieldDescription>{errors.password.message}</FieldDescription>}
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-auto w-full rounded-full py-3 font-semibold"
            >
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </FieldGroup>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
