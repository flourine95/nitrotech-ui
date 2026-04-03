'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema, type RegisterInput } from '@/lib/schemas/auth';
import { register as registerUser } from '@/lib/auth-api';
import { ApiException } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const password = watch('password', '');
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
          toast.error(e.error.message);
        }
      }
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 fill-current text-green-600"
              aria-hidden="true"
            >
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">Đăng ký thành công!</h2>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            Chúng tôi đã gửi email xác thực đến hộp thư của bạn. Vui lòng kiểm tra và xác thực tài
            khoản trước khi đăng nhập.
          </p>
          <Link
            href="/login"
            className="inline-block cursor-pointer rounded-full bg-slate-900 px-8 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
          >
            Đến trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-1 text-2xl font-bold text-slate-900">Tạo tài khoản</h1>
          <p className="text-sm text-slate-500">Tham gia NitroTech để mua sắm dễ dàng hơn</p>
        </div>

        {/* Step indicator */}
        <div className="mb-8 flex items-center gap-2">
          {['Thông tin', 'Bảo mật'].map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div
                className={`flex flex-1 items-center gap-2 ${i < step - 1 ? 'text-green-600' : i === step - 1 ? 'text-slate-900' : 'text-slate-300'}`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors duration-200 ${i < step - 1 ? 'bg-green-100 text-green-600' : i === step - 1 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}
                >
                  {i < step - 1 ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3.5 w-3.5 fill-current"
                      aria-hidden="true"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-medium">{s}</span>
              </div>
              {i < 1 && (
                <div className={`mx-3 h-px flex-1 ${step > 1 ? 'bg-green-300' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Họ và tên
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register('name')}
                  className={`w-full rounded-full border px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:outline-none ${errors.name ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs text-rose-500">{errors.name.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  {...register('email')}
                  className={`w-full rounded-full border px-4 py-3 text-sm placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:outline-none ${errors.email ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-rose-500">{errors.email.message}</p>
                )}
              </div>
              <button
                type="button"
                onClick={goNext}
                className="w-full cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
              >
                Tiếp theo
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Tối thiểu 6 ký tự"
                    {...register('password')}
                    className={`w-full rounded-full border px-4 py-3 pr-12 text-sm placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:outline-none ${errors.password ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
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
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i <= strength ? strengthColor : 'bg-slate-200'}`}
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
                {errors.password && (
                  <p className="mt-1.5 text-xs text-rose-500">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    {...register('confirmPassword')}
                    className={`w-full rounded-full border px-4 py-3 pr-12 text-sm placeholder-slate-400 transition-all duration-200 focus:ring-2 focus:outline-none ${errors.confirmPassword ? 'border-rose-400 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-400 focus:ring-blue-100'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
                    aria-label={showConfirm ? 'Ẩn' : 'Hiện'}
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
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-rose-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  id="terms"
                  type="checkbox"
                  required
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-slate-900"
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-sm leading-relaxed text-slate-600"
                >
                  Tôi đồng ý với{' '}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </Link>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 cursor-pointer rounded-full border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:bg-slate-100"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 cursor-pointer rounded-full bg-slate-900 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="cursor-pointer font-medium text-blue-600 transition-colors duration-150 hover:text-blue-700"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
