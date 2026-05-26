---
inclusion: always
---

# Best Practices

Proven approaches for maintainable, performant code.

## File Organization

### Co-location First

**Rule**: Keep files in route folder until used by 2+ routes

```
✓ GOOD - Co-located
app/dashboard/products/
  page.tsx              # Route entry
  product-form.tsx      # Only used here
  use-products.ts       # Only used here
  utils.ts              # Only used here

✗ BAD - Premature abstraction
components/product-form.tsx  # Only used in one route
```

### Move to Shared When Reused

**Trigger**: Component/hook used by 2+ routes

**Decision tree**:
```
Used by 2+ routes?
  ├─ UI component? → components/<file>.tsx
  ├─ React hook? → hooks/<file>.ts
  ├─ API wrapper? → lib/api/<domain>.ts
  ├─ Validation schema? → schemas/<domain>.ts
  ├─ Shared type? → types/<file>.ts
  ├─ Utility function? → lib/utils/<file>.ts
  ├─ Global state? → stores/<file>.ts
  └─ React provider? → providers/<file>.tsx
```

### Avoid Premature Abstraction

**Don't create until you have 3+ similar cases**:
- ❌ `components/forms/` before 3+ similar forms
- ❌ `hooks/use-form-state.ts` before 3+ forms with same pattern
- ❌ `lib/utils/validation.ts` before 3+ similar validations

**Do**:
- ✓ Start with co-located files
- ✓ Extract when pattern repeated 2-3 times
- ✓ Refactor with clear evidence of reuse

---

## Component Architecture

### Server Components by Default

**Default to Server Components** unless you need:
- Client-side interactivity (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)
- React hooks (`useState`, `useEffect`)
- Real-time updates

**Benefits**:
- Better performance (less JavaScript)
- Better SEO
- Direct backend access
- Automatic code splitting

### Separate Client and Server Code

**Clear boundaries**:
```typescript
✓ GOOD
lib/api/client.ts  # apiFetch() - client-side only
lib/api/server.ts  # backendFetch() - server-side only

✗ BAD
lib/api.ts  # Both apiFetch() and backendFetch()
```

### Keep Route Handlers Thin

**Route handlers should only**:
- Forward requests to backend
- Handle cookie forwarding
- Handle error responses
- Transform response format (if needed)

**Route handlers should NOT**:
- Contain business logic
- Directly access database
- Perform complex transformations
- Handle authentication logic (that's in `proxy.ts`)

---

## UI Components

### Always Use shadcn/ui

**All shadcn/ui components are installed - use them!**

```typescript
✗ BAD
<button onClick={handleClick}>Click me</button>
<input type="text" />
<select>...</select>
<hr />

✓ GOOD
<Button onClick={handleClick}>Click me</Button>
<Input type="text" />
<Select>...</Select>
<Separator />
```

### Key shadcn/ui Patterns

| Pattern | Rule | Example |
|---------|------|---------|
| Spacing | Use `gap-*` not `space-*` | `flex gap-4` not `space-y-4` |
| Equal dimensions | Use `size-*` | `size-10` not `w-10 h-10` |
| Long text | Use `truncate` | `truncate` not `overflow-hidden text-ellipsis whitespace-nowrap` |
| Colors | Use semantic tokens | `bg-background` not `bg-white` |
| Icons in buttons | Use `data-icon` | `<Eye data-icon="inline-start" />` |
| Forms | Use `FieldGroup` + `Field` | Auto-spacing, no `space-y-*` |
| Avatar | Always include fallback | `<AvatarFallback>` required |
| Dialog/Sheet | Always include title | Use `sr-only` if hidden |

---

## Code Quality

### Type Everything

**Enable strict mode and type all code**:

```typescript
✓ GOOD
function getProduct(id: number): Promise<Product> {
  return apiFetch<Product>(`/api/products/${id}`)
}

✗ BAD
function getProduct(id) {
  return apiFetch(`/api/products/${id}`)
}
```

### Handle All States

**Always handle loading, error, and empty states**:

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

### Validate on Both Sides

**Client-side** (UX):
```typescript
const form = useForm({
  resolver: zodResolver(productSchema)
})
```

**Server-side** (Security):
Backend validates again - never trust client-side validation alone.

---

## Assets & Icons

### Use Proper Icons

| Type | Source | Example |
|------|--------|---------|
| UI icons | lucide-react | `import { Trash2 } from 'lucide-react'` |
| Brand icons | components/icons/brand/ | `import { Facebook } from '@/components/icons/brand'` |
| Custom icons | components/icons/ | `import { Logo } from '@/components/icons'` |

**Never use inline SVG**

---

## Naming Conventions

**All kebab-case** (except Next.js route files):

| Type | Pattern | Example |
|------|---------|---------|
| Components | `kebab-case.tsx` | `brand-panel.tsx` |
| Hooks | `use-*.ts` | `use-mobile.ts` |
| Stores | `kebab-case.ts` | `cart-store.ts` |
| Schemas | `kebab-case.ts` | `auth.ts` in `schemas/` |
| Types | `kebab-case.ts` | `pagination.ts` in `types/` |

**Be descriptive**: `brand-panel.tsx` not `panel.tsx`

---

## Accessibility

### Always Include

- ✓ ARIA labels for icon buttons
- ✓ Keyboard navigation (Tab, Enter, Escape)
- ✓ Focus management (dialogs, modals)
- ✓ Screen reader support
- ✓ Color contrast (WCAG AA minimum)

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

---

## Performance (Vercel Best Practices)

### Eliminate Waterfalls (CRITICAL)

```typescript
✗ BAD - Sequential awaits
async function getData() {
  const user = await fetchUser()
  const posts = await fetchPosts()
  return { user, posts }
}

✓ GOOD - Parallel fetching
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
✗ BAD - Barrel imports
import { Button, Dialog, Card } from '@/components/ui'

✓ GOOD - Direct imports
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'

✗ BAD - Heavy component always loaded
import { HeavyChart } from '@/components/heavy-chart'

✓ GOOD - Dynamic import
const HeavyChart = dynamic(() => import('@/components/heavy-chart'), {
  loading: () => <Skeleton className="h-96" />
})
```

### Server-Side Performance (HIGH)

```typescript
✓ GOOD - Use React.cache() for deduplication
import { cache } from 'react'

const getUser = cache(async (id: number) => {
  return backendFetch(`/api/users/${id}`)
})

✓ GOOD - Parallel fetching in Server Components
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
✗ BAD - Non-primitive dependencies
useEffect(() => {
  doSomething(config)
}, [config]) // config is object, always new reference

✓ GOOD - Primitive dependencies
useEffect(() => {
  doSomething(config)
}, [config.id, config.name]) // primitive values

✗ BAD - Inline component definition
function Parent() {
  const Child = () => <div>Child</div> // Re-created every render
  return <Child />
}

✓ GOOD - Hoist component
const Child = () => <div>Child</div>

function Parent() {
  return <Child />
}
```

---

## Quick Reference

### Component Checklist

When creating a component, ensure:
- [ ] Use shadcn/ui components (not raw HTML)
- [ ] Use semantic tokens (not raw colors)
- [ ] Use `data-icon` for icons in buttons
- [ ] Use `FieldGroup` for forms
- [ ] Handle loading/error/empty states
- [ ] Add ARIA labels for accessibility
- [ ] Type all props and functions
- [ ] Co-locate until reused 2+ times

### Performance Checklist

- [ ] Use `Promise.all()` for parallel fetches
- [ ] Use direct imports (not barrel imports)
- [ ] Use `dynamic()` for heavy components
- [ ] Use `React.cache()` for deduplication
- [ ] Use primitive dependencies in `useEffect`
- [ ] Hoist component definitions outside parent
