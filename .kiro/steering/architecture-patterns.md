# Architecture Patterns

## Data Fetching

| Context | Pattern | Tool |
|---------|---------|------|
| Server Component (detail/edit pages) | Direct backendFetch() in async page | lib/api/server.ts |
| Client Component (list pages with filters) | TanStack Query useQuery | @tanstack/react-query |
| Mutations (create/update/delete) | TanStack Query useMutation | @tanstack/react-query |
| URL-synced state (filters/pagination) | useQueryState | nuqs |
| Local UI state | useState, useCallback | React |
| Global app state | Zustand store | zustand |

---

## Server Component Pattern

Use for:
- Detail pages (product detail, order detail)
- Edit pages (edit product, edit category)
- Pages that need SEO
- Pages without real-time updates

Example:
```typescript
// app/dashboard/products/[id]/page.tsx
import { backendFetch } from '@/lib/api/server';
import { cookies } from 'next/headers';

export default async function ProductEditPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map((c) => `${c.name}=${c.value}`).join('; ');

  const res = await backendFetch(`/api/products/${params.id}`, { cookieHeader });
  const { data: product } = await res.json();

  return <ProductForm product={product} />;
}
```

---

## Client Component Pattern

Use for:
- List pages with filters/pagination
- Pages with real-time updates
- Pages with complex interactions

Example:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useQueryState } from 'nuqs';
import { getProducts } from '@/lib/api/products';

export default function ProductsPage() {
  const [page, setPage] = useQueryState('page', { defaultValue: 1 });
  const [search, setSearch] = useQueryState('search', { defaultValue: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search }],
    queryFn: () => getProducts({ page, search }),
  });

  if (isLoading) return <Skeleton />;
  return <ProductList products={data.content} />;
}
```

---

## Mutation Pattern

Example:
```typescript
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrand } from '@/lib/api/brands';
import { toast } from 'sonner';

export function BrandPanel() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand created');
    },
    onError: (error: ApiException) => {
      toast.error(error.error.message);
    },
  });

  return <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} />;
}
```

---

## Dashboard Route Pattern

Structure:
```
app/dashboard/<domain>/
  page.tsx              # List page with useQuery + nuqs
  <domain>-panel.tsx    # Create/edit panel (if simple)
  use-<domain>.ts       # Hook for complex state

OR for complex routes:
  page.tsx              # List page
  <domain>-form.tsx     # Shared create/edit form
  <editor>.tsx          # Sub-editors
  utils.ts              # Domain-specific helpers
```

---

## Error Handling

Client-side:
```typescript
const mutation = useMutation({
  mutationFn: createProduct,
  onError: (error: ApiException) => {
    toast.error(error.error.message);
    if (error.error.code === 'DUPLICATE_SLUG') {
      form.setError('slug', { message: 'Slug already exists' });
    }
  },
});
```

Server-side:
```typescript
try {
  const res = await backendFetch('/api/products');
  if (!res.ok) return <ErrorState />;
  const { data } = await res.json();
  return <ProductList products={data} />;
} catch {
  return <ErrorState message="Network error" />;
}
```

---

## Loading States

Always handle loading, error, and empty states:

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['products'],
  queryFn: getProducts,
});

if (isLoading) return <Skeleton />;
if (error) return <ErrorState />;
if (!data?.content.length) return <EmptyState />;

return <ProductList products={data.content} />;
```

---

## Form Validation

Always validate on both client and server:

Client-side (UX):
```typescript
const form = useForm({
  resolver: zodResolver(productSchema),
});
```

Server-side (Security):
Backend validates again - never trust client-side validation alone.

---

## Accessibility

Always include:
- ARIA labels for icon buttons
- Keyboard navigation (Tab, Enter, Escape)
- Focus management (dialogs, modals)
- Screen reader support
- Color contrast (WCAG AA minimum)

Example:
```typescript
<Button onClick={handleDelete} aria-label="Delete product" variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>
```
