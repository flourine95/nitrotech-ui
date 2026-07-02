# NitroTech UI

NitroTech UI is the Next.js frontend for the NitroTech e-commerce platform. It includes public shopping flows, customer account pages, checkout, and an admin dashboard.

## Requirements

- Node.js 20+
- NitroTech API running at `http://localhost:8080`, or another URL configured through `.env.local`

## Quick start

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```env
BACKEND_URL=http://localhost:8080
```

Run the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Build the production app |
| `npm run start` | Start the production server after build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run format` | Format TypeScript and TSX files with Prettier |

## Environment variables

- `BACKEND_URL`: API URL used by Server Components and Route Handlers
- `NEXT_PUBLIC_SEPAY_BANK`, `NEXT_PUBLIC_SEPAY_ACCOUNT`, `NEXT_PUBLIC_SEPAY_ACCOUNT_HOLDER`: optional checkout transfer details
- `NEXT_PUBLIC_ENABLE_SHIPMENT_SIMULATION`: optional dashboard shipment simulation toggle

## Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS v4 and shadcn/ui |
| Icons | lucide-react |
| Forms | react-hook-form and Zod |
| Server state | TanStack Query |
| URL state | nuqs |
| Global state | Zustand |
| Toasts | sonner |
| Drag and drop | @dnd-kit/react |

## Project structure

```text
app/
  (auth)/                 # Login, register, forgot password, reset password
  (public)/               # Storefront, product, cart, checkout, account pages
  api/                    # BFF route handlers
  dashboard/              # Admin dashboard modules

components/
  dashboard/              # Shared dashboard components
  icons/                  # Project and brand icons
  ui/                     # shadcn/ui primitives

hooks/                    # Shared React hooks
lib/
  api/                    # Domain API wrappers
  auth/                   # Session and route helpers
  data/                   # Static data
  utils/                  # Formatting and utility helpers
providers/                # App-level providers
schemas/                  # Zod schemas
stores/                   # Zustand stores
types/                    # Shared TypeScript types
```

Keep route-specific files co-located under their route folder until they are reused by at least two routes.

## API architecture

Client Components call the local BFF proxy:

```text
Client Component
  -> apiFetch('/api/products')        lib/api/client.ts
  -> app/api/[...path]/route.ts       BFF proxy
  -> backendFetch('/api/products')    lib/api/server.ts
  -> Spring Boot API
```

Server Components use `backendFetch()` directly.

## Design guidance

- [DESIGN.md](./DESIGN.md) contains the NitroTech UI design system and visual rules.
- [AGENTS.md](./AGENTS.md) contains project guidance for coding agents.
- [.docs](./.docs) contains longer-lived technical notes and decisions.

## shadcn/ui

Add components with:

```bash
npx shadcn@latest add <component>
```

Use existing shadcn/ui primitives before building custom controls.
