# Project Structure & Naming Conventions

## Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (`components/ui/`) |
| Icons | `lucide-react` — always use this, never inline SVG |
| Forms | react-hook-form + zod |
| Server state | TanStack Query (`@tanstack/react-query`) |
| URL state | nuqs |
| Local state | useState / useCallback |
| Global state | Zustand (`store/`) |
| Toast | sonner |
| Drag & drop | `@dnd-kit/react` |

---

## Core Philosophy: Co-locate First

> **If a file is only used by one route, it lives inside that route folder.**
> Only move it out when it's genuinely reused across 2+ routes.

This applies to components, hooks, utils, schemas, and types alike.

---

## Folder Map

```
app/                        Route segments, layouts, pages, route-specific files
  (auth)/                   Auth group — login, register, forgot-password, etc.
  account/                  User account pages
  api/                      Route Handlers only (BFF proxy + upload endpoints)
  dashboard/                Admin dashboard
    brands/
    categories/
    media/
    products/
    ...
  products/                 Public product pages
  ...

components/                 Shared UI used across 2+ routes
  ui/                       shadcn/ui primitives — avoid editing unless intentional

lib/
  api/                      Domain API wrappers (one file per domain)
  schemas/                  Zod validation schemas
  types/                    Shared TypeScript types used across multiple domains
  auth.ts                   Server-side getSession() helper
  client.ts                 apiFetch() — client-side BFF transport
  server.ts                 backendFetch() — server-side Spring transport
  utils.ts                  General utilities (slugify, cn, etc.)

hooks/                      Custom React hooks used across 2+ routes
store/                      Zustand stores (create when needed)
types/                      Global *.d.ts declarations only (module augmentation)
```

---

## Folder Rules

### `app/`
Route segments, layouts, pages, and **route-specific** components/hooks/utils.

A route folder can contain:
```
app/dashboard/products/
  page.tsx                  ← route entry (default export)
  product-form.tsx          ← component only used here
  variants-editor.tsx       ← component only used here
  gallery-editor.tsx        ← component only used here
  key-value-editor.tsx      ← component only used here
  utils.ts                  ← helpers only used here
  use-products.ts           ← hook only used here (if needed)
```

Use `_components/` subfolder only when a route has so many co-located files that a flat list becomes hard to scan. Not the default.

### `components/`
Shared business components used by **2+ routes**.

```
components/
  product-card.tsx          ← used in /products, /search, /account/wishlist
  compare-bar.tsx           ← used in /products, /compare
  media-picker-dialog.tsx   ← used in /dashboard/brands, /dashboard/products
  providers.tsx             ← root providers (QueryClient, NuqsAdapter)
  site-header.tsx
  site-footer.tsx
  ui/                       ← shadcn/ui primitives
```

### `lib/api/`
One file per domain. Each file exports async functions that call `apiFetch()`.

```ts
// lib/api/products.ts
import { apiFetch } from '@/lib/client';

export async function getProducts(query?: ProductsQuery) { ... }
export async function createProduct(body: CreateProductBody) { ... }
```

**Do not** call `backendFetch()` from `lib/api/` — that's for Server Components and Route Handlers only.

### `lib/schemas/`
Zod schemas for form validation. One file per domain.

```
lib/schemas/
  auth.ts
  categories.ts
  products.ts
```

### `lib/types/`
Shared TypeScript types used across **multiple domains**.

```
lib/types/
  pagination.ts     ← Page<T> used by products, brands, categories
  categories.ts     ← TreeNode used in UI components across routes
```

Types that only belong to one domain stay in `lib/api/<domain>.ts`.

### `hooks/`
Custom React hooks used across **2+ routes**.

```
hooks/
  use-mobile.ts
  use-folders.ts
  use-media-assets.ts
  use-copy.ts
```

Hooks tightly coupled to one route live inside that route folder instead.

---

## Type Placement Decision

| Situation | Where to put it |
|-----------|----------------|
| API request/response shape for one domain | `lib/api/<domain>.ts` |
| Used across multiple domains | `lib/types/<name>.ts` |
| Used in UI components, not just API layer | `lib/types/<name>.ts` |
| Generic utility type (e.g. `Page<T>`) | `lib/types/pagination.ts` |
| Form data shape (inferred from zod) | `lib/schemas/<domain>.ts` |

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Route files | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` | `app/dashboard/brands/page.tsx` |
| Route Handlers | `route.ts` | `app/api/upload/sign/route.ts` |
| Component files | `kebab-case.tsx` | `brand-panel.tsx`, `product-form.tsx` |
| Hook files | `use-*.ts` | `use-brands.ts`, `use-mobile.ts` |
| Store files | `*.store.ts` | `cart.store.ts` |
| API / schema / type files | `kebab-case.ts` | `lib/api/brands.ts`, `lib/schemas/auth.ts` |
| Route-local utils | `utils.ts` | `app/dashboard/products/utils.ts` |

**Additional rules:**
- Be descriptive, not generic — `brand-panel.tsx` not `panel.tsx`
- `route.ts` is reserved for Route Handlers inside `app/api/` only
- Default export only for Next.js route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`)
- Named exports for everything else

---

## API Layer Architecture

All client-side API calls go through the BFF at `app/api/[...path]/route.ts`, which proxies to the Spring backend. This handles auth cookies, 401 redirects, and hides backend URLs from the client.

```
Client component
  → apiFetch('/api/products')          lib/client.ts
  → app/api/[...path]/route.ts         BFF proxy
  → backendFetch('/api/products')      lib/server.ts
  → Spring backend
```

Server Components fetch directly via `backendFetch()` with the request cookie header.

---

## Data Fetching Patterns

| Context | Pattern |
|---------|---------|
| Server Component (edit pages, detail pages) | `backendFetch()` directly in `async` page component |
| Client Component (list pages with filters) | TanStack Query `useQuery` |
| Mutations (create, update, delete) | TanStack Query `useMutation` |
| URL-synced filter/pagination state | nuqs `useQueryState` |
| Local UI state | `useState` |
| Global app state | Zustand store |

---

## Dashboard Route Pattern

Each dashboard route follows this structure:

```
app/dashboard/<domain>/
  page.tsx                  List page — useQuery + nuqs for filters/pagination
  <domain>-panel.tsx        Create/edit slide-in panel (if simple enough)
  use-<domain>.ts           Hook for complex state (categories tree, etc.)

  OR for complex routes (products):
  page.tsx                  List page
  product-form.tsx          Shared create/edit form
  <editor>.tsx              Sub-editors (variants, gallery, key-value)
  utils.ts                  Domain-specific formatters and constants
```

---

## Current State (as of last update)

All major inconsistencies from the previous version have been resolved:

| ✅ Done | Notes |
|---------|-------|
| `lib/api/auth.ts` | Migrated |
| `lib/api/brands.ts` | Migrated |
| `lib/api/categories.ts` | Migrated |
| `lib/api/upload.ts` | Migrated |
| `lib/api/products.ts` | Created |
| `lib/types/categories.ts` | Migrated |
| `lib/types/pagination.ts` | Created |
| `lib/schemas/products.ts` | Created |

Remaining:

| Current | Should be | When |
|---------|-----------|------|
| `lib/data/products.ts` | Delete (mock data, replaced by real API) | When touched |
| `lib/mocks/` | Delete when no longer needed | When touched |
| `app/dashboard/media/_components/` | Flatten if small enough | When touched |
