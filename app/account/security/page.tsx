"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { changePasswordSchema, type ChangePasswordInput } from "@/lib/schemas/auth"
import { changePassword, logoutAll } from "@/lib/auth-api"
import { ApiException } from "@/lib/api"

export default function SecurityPage() {
  const router = useRouter()
  const [twoFA, setTwoFA] = useState(false)
  const [showFields, setShowFields] = useState({ current: false, new: false, confirm: false })

  const toggle = (f: keyof typeof showFields) =>
    setShowFields((p) => ({ ...p, [f]: !p[f] }))

  const { register, handleSubmit, reset, setError, formState: { errors, isSubmitting } } =
    useForm<ChangePasswordInput>({ resolver: zodResolver(changePasswordSchema) })

  async function onSubmit(data: ChangePasswordInput) {
    try {
      await changePassword(data.currentPassword, data.newPassword)
      toast.success("Đã cập nhật mật khẩu")
      reset()
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === "INVALID_CREDENTIALS") {
          setError("currentPassword", { message: "Mật khẩu hiện tại không đúng" })
        } else if (e.error.errors) {
          Object.entries(e.error.errors).forEach(([f, msg]) =>
            setError(f as keyof ChangePasswordInput, { message: msg })
          )
        } else {
          toast.error(e.error.message)
        }
      }
    }
  }

  async function handleLogoutAll() {
    try {
      await logoutAll()
      toast.success("Đã đăng xuất tất cả thiết bị")
      router.push("/login")
    } catch {
      toast.error("Có lỗi xảy ra")
    }
  }

  const eyeIcon = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-slate-900">Bảo mật tài khoản</h1>

      {/* Change password */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-bold text-slate-900">Đổi mật khẩu</h2>
        <form className="max-w-md space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {([
            { id: "currentPassword", label: "Mật khẩu hiện tại", field: "current" as const },
            { id: "newPassword", label: "Mật khẩu mới", field: "new" as const },
            { id: "confirmPassword", label: "Xác nhận mật khẩu mới", field: "confirm" as const },
          ] as const).map((f) => (
            <div key={f.id}>
              <label htmlFor={f.id} className="mb-1.5 block text-sm font-medium text-slate-700">{f.label}</label>
              <div className="relative">
                <input
                  id={f.id}
                  type={showFields[f.field] ? "text" : "password"}
                  placeholder="••••••••"
                  {...register(f.id)}
                  className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm transition-all duration-200 focus:ring-2 focus:outline-none ${errors[f.id] ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"}`}
                />
                <button type="button" onClick={() => toggle(f.field)} className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700" aria-label={showFields[f.field] ? "Ẩn" : "Hiện"}>
                  {eyeIcon}
                </button>
              </div>
              {errors[f.id] && <p className="mt-1.5 text-xs text-rose-500">{errors[f.id]?.message}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cursor-pointer rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </button>
        </form>
      </div>

      {/* 2FA */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="mb-1 font-bold text-slate-900">Xác thực 2 bước (2FA)</h2>
            <p className="max-w-md text-sm text-slate-500">Tăng cường bảo mật bằng cách yêu cầu mã xác thực mỗi khi đăng nhập từ thiết bị mới.</p>
          </div>
          <button
            onClick={() => setTwoFA(!twoFA)}
            className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${twoFA ? "bg-green-500" : "bg-slate-200"}`}
            role="switch"
            aria-checked={twoFA}
            aria-label="Bật/tắt xác thực 2 bước"
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${twoFA ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
        {twoFA && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 fill-current" aria-hidden="true">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Xác thực 2 bước đã được bật. Tài khoản của bạn được bảo vệ tốt hơn.
          </div>
        )}
      </div>

      {/* Sessions */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 font-bold text-slate-900">Phiên đăng nhập</h2>
        <div className="space-y-3">
          {[
            { device: "Chrome trên Windows", location: "TP. Hồ Chí Minh, VN", time: "Hiện tại", current: true },
            { device: "Safari trên iPhone 15", location: "TP. Hồ Chí Minh, VN", time: "2 giờ trước", current: false },
          ].map((s) => (
            <div key={s.device} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    {s.device}
                    {s.current && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Hiện tại</span>}
                  </div>
                  <div className="text-xs text-slate-400">{s.location} · {s.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleLogoutAll}
          className="mt-4 cursor-pointer text-sm font-medium text-rose-500 transition-colors duration-150 hover:text-rose-700"
        >
          Đăng xuất tất cả thiết bị
        </button>
      </div>

      {/* Danger zone */}
      <div className="rounded-3xl border border-rose-200 bg-white p-6 shadow-sm">
        <h2 className="mb-2 font-bold text-rose-600">Vùng nguy hiểm</h2>
        <p className="mb-4 text-sm text-slate-500">Xóa tài khoản sẽ xóa toàn bộ dữ liệu và không thể khôi phục.</p>
        <button className="cursor-pointer rounded-full border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-600 transition-colors duration-200 hover:bg-rose-50">
          Xóa tài khoản
        </button>
      </div>
    </div>
  )
}
