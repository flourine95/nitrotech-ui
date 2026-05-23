# Anti-Patterns (Avoid)

## Mixing Client and Server Code

```typescript
BAD:
'use client';
import { cookies } from 'next/headers'; // Server-only API

GOOD:
lib/api/client.ts - client-side only
lib/api/server.ts - server-side only
```

---

## Calling apiFetch() from Server Components

```typescript
BAD - Unnecessary round-trip:
export default async function ProductPage() {
  const product = await apiFetch('/api/products/1'); // Goes through BFF
}

GOOD - Direct backend call:
export default async function ProductPage() {
  const cookieHeader = (await cookies()).getAll().map(...).join('; ');
  const res = await backendFetch('/api/products/1', { cookieHeader });
  const { data: product } = await res.json();
}
```

---

## Business Logic in Route Handlers

```typescript
BAD:
export async function POST(request: Request) {
  const body = await request.json();
  if (!body.name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
  const price = body.basePrice * (1 + body.taxRate);
  await db.products.create({ ...body, price });
}

GOOD - Just proxy:
export async function POST(request: Request) {
  const body = await request.text();
  const cookieHeader = request.headers.get('cookie') ?? undefined;
  const backendRes = await backendFetch('/api/products', { method: 'POST', body, cookieHeader });
  return new NextResponse(await backendRes.text(), { status: backendRes.status });
}
```

---

## Separate Route Handlers for Each Endpoint

```typescript
BAD:
app/api/products/route.ts
app/api/categories/route.ts
app/api/brands/route.ts

GOOD:
app/api/[...path]/route.ts  # Handles ALL endpoints
```

---

## Not Using TanStack Query

```typescript
BAD:
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
  setLoading(true);
  getProducts().then(setProducts).finally(() => setLoading(false));
}, []);

GOOD:
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: getProducts,
});
```

---

## Not Using nuqs for URL State

```typescript
BAD:
const [search, setSearch] = useState('');
const [page, setPage] = useState(1);

GOOD:
const [search, setSearch] = useQueryState('search');
const [page, setPage] = useQueryState('page', { defaultValue: 1 });
```

---

## Using Raw HTML Elements

```typescript
BAD:
<button onClick={handleClick}>Click</button>
<input type="text" />
<select>...</select>
<div className="modal">...</div>
<hr />
<div className="border-t" />
<div className="space-y-4">...</div>
<div className="w-10 h-10">...</div>

GOOD:
<Button onClick={handleClick}>Click</Button>
<Input type="text" />
<Select>...</Select>
<Dialog>...</Dialog>
<Separator />
<div className="flex flex-col gap-4">...</div>
<div className="size-10">...</div>
```

All shadcn/ui components are installed - use them!

Key violations:
- Using `space-x-*` or `space-y-*` instead of `flex` with `gap-*` for spacing
- Using separate `w-*` and `h-*` instead of `size-*` when width and height are equal
- Using raw Tailwind colors instead of semantic tokens (`bg-background`, `text-foreground`, etc.)
- Not using `data-icon` attribute on icons inside Button components
- Using `space-y-*` on forms instead of `FieldGroup` component (which handles spacing automatically)
- Using `Avatar` without `AvatarFallback` (required for when image fails to load)
- Using Dialog/Sheet/Drawer without a Title (required for accessibility)

---

## Hardcoding Values

```typescript
BAD:
const BACKEND_URL = 'http://localhost:8080';

GOOD:
const BACKEND_URL = process.env.BACKEND_URL;
```

---

## Ignoring TypeScript Errors

```typescript
BAD:
// @ts-ignore
const product = data.product;

GOOD:
const product = data.product as Product;
// OR better - fix the API type
```

---

## Not Handling Loading/Error States

```typescript
BAD:
const { data } = useQuery({ queryKey: ['products'], queryFn: getProducts });
return <ProductList products={data.content} />; // Crashes if undefined

GOOD:
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

## Using Inline SVG

```typescript
BAD:
<svg>...</svg>

GOOD:
import { Trash2 } from 'lucide-react';
<Trash2 className="h-4 w-4" />

// OR for brand icons:
import { Facebook } from '@/components/icons/brand';
<Facebook className="h-5 w-5" />
```

---

## Premature Abstraction

```typescript
BAD - Creating shared component too early:
components/forms/product-form.tsx  # Only used once

GOOD - Co-locate first:
app/dashboard/products/product-form.tsx  # Move when reused
```

---

## Not Following Naming Conventions

```typescript
BAD:
components/Panel.tsx
hooks/useBrands.ts
stores/cart.store.ts
lib/api/Products.ts

GOOD:
components/brand-panel.tsx
hooks/use-brands.ts
stores/cart-store.ts
lib/api/products.ts
```

---

## Missing Accessibility

```typescript
BAD:
<button onClick={handleDelete}>
  <Trash2 />
</button>

GOOD:
<Button onClick={handleDelete} aria-label="Delete product" variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>
```


---

## React Performance Anti-Patterns

### Sequential Awaits (Waterfall)

```typescript
BAD:
async function loadData() {
  const user = await fetchUser()
  const settings = await fetchSettings() // Waits for user
  const posts = await fetchPosts()       // Waits for settings
  return { user, settings, posts }
}

GOOD:
async function loadData() {
  const [user, settings, posts] = await Promise.all([
    fetchUser(),
    fetchSettings(),
    fetchPosts()
  ])
  return { user, settings, posts }
}
```

### Barrel Imports

```typescript
BAD:
import { Button, Dialog, Card, Input } from '@/components/ui'

GOOD:
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
```

### Not Using Dynamic Imports

```typescript
BAD:
import { HeavyEditor } from '@/components/heavy-editor'

export default function Page() {
  return <HeavyEditor />
}

GOOD:
import dynamic from 'next/dynamic'

const HeavyEditor = dynamic(() => import('@/components/heavy-editor'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false
})

export default function Page() {
  return <HeavyEditor />
}
```

### Inline Component Definitions

```typescript
BAD:
function Parent() {
  const Child = () => <div>Child</div> // Re-created every render
  return <Child />
}

GOOD:
const Child = () => <div>Child</div>

function Parent() {
  return <Child />
}
```

### Non-Primitive Dependencies

```typescript
BAD:
const config = { id: 1, name: 'test' }
useEffect(() => {
  doSomething(config)
}, [config]) // Object reference changes every render

GOOD:
const config = { id: 1, name: 'test' }
useEffect(() => {
  doSomething(config)
}, [config.id, config.name]) // Primitive values
```

### Not Using React.cache()

```typescript
BAD - Multiple fetches for same data:
async function Component1() {
  const user = await fetchUser(1)
  return <div>{user.name}</div>
}

async function Component2() {
  const user = await fetchUser(1) // Duplicate fetch
  return <div>{user.email}</div>
}

GOOD - Deduplicated with React.cache():
import { cache } from 'react'

const getUser = cache(async (id: number) => {
  return fetchUser(id)
})

async function Component1() {
  const user = await getUser(1)
  return <div>{user.name}</div>
}

async function Component2() {
  const user = await getUser(1) // Uses cached result
  return <div>{user.email}</div>
}
```
