# Best Practices

## Co-location First

If a file is only used by one route, keep it in that route folder.

Example:
```
BAD - Premature abstraction:
components/product-form.tsx  # Only used in /dashboard/products

GOOD - Co-locate first:
app/dashboard/products/product-form.tsx  # Keep here until reused
```

---

## Move to Shared Only When Reused

Move to components/ when:
- Component is used by 2+ routes
- Component is genuinely reusable

---

## Avoid Premature Abstraction

Don't:
- Create components/forms/ before you have 3+ similar forms
- Create hooks/use-form-state.ts before you have 3+ forms with same pattern
- Create lib/utils/validation.ts before you have 3+ similar validations

Do:
- Start with co-located files
- Extract to shared when pattern repeated 2-3 times
- Refactor when you have clear evidence of reuse

---

## Keep Route Handlers Thin

Route handlers should only:
- Forward requests to backend
- Handle cookie forwarding
- Handle error responses
- Transform response format (if needed)

Route handlers should NOT:
- Contain business logic
- Directly access database
- Perform complex transformations
- Handle authentication logic (that's in proxy.ts)

---

## Use Server Components by Default

Default to Server Components unless you need:
- Client-side interactivity (onClick, onChange)
- Browser APIs (localStorage, window)
- React hooks (useState, useEffect)
- Real-time updates

Benefits:
- Better performance (less JavaScript)
- Better SEO
- Direct database/API access
- Automatic code splitting

---

## Separate Client and Server Code

Clear boundaries:
```typescript
GOOD:
lib/api/client.ts  # apiFetch() - client-side only
lib/api/server.ts  # backendFetch() - server-side only

BAD:
lib/api.ts  # Both apiFetch() and backendFetch()
```

---

## Use shadcn/ui Components

Always use shadcn/ui components instead of raw HTML elements:

```typescript
BAD:
<button onClick={handleClick}>Click me</button>
<input type="text" value={value} onChange={handleChange} />
<select>...</select>
<hr />
<div className="border-t" />

GOOD:
<Button onClick={handleClick}>Click me</Button>
<Input value={value} onChange={handleChange} />
<Select>...</Select>
<Separator />
```

All shadcn/ui components are already installed. Use them!

Key shadcn/ui patterns:
- Use `gap-*` instead of `space-x-*` or `space-y-*`
- Use `size-*` when width and height are equal (e.g., `size-10` not `w-10 h-10`)
- Use `truncate` shorthand instead of `overflow-hidden text-ellipsis whitespace-nowrap`
- Use semantic colors (`bg-background`, `text-muted-foreground`) not raw colors
- Use `cn()` for conditional classes
- Icons in buttons use `data-icon` attribute (no sizing classes on icons)
- Forms use `FieldGroup` + `Field` structure
- Always include `AvatarFallback` with `Avatar`
- Dialog/Sheet/Drawer always need a Title (use `className="sr-only"` if hidden)

---

## Type Everything

Enable strict mode and type all code:

```typescript
GOOD:
function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`);
}

BAD:
function getProduct(id) {
  return apiFetch(`/api/products/${id}`);
}
```

---

## Handle All States

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

## Validate on Both Sides

Client-side (UX):
```typescript
const form = useForm({
  resolver: zodResolver(productSchema),
});
```

Server-side (Security):
Backend validates again - never trust client-side validation alone.

---

## Use Proper Icons

- UI icons (arrows, menus) → lucide-react
- Brand icons (Facebook, Google) → components/icons/brand/
- Custom icons (logo) → components/icons/
- Never use inline SVG

---

## Follow Naming Conventions

- Components: kebab-case.tsx (product-form.tsx)
- Hooks: use-*.ts (use-mobile.ts)
- Stores: kebab-case.ts (cart-store.ts)
- Schemas: kebab-case.ts (auth.ts in schemas/)
- Types: kebab-case.ts (pagination.ts in types/)
- Be descriptive: brand-panel.tsx not panel.tsx

---

## Accessibility Always

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


---

## React Performance (Vercel Best Practices)

### Eliminate Waterfalls (CRITICAL)

```typescript
BAD - Sequential awaits:
async function getData() {
  const user = await fetchUser()
  const posts = await fetchPosts()
  return { user, posts }
}

GOOD - Parallel fetching:
async function getData() {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ])
  return { user, posts }
}
```

### Bundle Size Optimization (CRITICAL)

```typescript
BAD - Barrel imports:
import { Button, Dialog, Card } from '@/components/ui'

GOOD - Direct imports:
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'

BAD - Heavy component always loaded:
import { HeavyChart } from '@/components/heavy-chart'

GOOD - Dynamic import:
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <Skeleton className="h-96" />
})
```

### Server-Side Performance (HIGH)

```typescript
GOOD - Use React.cache() for deduplication:
import { cache } from 'react'

const getUser = cache(async (id: number) => {
  return backendFetch(`/api/users/${id}`)
})

GOOD - Parallel fetching in Server Components:
async function Page() {
  const [user, posts] = await Promise.all([
    getUser(1),
    getPosts()
  ])
  return <UserProfile user={user} posts={posts} />
}
```

### Re-render Optimization (MEDIUM)

```typescript
BAD - Non-primitive dependencies:
useEffect(() => {
  doSomething(config)
}, [config]) // config is object, always new reference

GOOD - Primitive dependencies:
useEffect(() => {
  doSomething(config)
}, [config.id, config.name]) // primitive values

BAD - Inline component definition:
function Parent() {
  const Child = () => <div>Child</div> // Re-created every render
  return <Child />
}

GOOD - Hoist component:
const Child = () => <div>Child</div>

function Parent() {
  return <Child />
}
```
