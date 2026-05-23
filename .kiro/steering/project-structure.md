# Project Structure

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

---

## Folder Structure

```
nitrotech-ui/
├── proxy.ts                    # Next.js 16 auth boundary
│
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth routes
│   ├── (public)/               # Public routes
│   ├── dashboard/              # Protected admin
│   └── api/
│       └── [...path]/route.ts  # Universal API proxy (BFF)
│
├── components/                 # Shared UI (used by 2+ routes)
│   ├── ui/                     # shadcn/ui primitives (ALL installed)
│   └── icons/
│       └── brand/              # Brand icons
│
├── lib/
│   ├── api/
│   │   ├── client.ts           # apiFetch() - client-side
│   │   ├── server.ts           # backendFetch() - server-side
│   │   └── *.ts                # Domain API wrappers
│   ├── auth/
│   │   ├── session.ts          # getSession()
│   │   └── routes.ts           # PUBLIC_PATHS, PROTECTED
│   ├── utils/
│   └── utils.ts                # cn, slugify, etc.
│
├── hooks/                      # Custom hooks (2+ routes)
├── stores/                     # Zustand stores (kebab-case)
├── schemas/                    # Zod validation
├── types/                      # Shared types
├── providers/                  # React providers
└── public/                     # Static assets
```

---

## Core Directories

### app/ - Next.js App Router

Route segments, layouts, pages, and route-specific components/hooks/utils.

Key principles:
- Co-locate first: If only used by one route, keep it in that route folder
- Move to components/ only when reused across 2+ routes
- Use route groups (auth), (public) for shared layouts

Example:
```
app/dashboard/products/
  page.tsx              # Route entry
  product-form.tsx      # Component only used here
  use-products.ts       # Hook only used here
  utils.ts              # Helpers only used here
```

### app/api/ - API Routes (BFF)

Single universal proxy: app/api/[...path]/route.ts

Purpose:
- Forward ALL client requests to Spring Boot backend
- Handle cookie forwarding
- Hide backend URLs from client

DO NOT:
- Create separate route handlers for each endpoint
- Put business logic in route handlers

### components/ - Shared UI

Components used by 2+ routes.

Structure:
- ui/ - shadcn/ui primitives (ALL components installed)
- icons/ - Custom icons
- icons/brand/ - Brand icons

Icon usage:
- UI icons (arrows, menus) → lucide-react
- Brand icons (Facebook, Google) → components/icons/brand/
- Custom icons (logo) → components/icons/
- Never use inline SVG

shadcn/ui key patterns:
- Use `gap-*` instead of `space-x-*` or `space-y-*` for spacing
- Use `size-*` when width and height are equal (e.g., `size-10` not `w-10 h-10`)
- Use `truncate` shorthand instead of `overflow-hidden text-ellipsis whitespace-nowrap`
- Use semantic color tokens (`bg-background`, `text-muted-foreground`) instead of raw colors
- Icons in buttons use `data-icon` attribute (no sizing classes needed on icons)
- Forms use `FieldGroup` component to wrap multiple `Field` components (handles spacing automatically)
- Always include `AvatarFallback` with `Avatar` (displays when image fails to load)
- Dialog/Sheet/Drawer always need a Title component (use `className="sr-only"` if visually hidden)

Always use shadcn/ui components instead of raw HTML:
- Button not <button>
- Input not <input>
- Dialog not custom modals
- Select not <select>
- Separator not <hr>
- Separator not <hr>

### lib/api/ - API Layer

HTTP fetch utilities and API wrappers.

Files:
- client.ts - apiFetch() for client-side (browser)
- server.ts - backendFetch() for server-side (Server Components, Route Handlers)
- auth.ts, products.ts, etc. - Domain API wrappers

DO NOT:
- Call backendFetch() from lib/api/ wrappers (Server Components only)
- Mix client and server fetch in same file

### lib/auth/ - Authentication

Auth logic, session management, route protection.

Files:
- session.ts - getSession() for server-side session retrieval
- routes.ts - PUBLIC_PATHS, PROTECTED (shared config)

### schemas/ - Zod Validation

Form validation schemas at root level. One file per domain.

Example: schemas/auth.ts, schemas/products.ts, schemas/categories.ts

### types/ - Shared Types

Types used across multiple domains at root level.

When to put types here:
- Used across multiple domains (e.g., Page<T>)
- Used in UI components, not just API layer (e.g., TreeNode)
- Generic utility types (e.g., PaginationParams)

When NOT:
- API request/response for one domain → Keep in lib/api/<domain>.ts
- Form data shapes → Infer from zod schemas in schemas/

### hooks/ - Custom Hooks

Custom React hooks used across 2+ routes.

When to use:
- Used by multiple routes
- General-purpose hooks (use-mobile, use-copy)

When NOT:
- Tightly coupled to one route → Keep in route folder

### stores/ - Zustand Stores

Global app state using Zustand at root level.

Naming: kebab-case.ts (e.g., cart-store.ts, auth-store.ts)

When to use:
- Cross-component state (shopping cart)
- State that persists across route changes

When NOT:
- Server data → Use TanStack Query
- URL-synced state → Use nuqs
- Component-local state → Use useState

### providers/ - React Providers

React context providers at root level.

Example: QueryClientProvider, NuqsAdapter, ThemeProvider, etc.

Used in app/layout.tsx to wrap the entire app.

---

## Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Route files | page.tsx, layout.tsx, loading.tsx, error.tsx | app/dashboard/brands/page.tsx |
| Route Handlers | route.ts | app/api/[...path]/route.ts |
| Components | kebab-case.tsx | brand-panel.tsx, product-form.tsx |
| Hooks | use-*.ts | use-brands.ts, use-mobile.ts |
| Stores | kebab-case.ts | cart-store.ts, auth-store.ts |
| API files | kebab-case.ts | lib/api/brands.ts, lib/api/products.ts |
| Schemas | kebab-case.ts | schemas/auth.ts, schemas/products.ts |
| Types | kebab-case.ts | types/pagination.ts, types/categories.ts |
| Providers | kebab-case.tsx | providers/query-provider.tsx |
| Utils | kebab-case.ts | lib/utils/formatting.ts |

Rules:
- Be descriptive: brand-panel.tsx not panel.tsx
- route.ts reserved for Route Handlers in app/api/ only
- Default export only for Next.js route files (page.tsx, layout.tsx, etc.)
- Named exports for everything else

---

## File Placement Rules

Decision tree:

```
Is it a route file (page.tsx, layout.tsx)?
  → app/<route>/

Is it only used by ONE route?
  → app/<route>/<file>.tsx

Is it used by 2+ routes?
  ↓
  Is it a UI component? → components/<file>.tsx
  Is it a React hook? → hooks/<file>.ts
  Is it an API wrapper? → lib/api/<domain>.ts
  Is it a validation schema? → schemas/<domain>.ts
  Is it a type used across multiple domains? → types/<file>.ts
  Is it a utility function? → lib/utils/<file>.ts or lib/utils.ts
  Is it global state? → stores/<file>.ts
  Is it a React provider? → providers/<file>.tsx
```

Type placement:

| Situation | Location |
|-----------|----------|
| API request/response for one domain | lib/api/<domain>.ts |
| Used across multiple domains | types/<name>.ts |
| Used in UI components, not just API | types/<name>.ts |
| Generic utility type (Page<T>) | types/pagination.ts |
| Form data shape (inferred from zod) | schemas/<domain>.ts |

---

## Key Principles

1. Co-locate first - Keep files close to where they're used
2. Move to shared only when reused - Don't abstract prematurely
3. Separate client and server - Clear boundaries
4. Use Server Components by default - Better performance
5. Use shadcn/ui components - Never raw HTML elements
6. Type everything - TypeScript strict mode
7. Follow conventions - Naming, file structure, patterns

Remember:
- Route-specific files stay in route folders
- Shared files go in components/, hooks/, lib/
- One universal API proxy in app/api/[...path]/route.ts
- Auth boundary in proxy.ts
- schemas/, types/, stores/, providers/ at root level
- All naming in kebab-case (except route files)
- Always use shadcn/ui components instead of raw HTML
