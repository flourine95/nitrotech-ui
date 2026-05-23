'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth';
import { forgotPassword } from '@/lib/api/auth';
import { FieldGroup, Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordInput) {
    try {
      await forgotPassword(data.email);
      setSubmittedEmail(data.email);
      setSent(true);
    } catch {
      // API luôn trả 200 kể cả email không tồn tại (chống email enumeration)
      // nên lỗi ở đây chỉ là network error
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border bg-card p-8 shadow-lg">
        {!sent ? (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50">
                <Mail className="size-7 text-blue-600" aria-hidden="true" />
              </div>
              <h1 className="mb-1 text-2xl font-bold">Quên mật khẩu?</h1>
              <p className="text-sm text-muted-foreground">Nhập email để nhận link đặt lại mật khẩu</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <FieldGroup>
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
                  type="submit"
                  disabled={isSubmitting}
                  className="h-auto w-full rounded-full py-3 font-semibold"
                >
                  {isSubmitting ? 'Đang gửi...' : 'Gửi link đặt lại'}
                </Button>
              </FieldGroup>
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="size-8 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Đã gửi email!</h2>
            <p className="mb-1 text-sm leading-relaxed text-muted-foreground">
              Nếu <span className="font-medium text-foreground">{submittedEmail}</span> tồn tại trong
              hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.
            </p>
            <p className="mb-6 text-sm text-muted-foreground">Link có hiệu lực trong 30 phút.</p>
            <Button
              type="button"
              onClick={() => setSent(false)}
              variant="ghost"
              className="h-auto rounded-full px-4 py-2"
            >
              Gửi lại email
            </Button>
          </div>
        )}

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
