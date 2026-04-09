'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/schemas/auth';
import { resetPassword } from '@/lib/auth.api';
import { ApiException } from '@/lib/client';

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
        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              id="newPassword"
              type={showPass ? 'text' : 'password'}
              placeholder="Tối thiểu 6 ký tự"
              {...register('newPassword')}
              className={`w-full rounded-full border px-4 py-3 pr-12 text-sm placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:outline-none ${errors.newPassword ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
              aria-label={showPass ? 'Ẩn' : 'Hiện'}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1.5 text-xs text-rose-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Xác nhận mật khẩu
          </label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            {...register('confirmPassword')}
            className={`w-full rounded-full border px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:outline-none ${errors.confirmPassword ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
          />
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs text-rose-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Đang lưu...' : 'Đặt lại mật khẩu'}
        </button>
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
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
