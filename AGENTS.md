# Karpathy Behavioral Guidelines

These guidelines reduce common LLM coding mistakes. Merge them with project-specific instructions as needed.

Tradeoff: these guidelines bias toward caution over speed. For trivial tasks, use judgment.

## Think Before Coding

Do not assume, hide confusion, or skip tradeoffs.

Before implementing:
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them instead of picking silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop, name what is confusing, and ask.

## Simplicity First

Use the minimum code that solves the problem. Do not add speculative features.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, simplify.

Ask: would a senior engineer say this is overcomplicated? If yes, simplify.

## Surgical Changes

Touch only what is necessary. Clean up only your own changes.

When editing existing code:
- Do not improve adjacent code, comments, or formatting unless required.
- Do not refactor things that are not broken.
- Match existing style, even if you would choose differently.
- If unrelated dead code is noticed, mention it instead of deleting it.

When changes create orphans:
- Remove imports, variables, or functions made unused by the current change.
- Do not remove pre-existing dead code unless asked.

Every changed line should trace directly to the user's request.

## Goal-Driven Execution

Define verifiable success criteria and loop until verified.

Transform tasks into concrete checks:
- "Add validation" -> write tests for invalid inputs, then make them pass.
- "Fix the bug" -> write a test that reproduces it, then make it pass.
- "Refactor X" -> ensure tests pass before and after.

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

These guidelines are working if diffs have fewer unnecessary changes, fewer rewrites happen due to overcomplication, and clarifying questions come before implementation mistakes.

## NitroTech UI project rules

Use these rules for changes under `nitrotech-ui`. Treat this file as the canonical project guidance for coding agents.

### Stack

- Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, shadcn/ui, lucide-react, TanStack Query, nuqs, Zustand, react-hook-form, Zod, and sonner.
- The backend is a Spring Boot REST API. Authentication is session-based with HTTP-only cookies.

### Project structure

- Keep files co-located in a route folder until they are reused by two or more routes.
- Move reused UI to `components/`, reused hooks to `hooks/`, API wrappers to `lib/api/`, schemas to `schemas/`, shared types to `types/`, utilities to `lib/utils/`, global state to `stores/`, and providers to `providers/`.
- Use kebab-case filenames except for Next.js route files such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `route.ts`.
- Use default exports only for Next.js route files. Use named exports elsewhere.

### Shared code placement

- Keep `lib/utils.ts` limited to `cn()` and other shadcn-level primitives expected by generated UI.
- Put generic reusable helpers in `lib/utils/<topic>.ts`, such as `formatting.ts`, `string.ts`, `errors.ts`, and `cloudinary.ts`.
- Put domain UI helpers in `lib/utils/<domain>.ts` only when reused across routes or components; otherwise co-locate them beside the component that uses them.
- Put API calls and API response shaping in `lib/api/**`; do not put request logic in hooks, stores, schemas, or components.
- Put Zod schemas and inferred form/input types in `schemas/`; put backend/shared DTO types in `types/` only when they are not owned by an API wrapper.
- Put React hooks in `hooks/` only when reused; route-specific hooks stay co-located in the route folder.
- Put Zustand stores in `stores/` only for cross-route client state, not server data already owned by TanStack Query.
- Avoid barrel files for shared helpers unless repeated imports become noisy in real usage.

### Data fetching and state

- Server Components fetch directly with `backendFetch()` from `lib/api/server.ts`.
- Client Components call domain wrappers that use `apiFetch()` from `lib/api/client.ts`.
- Do not mix client-only and server-only APIs in the same file.
- All client requests go through the universal proxy at `app/api/[...path]/route.ts`.
- Keep route handlers thin: forward requests, cookies, and errors. Do not add business logic there.
- Use TanStack Query for server data and mutations.
- Use `nuqs` for filters, pagination, search params, and other URL state.
- Use Zustand only for cross-route app state such as cart state. Do not use it for server data.
- Handle loading, error, empty, and success states for data-driven UI.

### UI and design system

- Use shadcn/ui primitives instead of raw HTML controls where a component exists.
- Use semantic tokens such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, and `bg-muted`; avoid raw color utilities for product UI.
- Use `gap-*`, not `space-x-*` or `space-y-*`.
- Use `size-*` when width and height are equal.
- Use `truncate`, not the long overflow/text-overflow/whitespace combination.
- Icons inside buttons use `data-icon="inline-start"` or `data-icon="inline-end"` and should not carry manual size classes.
- Forms use `FieldGroup` and `Field` when those components are available.
- `Avatar` needs `AvatarFallback`.
- Dialog, Sheet, and Drawer need a title. Use `sr-only` when the title should be hidden visually.
- Use `Separator` instead of `hr`, `Badge` instead of custom status spans, `Skeleton` for loading placeholders, and sonner `toast()` for notifications.

### Component quality

- Prefer Server Components by default. Add `"use client"` only for interactivity, hooks, browser APIs, or client state.
- Keep components focused on one job. Split components whose names or responsibilities drift into "and".
- Design props as a clear contract. Avoid vague props such as `data`, `config`, or `options` unless the type makes the purpose obvious.
- Keep reusable components predictable: pass data in through props and keep fetching/mutations in pages, hooks, or feature-level containers.
- Expose loading, empty, disabled, and error states through props where a component needs to be testable.
- Add ARIA labels for icon-only actions and preserve keyboard/focus behavior.

### Performance

- Avoid request waterfalls. Use `Promise.all()` when independent data can load in parallel.
- Prefer direct imports over barrel imports for UI components.
- Dynamically import heavy editors, charts, or rarely used panels when they are not needed for first render.
- Hoist inline component definitions out of parent components.
- Use primitive dependencies in React hooks when possible.
- Use `React.cache()` for repeated server-side fetches that should dedupe.

### Verification

- For frontend changes, run `npm run typecheck` and `npm run lint` from `nitrotech-ui` when feasible.
- Run `npm run build` before deployment or before a demo milestone.

<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated - the docs are the source of truth.

<!-- END:nextjs-agent-rules -->
