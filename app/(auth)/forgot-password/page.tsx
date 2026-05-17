'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/schemas/auth';
import { forgotPassword } from '@/lib/api/auth';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
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
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        {!sent ? (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
                <Mail className="h-7 w-7 text-blue-600" aria-hidden="true" />
              </div>
              <h1 className="mb-1 text-2xl font-bold text-slate-900">Quên mật khẩu?</h1>
              <p className="text-sm text-slate-500">Nhập email để nhận link đặt lại mật khẩu</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
            </form>
          </>
        ) : (
          <div className="py-4 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" aria-hidden="true" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">Đã gửi email!</h2>
            <p className="mb-1 text-sm leading-relaxed text-slate-500">
              Nếu <span className="font-medium text-slate-700">{submittedEmail}</span> tồn tại trong
              hệ thống, bạn sẽ nhận được link đặt lại mật khẩu.
            </p>
            <p className="mb-6 text-sm text-slate-400">Link có hiệu lực trong 30 phút.</p>
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
