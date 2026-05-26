---
inclusion: always
---

# Project Structure & Conventions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (ALL installed) |
| Icons | lucide-react (UI), components/icons/ (brand/custom) |
| Forms | react-hook-form + zod |
| Server State | TanStack Query |
| URL State | nuqs |
| Local State | useState/useCallback |
| Global State | Zustand |
| Notifications | sonner |
| Drag & Drop | @dnd-kit/react |
| Backend | Spring Boot (REST API) |
| Auth | Session-based (HTTP-only cookies) |

## Architecture Overview

**Backend**: Spring Boot REST API with session-based auth (HTTP-only cookies)  
**Frontend**: Next.js 16 App Router with TypeScript strict mode  
**API Layer**: Single universal proxy at `app/api/[...path]/route.ts` forwards all requests to backend  
**Auth Boundary**: `proxy.ts` handles session validation

## Directory Structure & Rules

### app/ - Routes & Co-located Files

**Structure**: `app/(auth)/`, `app/(public)/`, `app/dashboard/`, `app/api/[...path]/`

**Co-location principle**: Keep files in route folder until used by 2+ routes

```typescript
// ✓ GOOD - Co-located
app/dashboard/products/
  page.tsx              // Route entry
  product-form.tsx      // Only used here
  use-products.ts       // Only used here
  utils.ts              // Only used here

// ✗ BAD - Premature abstraction
components/product-form.tsx  // Only used in one route
```

**Route files**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx` (default exports only)

### app/api/[...path]/ - Universal API Proxy

**Single route handler** forwards ALL client requests to Spring Boot backend

**Responsibilities**: Cookie forwarding, error handling, response transformation  
**DO NOT**: Create separate handlers per endpoint, add business logic

### components/ - Shared UI (2+ Routes)

**Structure**: `components/ui/` (shadcn/ui), `components/icons/`, `components/icons/brand/`

**Icon usage**:
- UI icons → `lucide-react`
- Brand icons → `components/icons/brand/`
- Custom icons → `components/icons/`
- Never inline SVG

**shadcn/ui patterns** (ALL components installed):
- Use `gap-*` not `space-x-*` or `space-y-*`
- Use `size-*` when width === height (e.g., `size-10` not `w-10 h-10`)
- Use `truncate` not `overflow-hidden text-ellipsis whitespace-nowrap`
- Use semantic tokens (`bg-background`, `text-muted-foreground`) not raw colors
- Icons in buttons use `data-icon` attribute (no sizing classes)
- Forms use `FieldGroup` + `Field` (auto-spacing)
- Always include `AvatarFallback` with `Avatar`
- Dialog/Sheet/Drawer require `Title` (use `className="sr-only"` if hidden)

**Always use shadcn/ui components**:
```typescript
// ✓ GOOD
<Button>, <Input>, <Dialog>, <Select>, <Separator>

// ✗ BAD
<button>, <input>, <div className="modal">, <select>, <hr>
```

### lib/api/ - HTTP Layer

**Files**:
- `client.ts` - `apiFetch()` for client-side (browser)
- `server.ts` - `backendFetch()` for server-side (Server Components, Route Handlers)
- `<domain>.ts` - Domain API wrappers (e.g., `products.ts`, `brands.ts`)

**Rules**:
- Never call `backendFetch()` from client components
- Never mix client and server fetch in same file
- Domain wrappers use `apiFetch()` (client-side only)

### lib/auth/ - Authentication

**Files**: `session.ts` (getSession), `routes.ts` (PUBLIC_PATHS, PROTECTED)

### schemas/ - Zod Validation

**Root-level validation schemas**, one file per domain (e.g., `schemas/auth.ts`, `schemas/products.ts`)

### types/ - Shared Types

**When to use**:
- Used across multiple domains (e.g., `Page<T>`)
- Used in UI components, not just API (e.g., `TreeNode`)
- Generic utility types (e.g., `PaginationParams`)

**When NOT to use**:
- API request/response for one domain → Keep in `lib/api/<domain>.ts`
- Form data shapes → Infer from zod schemas

### hooks/ - Custom Hooks

**Root-level hooks** used by 2+ routes (e.g., `use-mobile.ts`, `use-copy.ts`)

**When NOT to use**: Tightly coupled to one route → Keep in route folder

### stores/ - Zustand Global State

**Naming**: `kebab-case.ts` (e.g., `cart-store.ts`, `auth-store.ts`)

**When to use**: Cross-component state, state persisting across routes  
**When NOT to use**: Server data (use TanStack Query), URL state (use nuqs), local state (use useState)

### providers/ - React Context

**Root-level providers** (e.g., `QueryClientProvider`, `NuqsAdapter`, `ThemeProvider`)  
**Used in**: `app/layout.tsx`

## Naming Conventions (All kebab-case)

## Naming Conventions (All kebab-case)

| Type | Pattern | Example |
|------|---------|---------|
| Components | `kebab-case.tsx` | `brand-panel.tsx`, `product-form.tsx` |
| Hooks | `use-*.ts` | `use-brands.ts`, `use-mobile.ts` |
| Stores | `kebab-case.ts` | `cart-store.ts`, `auth-store.ts` |
| API files | `kebab-case.ts` | `lib/api/brands.ts`, `lib/api/products.ts` |
| Schemas | `kebab-case.ts` | `schemas/auth.ts`, `schemas/products.ts` |
| Types | `kebab-case.ts` | `types/pagination.ts`, `types/categories.ts` |
| Providers | `kebab-case.tsx` | `providers/query-provider.tsx` |
| Utils | `kebab-case.ts` | `lib/utils/formatting.ts` |

**Exceptions**: Next.js route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`)

**Rules**:
- Be descriptive: `brand-panel.tsx` not `panel.tsx`
- `route.ts` reserved for API Route Handlers only
- Default exports only for Next.js route files
- Named exports for everything else

## File Placement Decision Tree

```
Is it a Next.js route file (page.tsx, layout.tsx, etc.)?
  → app/<route>/

Is it only used by ONE route?
  → app/<route>/<file>.tsx

Is it used by 2+ routes?
  ├─ UI component? → components/<file>.tsx
  ├─ React hook? → hooks/<file>.ts
  ├─ API wrapper? → lib/api/<domain>.ts
  ├─ Validation schema? → schemas/<domain>.ts
  ├─ Shared type? → types/<file>.ts
  ├─ Utility function? → lib/utils/<file>.ts or lib/utils.ts
  ├─ Global state? → stores/<file>.ts
  └─ React provider? → providers/<file>.tsx
```

## State Management Strategy

| State Type | Tool | When to Use |
|------------|------|-------------|
| Server data | TanStack Query | API data, caching, mutations |
| URL state | nuqs | Filters, pagination, search params |
| Local UI state | useState/useCallback | Component-specific state |
| Global app state | Zustand | Cart, cross-component state |

## Data Fetching Patterns

**Server Components** (default):
```typescript
// app/dashboard/products/[id]/page.tsx
import { backendFetch } from '@/lib/api/server'
import { cookies } from 'next/headers'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
  
  const res = await backendFetch(`/api/products/${params.id}`, { cookieHeader })
  const { data: product } = await res.json()
  
  return <ProductForm product={product} />
}
```

**Client Components** (when needed):
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { getProducts } from '@/lib/api/products'

export default function ProductsPage() {
  const [page] = useQueryState('page', { defaultValue: 1 })
  const [search] = useQueryState('search', { defaultValue: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search }],
    queryFn: () => getProducts({ page, search })
  })

  if (isLoading) return <Skeleton />
  if (!data?.content.length) return <EmptyState />
  
  return <ProductList products={data.content} />
}
```

## Critical Rules

1. **Co-locate first** - Keep files in route folder until reused
2. **Server Components by default** - Use client components only when needed (interactivity, hooks, browser APIs)
3. **Never mix client/server** - Separate `lib/api/client.ts` and `lib/api/server.ts`
4. **Always use shadcn/ui** - Never raw HTML elements
5. **Type everything** - TypeScript strict mode enabled
6. **Single API proxy** - All client requests go through `app/api/[...path]/route.ts`
7. **Handle all states** - Loading, error, empty states required
8. **Validate both sides** - Client (UX) + Server (security)
9. **Accessibility always** - ARIA labels, keyboard nav, focus management
10. **Be descriptive** - Clear, specific file and component names

## Common Mistakes to Avoid

❌ Calling `apiFetch()` from Server Components (use `backendFetch()`)  
❌ Creating separate route handlers per endpoint (use universal proxy)  
❌ Using raw HTML elements (use shadcn/ui components)  
❌ Mixing client and server code in same file  
❌ Premature abstraction (moving to shared before reused)  
❌ Using `space-x-*`/`space-y-*` (use `flex` with `gap-*`)  
❌ Using `w-*` and `h-*` separately when equal (use `size-*`)  
❌ Inline SVG (use lucide-react or components/icons/)  
❌ Not handling loading/error/empty states  
❌ Missing accessibility attributes
