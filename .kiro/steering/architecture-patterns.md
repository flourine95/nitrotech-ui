---
inclusion: always
---

# Architecture Patterns

Proven patterns for data fetching, routing, and state management.

## Data Fetching Strategy

| Context | Pattern | Tool | When to Use |
|---------|---------|------|-------------|
| Server Component | Direct `backendFetch()` | lib/api/server.ts | Detail/edit pages, SEO pages |
| Client Component | TanStack Query `useQuery` | @tanstack/react-query | List pages with filters |
| Mutations | TanStack Query `useMutation` | @tanstack/react-query | Create/update/delete |
| URL state | `useQueryState` | nuqs | Filters, pagination, search |
| Local UI state | `useState`, `useCallback` | React | Component-specific state |
| Global app state | Zustand store | zustand | Cart, cross-component state |

## Pattern Selection Guide

```
Need SEO or initial data?
  → Server Component with backendFetch()

Need filters/pagination?
  → Client Component with useQuery + nuqs

Need to create/update/delete?
  → useMutation with optimistic updates

Need state in URL?
  → useQueryState (nuqs)

Need state across components?
  → Zustand store

Need local component state?
  → useState
```

## Server Component Pattern

**Use for**: Detail pages, edit pages, SEO pages, static content

**Complete example**:
```typescript
// app/dashboard/products/[id]/page.tsx
import { backendFetch } from '@/lib/api/server'
import { cookies } from 'next/headers'

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')

  const res = await backendFetch(`/api/products/${params.id}`, { cookieHeader })
  const { data: product } = await res.json()

  return <ProductForm product={product} />
}
```

**Key points**:
- Async function
- Use `backendFetch()` not `apiFetch()`
- Forward cookies for auth
- No loading state needed (Suspense handles it)

---

## Client Component Pattern

**Use for**: List pages with filters, real-time updates, complex interactions

**Complete example**:
```typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { useQueryState } from 'nuqs'
import { getProducts } from '@/lib/api/products'

export default function ProductsPage() {
  // URL state (persists on refresh)
  const [page] = useQueryState('page', { defaultValue: 1 })
  const [search] = useQueryState('search', { defaultValue: '' })

  // Server data with caching
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', { page, search }],
    queryFn: () => getProducts({ page, search })
  })

  // Handle all states
  if (isLoading) return <Skeleton />
  if (error) return <ErrorState />
  if (!data?.content.length) return <EmptyState />

  return <ProductList products={data.content} />
}
```

**Key points**:
- `'use client'` directive
- Use `apiFetch()` via domain wrapper
- URL state with `nuqs`
- Handle loading/error/empty states

---

## Mutation Pattern

**Complete example**:
```typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createBrand } from '@/lib/api/brands'
import { toast } from 'sonner'

export function BrandPanel() {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      toast.success('Brand created')
    },
    onError: (error: ApiException) => {
      toast.error(error.error.message)
      if (error.error.code === 'DUPLICATE_SLUG') {
        form.setError('slug', { message: 'Slug already exists' })
      }
    }
  })

  return (
    <form onSubmit={form.handleSubmit(data => createMutation.mutate(data))}>
      {/* Form fields */}
    </form>
  )
}
```

**Key points**:
- Invalidate queries on success
- Show toast notifications
- Map API errors to form fields
- Disable submit during mutation

---

## Dashboard Route Structure

**Simple domain** (CRUD only):
```
app/dashboard/brands/
  page.tsx              # List with useQuery + nuqs
  brand-panel.tsx       # Create/edit panel
  use-brands.ts         # Optional: complex state logic
```

**Complex domain** (multiple editors):
```
app/dashboard/products/
  page.tsx              # List page
  product-form.tsx      # Shared form
  variant-editor.tsx    # Sub-editor
  image-editor.tsx      # Sub-editor
  utils.ts              # Domain helpers
```

---

## Error Handling Patterns

**Client-side** (mutations):
```typescript
const mutation = useMutation({
  mutationFn: createProduct,
  onError: (error: ApiException) => {
    // Generic error
    toast.error(error.error.message)
    
    // Field-specific error
    if (error.error.code === 'DUPLICATE_SLUG') {
      form.setError('slug', { message: 'Slug already exists' })
    }
  }
})
```

**Server-side** (Server Components):
```typescript
try {
  const res = await backendFetch('/api/products')
  if (!res.ok) return <ErrorState />
  const { data } = await res.json()
  return <ProductList products={data} />
} catch {
  return <ErrorState message="Network error" />
}
```

---

## State Management Checklist

**Always handle these states**:
- ✓ Loading state (`<Skeleton />`)
- ✓ Error state (`<ErrorState />`)
- ✓ Empty state (`<EmptyState />`)
- ✓ Success state (actual content)

**Example**:
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

---

## Form Validation Pattern

**Client-side** (UX):
```typescript
const form = useForm({
  resolver: zodResolver(productSchema),
  defaultValues: { name: '', price: 0 }
})
```

**Server-side** (Security):
Backend validates again - never trust client-side validation alone.

---

## Accessibility Requirements

**Always include**:
- ARIA labels for icon buttons
- Keyboard navigation (Tab, Enter, Escape)
- Focus management (dialogs, modals)
- Screen reader support
- Color contrast (WCAG AA minimum)

**Example**:
```typescript
<Button 
  onClick={handleDelete} 
  aria-label="Delete product" 
  variant="ghost" 
  size="icon"
>
  <Trash2 className="h-4 w-4" />
</Button>
```
