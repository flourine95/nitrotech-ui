# NitroTech UI

Frontend cho hệ thống quản lý e-commerce NitroTech — linh kiện điện tử, laptop, PC.

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | lucide-react |
| Forms | react-hook-form + zod |
| Server state | TanStack Query |
| URL state | nuqs |
| Global state | Zustand |
| Toast | sonner |
| Drag & drop | @dnd-kit/react |

## Yêu cầu

- Node.js 20+
- Backend Spring Boot chạy tại `http://localhost:8080` (hoặc cấu hình lại trong `.env.local`)

## Cài đặt

```bash
npm install
```

## Biến môi trường

Tạo file `.env.local` ở root:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
BACKEND_URL=http://localhost:8080
```

- `NEXT_PUBLIC_API_URL` — URL backend dùng phía client (BFF proxy)
- `BACKEND_URL` — URL backend dùng phía server (Server Components, Route Handlers)

## Chạy development

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start
```

## Cấu trúc thư mục

```
app/                        Route segments
  (auth)/                   Login, register, forgot password
  account/                  Trang tài khoản người dùng
  api/                      Route Handlers (BFF proxy + upload)
  dashboard/                Admin dashboard
    brands/
    categories/
    media/
    orders/
    products/
  products/                 Trang sản phẩm public

components/
  dashboard/                Shared components cho dashboard
    gallery-editor.tsx      Drag-drop image gallery
    key-value-editor.tsx    Dynamic key-value pairs
    filter-chip.tsx         Dismissible filter chip
  ui/                       shadcn/ui primitives

hooks/
  use-table-selection.ts    Multi-row selection state
  use-dialog-state.ts       Delete/restore/hard-delete dialog state
  use-media-assets.ts
  use-pagination.ts

lib/
  api/                      Domain API wrappers (một file per domain)
  schemas/                  Zod validation schemas
  types/                    Shared TypeScript types
  utils/
    formatting.ts           formatCurrency, formatPriceRange, formatRelativeDate, downloadCSV
  auth.ts                   Server-side getSession()
  client.ts                 apiFetch() — client-side BFF transport
  server.ts                 backendFetch() — server-side Spring transport
  utils.ts                  slugify, cn, ...

store/                      Zustand stores
```

## API Architecture

Tất cả API call từ client đi qua BFF tại `app/api/[...path]/route.ts`:

```
Client component
  → apiFetch('/api/products')       lib/client.ts
  → app/api/[...path]/route.ts      BFF proxy
  → backendFetch('/api/products')   lib/server.ts
  → Spring backend
```

Server Components fetch trực tiếp qua `backendFetch()`.

## Thêm shadcn component

```bash
npx shadcn@latest add <component>
```

## Lint & Format

```bash
npm run lint
npm run format
```
