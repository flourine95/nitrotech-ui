---
inclusion: manual
---

# Design System - NitroTech

Version: 3.0.0  
Framework: shadcn/ui (radix-nova)

---

## Design Philosophy

**Core Principles**:
1. Professional First - Enterprise-ready, trustworthy
2. Clean & Minimal - Less is more
3. Timeless Design - Avoid trendy effects
4. Neutral Palette - Subtle colors
5. Purposeful Interactions - Every animation has a reason

**Avoid "AI Look"**: No purple/pink gradients, glassmorphism, heavy shadows, colored shadows, excessive animations

---

## Critical Rules

### Use Semantic Tokens (Not Raw Colors)

shadcn/ui requires semantic tokens for dark mode support.

| Category | Semantic Token | Replaces |
|----------|---------------|----------|
| Text | `text-foreground` | `text-slate-900` |
| Text | `text-muted-foreground` | `text-slate-500` |
| Text | `text-primary` | `text-blue-600` |
| Background | `bg-background` | `bg-white` |
| Background | `bg-card` | `bg-white` |
| Background | `bg-muted` | `bg-slate-50` |
| Border | `border-border` | `border-slate-200` |
| Border | `border-input` | `border-slate-200` |

### Use `gap-*` (Not `space-*`)

```tsx
✗ BAD
<div className="space-y-4">

✓ GOOD
<div className="flex flex-col gap-4">
```

### Use `FieldGroup` for Forms

```tsx
✗ BAD
<form className="space-y-4">
  <Field>...</Field>
</form>

✓ GOOD
<form>
  <FieldGroup>
    <Field>...</Field>
  </FieldGroup>
</form>
```

### Use `data-icon` in Components

```tsx
✗ BAD
<Button>
  <Eye className="h-4 w-4" />
  View
</Button>

✓ GOOD
<Button>
  <Eye data-icon="inline-start" />
  View
</Button>
```

---

## Typography

| Size | Usage | Example |
|------|-------|---------|
| `text-2xl` | Page titles (h1) | `<h1 className="text-2xl font-bold">Login</h1>` |
| `text-xl` | Section titles (h2) | `<h2 className="text-xl font-bold">Personal Info</h2>` |
| `text-lg` | Subsection titles (h3) | `<h3 className="text-lg font-semibold">Details</h3>` |
| `text-base` | Body text | `<p className="text-base">Content</p>` |
| `text-sm` | Labels, secondary text | `<label className="text-sm font-medium">Email</label>` |
| `text-xs` | Captions, helper text | `<span className="text-xs text-muted-foreground">Min 6 chars</span>` |

**Font weights**: `font-bold` (700), `font-semibold` (600), `font-medium` (500), `font-normal` (400)

---

## Spacing

### Use `gap-*` (Not `space-*`)

```tsx
✗ BAD
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

✓ GOOD
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Common Spacing

| Context | Class | Value |
|---------|-------|-------|
| Card padding | `p-8` | 32px |
| Form spacing | `<FieldGroup>` | Auto |
| Section spacing | `mb-6` | 24px |
| Major sections | `mb-8` | 32px |
| Button padding | `px-4 py-3` | 16px / 12px |
| Input padding | `px-4 py-3` | 16px / 12px |

---

## Border Radius

| Class | Size | Usage |
|-------|------|-------|
| `rounded-lg` | 8px | Default for most elements |
| `rounded-xl` | 12px | Larger cards, dropdowns |
| `rounded-2xl` | 16px | Icons, avatars, modals |
| `rounded-3xl` | 24px | Cards |
| `rounded-full` | 9999px | Buttons, inputs, pills, badges |

**Pill shape** (`rounded-full`): Buttons, text inputs, search bars, tags, badges, chips  
**Rounded corners**: Cards (`rounded-3xl`), modals (`rounded-2xl`), dropdowns (`rounded-xl`), images (`rounded-lg`)

---

## Buttons

### Sizes

```tsx
// Default button
className="h-auto px-4 py-3 font-semibold"

// Small button
className="h-auto px-3 py-2.5 font-semibold"

// Icon button
size="icon"
className="h-full px-3"
```

### Variants

```tsx
// Primary
<Button className="h-auto rounded-full py-3 font-semibold">
  Login
</Button>

// Outline
<Button variant="outline" className="h-auto rounded-full py-2.5">
  Google
</Button>

// Ghost (for icon buttons)
<Button variant="ghost" size="icon" className="h-full px-3 hover:bg-transparent">
  <Eye data-icon />
</Button>

// Destructive
<Button variant="destructive" className="h-auto rounded-full py-3 font-semibold">
  Delete
</Button>
```

### States

```tsx
// Disabled
<Button disabled>Unavailable</Button>

// Loading
<Button disabled>
  <Spinner data-icon="inline-start" />
  Processing...
</Button>
```

### DO NOT Add Custom Hover Effects

```tsx
// BAD - Button has built-in hover effects
<Button className="hover:scale-[1.02] hover:shadow-lg">

// GOOD - Let button handle it
<Button>
```

---

## Form Inputs

### IMPORTANT: Always Use `FieldGroup`

```tsx
// BAD - Don't use space-y-*
<form className="space-y-4">
  <Field>...</Field>
  <Field>...</Field>
</form>

// GOOD - Use FieldGroup
<form>
  <FieldGroup>
    <Field>...</Field>
    <Field>...</Field>
  </FieldGroup>
</form>
```

### Text Input

```tsx
<Input
  type="text"
  placeholder="Enter text"
  className="h-auto rounded-full px-4 py-3"
/>
```

### Password Input (with toggle)

```tsx
<div className="relative">
  <Input
    type={showPass ? 'text' : 'password'}
    className="h-auto rounded-full px-4 py-3 pr-12"
  />
  <Button
    variant="ghost"
    size="icon"
    className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
  >
    <Eye data-icon />
  </Button>
</div>
```

### Validation Pattern

```tsx
<Field data-invalid={!!errors.email}>
  <FieldLabel htmlFor="email">Email</FieldLabel>
  <Input id="email" aria-invalid={!!errors.email} />
  {errors.email && (
    <FieldDescription>{errors.email.message}</FieldDescription>
  )}
</Field>

// Note:
// - data-invalid on Field
// - aria-invalid on Input
```

---

## Cards

### Standard Card

```tsx
<div className="rounded-3xl border bg-card p-8 shadow-lg">
  {/* Content */}
</div>

// Properties:
// Border radius: 24px (rounded-3xl)
// Border: border (semantic token)
// Background: bg-card (semantic token)
// Padding: 32px (p-8)
// Shadow: shadow-lg (balanced)
```

### Card with Hover

```tsx
<div className="rounded-3xl border bg-card p-8 shadow-lg transition-shadow hover:shadow-xl">
  {/* Content */}
</div>
```

### Card Structure

```tsx
// Header
<div className="mb-8 text-center">
  <h1 className="mb-1 text-2xl font-bold">Title</h1>
  <p className="text-sm text-muted-foreground">Subtitle</p>
</div>

// Body
<FieldGroup>
  {/* Form fields or content */}
</FieldGroup>

// Footer
<p className="mt-6 text-center text-sm text-muted-foreground">
  Footer text
</p>
```

---

## Shadows

| Class | Usage | Notes |
|-------|-------|-------|
| `shadow-md` | Small elements | OK for small components |
| `shadow-lg` | Cards | **RECOMMENDED** |
| `shadow-xl` | Hover states, dropdowns | For emphasis |
| `shadow-2xl` | Modals only | Too dramatic for most |

**Rules**:
- ✓ Use default shadows (`shadow-lg`)
- ✗ Don't use colored shadows (`shadow-slate-900/10`)
- ✓ Cards: `shadow-lg hover:shadow-xl`

---

## Icons

### Use `data-icon` in Components

```tsx
✗ BAD
<Button>
  <Eye className="h-4 w-4" />
  Text
</Button>

✓ GOOD
<Button>
  <Eye data-icon="inline-start" />
  Text
</Button>
```

**Values**: `data-icon="inline-start"` (icon at start), `data-icon="inline-end"` (icon at end)

### Sizes (Outside Components)

Only use when icon is NOT inside Button, Input, etc.

| Class | Size | Usage |
|-------|------|-------|
| `size-3` | 12px | Tiny icons |
| `size-3.5` | 14px | Small icons (arrows) |
| `size-4` | 16px | Default icons (most common) |
| `size-5` | 20px | Medium icons |
| `size-6` | 24px | Large icons |
| `size-8` | 32px | Logo, hero icons |

**Note**: Use `size-*` instead of `h-* w-*`

### Icon Sources

| Type | Source | Example |
|------|--------|---------|
| UI icons | lucide-react | `import { Eye, Mail } from 'lucide-react'` |
| Brand icons | components/icons/brand/ | `import { Facebook } from '@/components/icons/brand'` |
| Custom icons | components/icons/ | `import { Logo } from '@/components/icons'` |

---

## Animations & Transitions

| Duration | Usage |
|----------|-------|
| `duration-150` | Quick interactions (hover, focus) |
| `duration-200` | Standard transitions (most common) |
| `duration-300` | Slow transitions (shadows, complex) |
| `duration-700` | Page entrance animations |

### Common Patterns

```tsx
// Shadow transition
transition-shadow hover:shadow-xl

// Color transition
transition-colors hover:text-primary

// Page entrance
animate-in fade-in slide-in-from-bottom-4 duration-700
```

**DO NOT** add custom animations on components - they handle animations themselves.

---

## Layouts

### Container Widths

| Class | Width | Usage |
|-------|-------|-------|
| `max-w-md` | 448px | Forms, auth pages |
| `max-w-lg` | 512px | Small content |
| `max-w-xl` | 576px | Medium content |
| `max-w-2xl` | 672px | Large content |
| `max-w-4xl` | 896px | Wide content |
| `max-w-7xl` | 1280px | Full width content |

### Common Patterns

```tsx
// Two columns (social buttons)
<div className="grid grid-cols-2 gap-3">

// Responsive grid
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

// Horizontal flex
<div className="flex items-center gap-2">

// Vertical flex
<div className="flex flex-col gap-4">

// Space between
<div className="flex items-center justify-between">

// Center
<div className="flex items-center justify-center">
```

---

## Components

### IMPORTANT: Use Existing Components

```tsx
// GOOD - Use Separator component
<Separator />

// BAD - Custom divider
<div className="h-px bg-border" />

// GOOD - Use Spinner component
<Spinner />

// BAD - Custom spinner
<div className="animate-spin">...</div>

// GOOD - Use Badge component
<Badge>New</Badge>

// BAD - Custom badge
<span className="rounded-full bg-muted px-2 py-1">New</span>
```

### Separator

```tsx
// Horizontal
<Separator />

// With text
<div className="flex items-center gap-3">
  <Separator className="flex-1" />
  <span className="text-xs text-muted-foreground">or</span>
  <Separator className="flex-1" />
</div>

// Vertical
<Separator orientation="vertical" />
```

### Spinner (Loading)

```tsx
// In button
<Button disabled>
  <Spinner data-icon="inline-start" />
  Processing...
</Button>

// Standalone
<Spinner className="size-6" />
```

---

## Links

### Text Links

```tsx
<Link href="/path" className="text-primary hover:underline">
  Link text
</Link>

// In text
<p className="text-sm text-muted-foreground">
  Text with{' '}
  <Link href="/path" className="font-medium text-primary hover:underline">
    link
  </Link>
</p>
```

### Icon Links

```tsx
<Link
  href="/path"
  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
>
  <ArrowLeft className="size-3.5" />
  Back
</Link>
```

---

## Loading States

### Button Loading

```tsx
<Button disabled={isSubmitting}>
  {isSubmitting && <Spinner data-icon="inline-start" />}
  {isSubmitting ? 'Processing...' : 'Submit'}
</Button>
```

### Skeleton Loader

```tsx
<Skeleton className="h-8 w-32" />
<Skeleton className="h-12 w-full" />
```

---

## Accessibility

### Focus States

```tsx
// Inputs
focus:border-primary 
focus:ring-2 
focus:ring-primary/20

// Buttons
focus-visible:ring-2 
focus-visible:ring-primary/50

// Links
focus:outline-none 
focus:ring-2 
focus:ring-primary
```

### ARIA Labels

```tsx
// Icon buttons
<Button aria-label="Show password">
  <Eye data-icon />
</Button>

// Icons
<Icon aria-hidden="true" />

// Invalid inputs
<Input aria-invalid={!!errors.email} />
```

---

## Responsive Design

### Breakpoints

| Prefix | Min Width |
|--------|-----------|
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

### Mobile-First Patterns

```tsx
// Responsive padding
<div className="px-4 md:px-6 lg:px-8">

// Stack on mobile, row on desktop
<div className="flex flex-col gap-4 md:flex-row">

// Full width on mobile, fixed on desktop
<div className="w-full md:w-96">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Show on mobile, hide on desktop
<div className="block md:hidden">
```

---

## Component Checklist

When creating a new component, ensure:

- [ ] Use semantic tokens (`text-foreground`, `bg-card`, not raw colors)
- [ ] Use `FieldGroup` for forms (no `space-y-*`)
- [ ] Use `data-icon` for icons in buttons
- [ ] Use `size-*` instead of `h-* w-*` for equal dimensions
- [ ] Use existing components (`Separator`, `Spinner`, `Badge`)
- [ ] Use pill shape (`rounded-full`) for buttons and inputs
- [ ] Balanced shadows (`shadow-lg`, not `shadow-2xl`)
- [ ] Subtle animations (no custom on components)
- [ ] Full accessibility (ARIA labels, focus states)
- [ ] Responsive design (mobile-first)
- [ ] No "AI look" (no purple/pink, no glassmorphism)

---

## Quick Reference

### Button
```tsx
<Button className="h-auto w-full rounded-full py-3 font-semibold">
  <Spinner data-icon="inline-start" />
  Text
</Button>
```

### Input
```tsx
<Input className="h-auto rounded-full px-4 py-3" />
```

### Form
```tsx
<form>
  <FieldGroup>
    <Field data-invalid={!!error}>
      <FieldLabel>Label</FieldLabel>
      <Input aria-invalid={!!error} />
      <FieldDescription>Error message</FieldDescription>
    </Field>
  </FieldGroup>
</form>
```

### Card
```tsx
<div className="rounded-3xl border bg-card p-8 shadow-lg">
  {/* Content */}
</div>
```

### Link
```tsx
<Link className="text-primary hover:underline">
  Link text
</Link>
```

### Icon
```tsx
// In button
<Eye data-icon="inline-start" />

// Standalone
<Eye className="size-4 text-muted-foreground" />
```

### Separator
```tsx
<Separator />
```

---

## Common Patterns

### Password Input with Toggle
```tsx
<div className="relative">
  <Input
    type={showPass ? 'text' : 'password'}
    className="h-auto rounded-full px-4 py-3 pr-12"
  />
  <Button
    variant="ghost"
    size="icon"
    className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
  >
    <Eye data-icon />
  </Button>
</div>
```

### Separator with Text
```tsx
<div className="flex items-center gap-3">
  <Separator className="flex-1" />
  <span className="text-xs text-muted-foreground">or</span>
  <Separator className="flex-1" />
</div>
```

### Card Structure
```tsx
<div className="rounded-3xl border bg-card p-8 shadow-lg">
  {/* Header */}
  <div className="mb-8 text-center">
    <h1 className="mb-1 text-2xl font-bold">Title</h1>
    <p className="text-sm text-muted-foreground">Subtitle</p>
  </div>

  {/* Body */}
  <FieldGroup>
    {/* Form fields or content */}
  </FieldGroup>

  {/* Footer */}
  <p className="mt-6 text-center text-sm text-muted-foreground">
    Footer text
  </p>
</div>
```
