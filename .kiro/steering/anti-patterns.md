---
inclusion: always
---

# Anti-Patterns (Avoid)

Common mistakes that violate project conventions and best practices.

## Architecture Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Mixing client/server code | Server-only APIs in client components crash | Separate `lib/api/client.ts` and `lib/api/server.ts` |
| `apiFetch()` in Server Components | Unnecessary round-trip through BFF | Use `backendFetch()` directly |
| Business logic in route handlers | Violates single responsibility | Route handlers only proxy to backend |
| Multiple route handlers | Duplicates proxy logic | Single `app/api/[...path]/route.ts` |
| Manual state management | Reinventing the wheel | Use TanStack Query for server data |
| `useState` for URL state | State lost on refresh | Use `nuqs` for filters/pagination |

### Examples

**✗ Mixing Client/Server:**
```typescript
'use client'
import { cookies } from 'next/headers' // Server-only API - crashes!
```

**✓ Correct:**
```typescript
// lib/api/client.ts - client-side only
export const apiFetch = () => { /* ... */ }

// lib/api/server.ts - server-side only
export const backendFetch = () => { /* ... */ }
```

**✗ apiFetch() in Server Component:**
```typescript
export default async function ProductPage() {
  const product = await apiFetch('/api/products/1') // Unnecessary round-trip
}
```

**✓ Correct:**
```typescript
export default async function ProductPage() {
  const cookieHeader = (await cookies()).getAll().map(c => `${c.name}=${c.value}`).join('; ')
  const res = await backendFetch('/api/products/1', { cookieHeader })
  const { data: product } = await res.json()
}
```

---

## UI Component Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Raw HTML elements | Inconsistent styling, no dark mode | Use shadcn/ui components |
| `space-x-*` / `space-y-*` | Deprecated in shadcn/ui | Use `flex` with `gap-*` |
| `w-* h-*` when equal | Verbose | Use `size-*` |
| Raw colors | No dark mode support | Use semantic tokens |
| Missing `data-icon` | Icons not sized correctly | Add `data-icon` attribute |
| Forms without `FieldGroup` | Manual spacing management | Use `FieldGroup` component |
| `Avatar` without fallback | Broken when image fails | Always include `AvatarFallback` |
| Dialog without Title | Accessibility violation | Add Title (use `sr-only` if hidden) |

### Examples

**✗ Raw HTML:**
```typescript
<button onClick={handleClick}>Click</button>
<input type="text" />
<hr />
<div className="space-y-4">...</div>
<div className="w-10 h-10">...</div>
```

**✓ shadcn/ui:**
```typescript
<Button onClick={handleClick}>Click</Button>
<Input type="text" />
<Separator />
<div className="flex flex-col gap-4">...</div>
<div className="size-10">...</div>
```

**✗ Raw Colors:**
```typescript
<div className="bg-slate-50 text-slate-900 border-slate-200">
```

**✓ Semantic Tokens:**
```typescript
<div className="bg-muted text-foreground border-border">
```

**✗ Icons in Buttons:**
```typescript
<Button>
  <Eye className="h-4 w-4" />
  View
</Button>
```

**✓ Correct:**
```typescript
<Button>
  <Eye data-icon="inline-start" />
  View
</Button>
```

---

## Performance Anti-Patterns

| Anti-Pattern | Impact | Correct Approach |
|--------------|--------|------------------|
| Sequential awaits | Waterfall delays | Use `Promise.all()` |
| Barrel imports | Large bundle size | Direct imports |
| No dynamic imports | Heavy components block render | Use `dynamic()` for heavy components |
| Inline component definitions | Re-created every render | Hoist outside parent |
| Non-primitive dependencies | Unnecessary re-renders | Use primitive values in deps |
| No React.cache() | Duplicate fetches | Use `cache()` for deduplication |

### Examples

**✗ Sequential Awaits (Waterfall):**
```typescript
async function loadData() {
  const user = await fetchUser()
  const settings = await fetchSettings() // Waits for user
  const posts = await fetchPosts()       // Waits for settings
}
```

**✓ Parallel:**
```typescript
async function loadData() {
  const [user, settings, posts] = await Promise.all([
    fetchUser(),
    fetchSettings(),
    fetchPosts()
  ])
}
```

**✗ Barrel Imports:**
```typescript
import { Button, Dialog, Card } from '@/components/ui'
```

**✓ Direct Imports:**
```typescript
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
```

**✗ No Dynamic Import:**
```typescript
import { HeavyEditor } from '@/components/heavy-editor'
```

**✓ Dynamic Import:**
```typescript
const HeavyEditor = dynamic(() => import('@/components/heavy-editor'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
})
```

**✗ Inline Component:**
```typescript
function Parent() {
  const Child = () => <div>Child</div> // Re-created every render
  return <Child />
}
```

**✓ Hoisted:**
```typescript
const Child = () => <div>Child</div>

function Parent() {
  return <Child />
}
```

**✗ Non-Primitive Dependencies:**
```typescript
const config = { id: 1, name: 'test' }
useEffect(() => {
  doSomething(config)
}, [config]) // Object reference changes every render
```

**✓ Primitive Dependencies:**
```typescript
useEffect(() => {
  doSomething(config)
}, [config.id, config.name])
```

**✗ Duplicate Fetches:**
```typescript
async function Component1() {
  const user = await fetchUser(1)
}

async function Component2() {
  const user = await fetchUser(1) // Duplicate fetch
}
```

**✓ React.cache():**
```typescript
import { cache } from 'react'

const getUser = cache(async (id: number) => fetchUser(id))

async function Component1() {
  const user = await getUser(1)
}

async function Component2() {
  const user = await getUser(1) // Uses cached result
}
```

---

## Code Quality Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
|--------------|----------------|------------------|
| Premature abstraction | Complexity without benefit | Co-locate until reused 2+ times |
| Hardcoded values | Not configurable | Use environment variables |
| `@ts-ignore` | Hides real issues | Fix type or use proper assertion |
| No error handling | Crashes on error | Handle loading/error/empty states |
| Inline SVG | Not reusable | Use lucide-react or components/icons/ |
| Wrong naming | Hard to find files | Use kebab-case consistently |
| Missing accessibility | Excludes users | Add ARIA labels, keyboard nav |

### Examples

**✗ Premature Abstraction:**
```typescript
components/forms/product-form.tsx  // Only used once
```

**✓ Co-locate First:**
```typescript
app/dashboard/products/product-form.tsx  // Move when reused
```

**✗ No Error Handling:**
```typescript
const { data } = useQuery({ queryKey: ['products'], queryFn: getProducts })
return <ProductList products={data.content} /> // Crashes if undefined
```

**✓ Handle All States:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: getProducts
})

if (isLoading) return <Skeleton />
if (error) return <ErrorState />
if (!data?.content.length) return <EmptyState />
return <ProductList products={data.content} />
```

**✗ Wrong Naming:**
```typescript
components/Panel.tsx
hooks/useBrands.ts
stores/cart.store.ts
```

**✓ Correct Naming:**
```typescript
components/brand-panel.tsx
hooks/use-brands.ts
stores/cart-store.ts
```

**✗ Missing Accessibility:**
```typescript
<button onClick={handleDelete}>
  <Trash2 />
</button>
```

**✓ With Accessibility:**
```typescript
<Button onClick={handleDelete} aria-label="Delete product" variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>
```
