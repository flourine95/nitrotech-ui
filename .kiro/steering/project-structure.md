# Project Structure & Naming Conventions

## Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (`components/ui/`)
- **Icons**: `lucide-react` — always use this, never inline SVG
- **Forms**: react-hook-form + zod
- **State**: useState/useCallback (local), Zustand (global)
- **Toast**: sonner
- **DnD**: @dnd-kit/react

---

## Folder Rules

| Folder | Purpose |
|--------|---------|
| `app/` | Route segments, layouts, pages, route-specific components |
| `components/` | Shared components reused across 2+ routes |
| `components/ui/` | shadcn/ui primitives — avoid editing unless intentionally customizing |
| `lib/api/` | Domain API functions (one file per domain) |
| `lib/schemas/` | Zod validation schemas |
| `lib/types/` | Shared domain TypeScript types — see rules below |
| `lib/client.ts` | `apiFetch()` — transport layer, client-side BFF fetch |
| `lib/server.ts` | `backendFetch()` — transport layer, server-side Spring fetch |
| `lib/auth.ts` | Server-side `getSession()` helper |
| `lib/utils.ts` | General utilities |
| `hooks/` | Reusable custom React hooks |
| `store/` | Zustand stores |
| `types/` | Global declarations only (`*.d.ts`, module augmentation). Remove if unused. |

> `lib/api/*.ts` = domain API wrappers. `lib/client.ts` / `lib/server.ts` = low-level transport. Do not mix them.

### When to put types in `lib/api/` vs `lib/types/`

**Keep in `lib/api/`** when the type only describes a request/response shape for that domain:
```ts
// lib/api/brands.ts
export interface Brand { ... }        // API response shape
export interface BrandsQuery { ... }  // query params
```

**Move to `lib/types/`** when:
- Used across multiple domains — e.g. `Page<T>` used by brands, categories, products → `lib/types/pagination.ts`
- Used outside the API layer — e.g. `TreeNode` used in UI components, not an API response → `lib/types/categories.ts`
- Generic utility types not tied to a specific endpoint

---

## Co-location

Prefer flat co-location inside route folders first.

**Put inside route folder** (`app/dashboard/categories/`) when:
- Only used by that specific route
- Closely coupled to route state or UI flow

**Put in `components/`** when:
- Used by 2+ routes

**Use `_components/`** only when a route grows too large and needs a private subfolder to group many co-located files. Not the default.

---

## Naming

| Type | Convention | Example |
|------|-----------|---------|
| Route files | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` | `app/dashboard/brands/page.tsx` |
| Component files | `kebab-case.tsx` | `category-panel.tsx`, `delete-dialog.tsx` |
| Hook files | `use-*.ts` | `use-mobile.ts`, `use-folders.ts` |
| Store files | `*.store.ts` | `cart.store.ts` |
| API / schema / type files | `kebab-case.ts` | `lib/api/brands.ts`, `lib/schemas/auth.ts` |

**Additional rules:**
- Component files should be descriptive, not generic — prefer `brand-delete-dialog.tsx` over `dialog.tsx`
- `route.ts` is reserved for Route Handlers inside `app/api/` only

---

## Exports

- **Default export** only for Next.js route files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Named exports** for everything else: components, hooks, utils, stores, API functions

---

## API Layer

All client-side API calls go through the BFF (`app/api/[...path]/route.ts`) which proxies to the Spring backend. This handles auth cookies, 401 redirects, and hides backend contracts from the client.

```ts
// lib/api/brands.ts — domain wrapper
import { apiFetch } from '@/lib/client';

export async function getBrands(query?: BrandsQuery) { ... }
export async function createBrand(body: CreateBrandBody) { ... }
```

---

## Current Inconsistencies (migrate when touched, not all at once)

| Current | Should be |
|---------|-----------|
| `lib/auth.api.ts` | `lib/api/auth.ts` |
| `lib/brands-api.ts` | `lib/api/brands.ts` |
| `lib/categories-api.ts` | `lib/api/categories.ts` |
| `lib/media-api.ts` | `lib/api/media.ts` |
| `lib/upload-api.ts` | `lib/api/upload.ts` |
| `lib/products.ts` | `lib/api/products.ts` |
| `lib/categories.types.ts` | `lib/types/categories.ts` |
| `lib/auth/` (empty) | delete |
| `app/dashboard/media/_components/` | flatten or keep if large |
