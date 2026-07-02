'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { type RegisterInput, registerSchema } from '@/schemas/auth';
import { register as registerUser } from '@/lib/api/auth';
import { ApiException } from '@/lib/api/client';
import { getFriendlyErrorMessage } from '@/lib/utils/errors';
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function RegisterForm() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = useWatch({ control, name: 'password' }) ?? '';
  const strength =
    password.length === 0
      ? 0
      : password.length < 6
        ? 1
        : password.length < 10
          ? 2
          : password.match(/[A-Z]/) && password.match(/[0-9]/)
            ? 4
            : 3;
  const strengthLabel = ['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength];
  const strengthColor = ['', 'bg-rose-400', 'bg-amber-400', 'bg-blue-500', 'bg-green-500'][
    strength
  ];

  async function goNext() {
    const ok = await trigger(['name', 'email']);
    if (ok) setStep(2);
  }

  async function onSubmit(data: RegisterInput) {
    try {
      await registerUser(data.name, data.email, data.password);
      setDone(true);
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === 'EMAIL_ALREADY_EXISTS') {
          setError('email', { message: 'Email này đã được đăng ký' });
          setStep(1);
        } else if (e.error.code === 'VALIDATION_ERROR' && e.error.errors) {
          Object.entries(e.error.errors).forEach(([field, msg]) =>
            setError(field as keyof RegisterInput, { message: msg }),
          );
        } else {
          toast.error(getFriendlyErrorMessage(e, 'Đăng ký thất bại'));
        }
      } else {
        toast.error(getFriendlyErrorMessage(e, 'Đăng ký thất bại'));
      }
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-3xl border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="size-8 text-green-600" aria-hidden="true" />
          </div>
          <h2 className="mb-2 text-xl font-bold">Đăng ký thành công!</h2>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            Chúng tôi đã gửi email xác thực đến hộp thư của bạn. Vui lòng kiểm tra và xác thực tài
            khoản trước khi đăng nhập.
          </p>
          <Button asChild className="h-auto rounded-full px-8 py-3 font-semibold">
            <Link href="/login">Đến trang đăng nhập</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold">Tạo tài khoản</h1>
          <p className="text-sm text-muted-foreground">Tham gia NitroTech để mua sắm dễ dàng hơn</p>
        </div>

        <div className="mb-8 flex items-center justify-center">
          <div
            className={`flex shrink-0 items-center gap-2 ${step > 1 ? 'text-green-600' : 'text-foreground'}`}
          >
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${step > 1 ? 'bg-green-100 text-green-600' : 'bg-foreground text-background'}`}
            >
              {step > 1 ? <CheckCircle2 className="size-3.5" aria-hidden="true" /> : 1}
            </div>
            <span className="whitespace-nowrap text-sm font-medium">Thông tin</span>
          </div>
          <div
            aria-hidden="true"
            className={`mx-4 h-px w-8 shrink-0 ${step > 1 ? 'bg-green-300' : 'bg-muted'}`}
          />
          <div
            className={`flex shrink-0 items-center gap-2 ${step === 2 ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <div
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${step === 2 ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'}`}
            >
              2
            </div>
            <span className="whitespace-nowrap text-sm font-medium">Bảo mật</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === 1 && (
            <FieldGroup>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="name">Họ và tên</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                  className="h-auto rounded-full px-4 py-3"
                />
                {errors.name && <FieldDescription>{errors.name.message}</FieldDescription>}
              </Field>

              <Field data-invalid={!!errors.email}>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  className="h-auto rounded-full px-4 py-3"
                />
                {errors.email && <FieldDescription>{errors.email.message}</FieldDescription>}
              </Field>

              <Button
                type="button"
                onClick={goNext}
                className="h-auto w-full rounded-full py-3 font-semibold"
              >
                Tiếp theo
              </Button>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <Field data-invalid={!!errors.password}>
                <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
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
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                    <p
                      className={`mt-1 text-xs ${['', 'text-rose-500', 'text-amber-600', 'text-blue-600', 'text-green-600'][strength]}`}
                    >
                      {strengthLabel}
                    </p>
                  </div>
                )}
                {errors.password && <FieldDescription>{errors.password.message}</FieldDescription>}
              </Field>

              <Field data-invalid={!!errors.confirmPassword}>
                <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    {...register('confirmPassword')}
                    aria-invalid={!!errors.confirmPassword}
                    className="h-auto rounded-full px-4 py-3 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                    aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showConfirm ? (
                      <EyeOff data-icon="inline-start" aria-hidden="true" />
                    ) : (
                      <Eye data-icon="inline-start" aria-hidden="true" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <FieldDescription>{errors.confirmPassword.message}</FieldDescription>
                )}
              </Field>

              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  {...register('terms')}
                  aria-invalid={!!errors.terms}
                  className="mt-0.5 size-4 shrink-0 cursor-pointer rounded accent-foreground"
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-sm leading-relaxed text-muted-foreground"
                >
                  Tôi đồng ý với{' '}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>
              {errors.terms && <FieldDescription>{errors.terms.message}</FieldDescription>}

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  variant="outline"
                  className="h-auto flex-1 rounded-full py-3 font-semibold"
                >
                  Quay lại
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-auto flex-1 rounded-full py-3 font-semibold"
                >
                  {isSubmitting && <Spinner data-icon="inline-start" />}
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </Button>
              </div>
            </FieldGroup>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
