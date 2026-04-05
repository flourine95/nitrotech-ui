# Auth Flow — Next.js + NextAuth v5 + Custom Backend

Stack: Next.js 16 (App Router) · NextAuth v5 · Zustand · Custom REST backend

---

## Tổng quan kiến trúc

```
Browser
  │
  ├── NextAuth JWT cookie (httpOnly)   ← lưu accessToken + refreshToken
  │     └── chỉ server/NextAuth đọc được
  │
  └── Zustand store (memory)           ← lưu accessToken cho apiFetch
        └── mất khi reload → được sync lại từ NextAuth
```

---

## Các file chính

| File | Vai trò |
|------|---------|
| `auth.ts` | Config NextAuth v5 — providers, callbacks, type augmentation |
| `proxy.ts` | Middleware bảo vệ route `/dashboard/**` |
| `store/auth.ts` | Zustand store — giữ accessToken trong memory |
| `lib/api.ts` | `apiFetch` — tự lấy token, tự retry khi 401 |
| `lib/auth-api.ts` | Các hàm login/logout/register/... |
| `app/dashboard/auth-wrapper.tsx` | Server component — truyền session xuống dashboard |
| `app/dashboard/session-bridge.tsx` | Client component — sync session → Zustand store |
| `components/site-header-server.tsx` | Server wrapper — truyền user xuống SiteHeader |

---

## 1. Đăng nhập

```
User submit form (email + password)
  │
  ▼
login(email, password)                          [lib/auth-api.ts]
  │
  ▼
signIn("credentials", { redirect: false })      [next-auth/react]
  │
  ▼
POST /api/auth/callback/credentials             [NextAuth internal route]
  │
  ▼
authorize(credentials)                          [auth.ts]
  │  chạy server-side
  ▼
fetch POST /api/auth/login                      [custom backend]
  │
  ▼
backend trả:
  - body: { accessToken, user }
  - Set-Cookie: refreshToken=xxx; HttpOnly; Path=/api/auth
  │
  ▼
authorize() capture refreshToken từ Set-Cookie header
return { id, name, email, accessToken, refreshToken }
  │
  ▼
jwt() callback lưu vào NextAuth JWT cookie:
  { accessToken, refreshToken, accessTokenExpiry }
  │
  ▼
signIn() resolve → login() gọi getSession()
  │
  ▼
setAccessToken() vào Zustand store              [store/auth.ts]
  │
  ▼
router.push("/dashboard")
```

---

## 2. Reload trang (session đã có)

```
Page mount
  │
  ├── [Dashboard] AuthWrapper (server component)
  │     │
  │     ▼
  │   auth()                                    [auth.ts — server-side]
  │     │
  │     ▼
  │   jwt() callback kiểm tra token:
  │     ├── còn hạn (> 60s) → trả nguyên
  │     └── hết hạn → refreshAccessToken()
  │           └── POST /api/auth/refresh với refreshToken cookie
  │     │
  │     ▼
  │   SessionProvider nhận session sẵn
  │     │
  │     ▼
  │   SessionBridge.useEffect → setAccessToken() vào store
  │
  └── [Storefront] SiteHeaderServer (server component)
        │
        ▼
      auth() → session?.user truyền xuống SiteHeader qua props
        └── không flash "Đăng nhập" → tên user
```

---

## 3. Mỗi API call

```
apiFetch("/api/something")                      [lib/api.ts]
  │
  ▼
getAccessToken():
  1. Đọc từ Zustand store (sync, fast)
  2. Nếu null → getSession() từ NextAuth (fallback sau reload)
     └── nếu có → setAccessToken() vào store luôn
  │
  ▼
fetch với header: Authorization: Bearer <token>
  │
  ├── 200 → trả data
  │
  └── 401 → retry flow:
        │
        ▼
      getSession() → NextAuth tự refresh token nếu cần
        │
        ├── có token mới → update store → retry request 1 lần
        │
        └── không có → signOut() → redirect /login
```

---

## 4. Bảo vệ route (Middleware)

```
Request đến /dashboard/**
  │
  ▼
proxy.ts chạy (Edge runtime)
  │
  ▼
auth(req) kiểm tra NextAuth JWT cookie
  │
  ├── có session → cho qua
  │
  └── không có → redirect /login?from=/dashboard/...
```

---

## 5. Đăng xuất

```
logout()                                        [lib/auth-api.ts]
  │
  ▼
useAuthStore.clear()                            → xóa token khỏi memory
  │
  ▼
signOut({ callbackUrl: "/login" })              → xóa NextAuth JWT cookie
  │
  ▼
redirect /login
```

---

## Tại sao cần Zustand store?

NextAuth lưu token trong httpOnly cookie — JavaScript không đọc được trực tiếp.
`apiFetch` cần token để gắn vào header, chạy client-side.

Giải pháp: dùng Zustand làm "bridge" — token được sync vào store từ NextAuth session,
`apiFetch` đọc từ store (synchronous, không cần await).

```
NextAuth JWT cookie (httpOnly, server-only)
        ↓ sync qua SessionBridge / login()
Zustand store (memory, client)
        ↓ đọc synchronous
apiFetch → Authorization header
```

---

## Tại sao SiteHeader cần SiteHeaderServer wrapper?

`SiteHeader` là `"use client"` — `useSession()` chạy sau khi browser load xong.
Khi SSR, server không biết user → render "Đăng nhập" → browser nhận HTML → hiển thị
"Đăng nhập" → `useSession()` fetch xong → re-render thành tên user → **flash**.

Fix: `SiteHeaderServer` (server component) gọi `auth()` trước khi render,
truyền `initialUser` xuống `SiteHeader` qua props.
Client render đúng ngay từ đầu, không cần chờ `useSession()`.

```
SiteHeaderServer (server)
  └── auth() → session.user
        └── <SiteHeader initialUser={session.user} />
              └── user = session?.user ?? initialUser  ← không flash
```

---

## Thêm OAuth provider (Google, GitHub...)

Chỉ cần thêm vào `providers` array trong `auth.ts`:

```ts
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({ ... }),  // giữ nguyên
    Google,
    GitHub,
  ],
  // callbacks giữ nguyên
});
```

OAuth providers tự quản lý token — không cần `authorize()` thủ công.
`accessToken` từ OAuth provider sẽ có trong `account` object của `jwt()` callback.

---

## Thêm API endpoint cần auth

```ts
// lib/orders-api.ts
import { apiFetch } from './api';

export async function getOrders() {
  // apiFetch tự lo token — không cần làm gì thêm
  const res = await apiFetch<{ data: Order[] }>('/api/orders');
  return res.data;
}
```

Nếu endpoint không cần auth:

```ts
apiFetch('/api/public-data', { skipAuth: true });
```
