'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { GoogleIcon, FacebookIcon } from '@/components/icons';
import { loginSchema, type LoginInput } from '@/schemas/auth';
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

function LoginForm() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const code = err?.data?.code ?? err?.code ?? '';
        const msg = err?.data?.message ?? err?.message ?? 'Đăng nhập thất bại';
        if (code === 'ACCOUNT_NOT_ACTIVE') {
          toast.error('Tài khoản chưa xác thực email');
        } else if (code === 'INVALID_CREDENTIALS') {
          toast.error('Email hoặc mật khẩu không đúng');
        } else {
          toast.error(msg);
        }
        return;
      }

      toast.success('Đăng nhập thành công');
      router.push(searchParams.get('from') ?? '/');
      router.refresh();
    } catch {
      toast.error('Đăng nhập thất bại');
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition-shadow hover:shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold text-slate-900">Đăng nhập</h1>
          <p className="text-sm text-slate-500">Chào mừng bạn quay lại NitroTech</p>
        </div>

        {/* Social login */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-auto rounded-full py-2.5"
          >
            <GoogleIcon className="size-4" />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-auto rounded-full py-2.5"
          >
            <FacebookIcon className="size-4 text-[#0866FF]" />
            Facebook
          </Button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">hoặc đăng nhập bằng email</span>
          <Separator className="flex-1" />
        </div>

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
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
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
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md"><Spinner /></div>}>
      <LoginForm />
    </Suspense>
  );
}
