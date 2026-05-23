---
inclusion: manual
---

# Design System - NitroTech

Version: 3.0.0  
Updated: 2026-05-23  
Framework: shadcn/ui (radix-nova)

---

## Design Philosophy

### Core Principles

1. **Professional First** - Enterprise-ready, trustworthy
2. **Clean & Minimal** - Less is more, avoid unnecessary complexity
3. **Timeless Design** - Avoid trendy effects that age quickly
4. **Neutral Palette** - Subtle colors, avoid "AI look" (no purple/pink gradients)
5. **Purposeful Interactions** - Every animation and effect has a reason

### What to Avoid (AI Look)

- Purple/pink gradients
- Glassmorphism effects
- Heavy shadows
- Colored shadows
- Too many colors (>3)
- Excessive animations
- Gradient orbs everywhere

---

## Colors

### IMPORTANT: Use Semantic Tokens

shadcn/ui requires semantic tokens instead of raw Tailwind colors.

### Text Colors

```tsx
// GOOD - Semantic tokens
text-foreground           // Primary text (replaces text-slate-900)
text-muted-foreground     // Secondary text (replaces text-slate-500)
text-primary              // Links, accents (replaces text-blue-600)
text-destructive          // Error text (replaces text-rose-500)

// BAD - Raw colors
text-slate-900
text-slate-500
text-blue-600
text-rose-500
```

### Background Colors

```tsx
// GOOD - Semantic tokens
bg-background             // Page background (replaces bg-white)
bg-card                   // Card background (replaces bg-white)
bg-muted                  // Light background (replaces bg-slate-50)
bg-primary                // Primary background (button, etc.)
bg-destructive            // Error background

// BAD - Raw colors
bg-white
bg-slate-50
bg-blue-600
```

### Border Colors

```tsx
// GOOD - Semantic tokens
border-border             // Default border (replaces border-slate-200)
border-input              // Input border (replaces border-slate-200)
border-primary            // Primary border
border-destructive        // Error border (replaces border-rose-400)

// BAD - Raw colors
border-slate-200
border-rose-400
```

### Why Semantic Tokens?

1. **Dark Mode Support** - Automatically adapts to theme
2. **Easy Maintenance** - Change theme in one place
3. **Consistency** - Follows shadcn/ui standards
4. **Future-proof** - Compatible with updates

---

## Typography

### Font Sizes

```tsx
text-2xl    // 24px - Page titles (h1)
text-xl     // 20px - Section titles (h2)
text-lg     // 18px - Subsection titles (h3)
text-base   // 16px - Default body text
text-sm     // 14px - Secondary text, labels
text-xs     // 12px - Captions, helper text
```

### Font Weights

```tsx
font-bold       // 700 - Headings, emphasis
font-semibold   // 600 - Buttons, strong labels
font-medium     // 500 - Labels, navigation
font-normal     // 400 - Body text
```

### Examples

```tsx
// Page title
<h1 className="text-2xl font-bold">Login</h1>

// Section title
<h2 className="text-xl font-bold">Personal Information</h2>

// Secondary text
<p className="text-sm text-muted-foreground">Welcome back</p>

// Label
<label className="text-sm font-medium">Email</label>

// Helper text
<span className="text-xs text-muted-foreground">Minimum 6 characters</span>
```

---

## Spacing

### IMPORTANT: Use `gap-*` not `space-*`

```tsx
// BAD - space-y-* deprecated in shadcn/ui
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// GOOD - Use flex + gap
<div className="flex flex-col gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Common Patterns

```tsx
// Card padding
p-8         // 32px - Standard card padding

// Form spacing - Use FieldGroup (handles spacing automatically)
<FieldGroup>
  <Field>...</Field>
  <Field>...</Field>
</FieldGroup>

// Section spacing
mb-6        // 24px - Between sections
mb-8        // 32px - Between major sections

// Button padding
px-4 py-3   // Horizontal: 16px, Vertical: 12px

// Input padding
px-4 py-3   // Horizontal: 16px, Vertical: 12px
```

---

## Border Radius

### Scale

```tsx
rounded-lg      // 8px - Default for most elements
rounded-xl      // 12px - Larger cards
rounded-2xl     // 16px - Icons, avatars
rounded-3xl     // 24px - Cards, modals
rounded-full    // 9999px - Pills
```

### Usage Guidelines

**Pill Shape (rounded-full):**
- Buttons (primary, secondary, outline)
- Text inputs
- Search bars
- Tags, badges
- Pills, chips

**Rounded Corners:**
- Cards: `rounded-3xl`
- Modals: `rounded-2xl`
- Dropdowns: `rounded-xl`
- Images: `rounded-lg`

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

### Scale

```tsx
shadow-sm   // Subtle - NOT RECOMMENDED (too flat)
shadow      // Default - NOT RECOMMENDED (too subtle)
shadow-md   // Medium - OK for small elements
shadow-lg   // Large - RECOMMENDED for cards
shadow-xl   // Extra large - For hover states
shadow-2xl  // Too dramatic - AVOID
```

### Usage

```tsx
// Cards
shadow-lg hover:shadow-xl

// Dropdowns
shadow-xl

// Modals
shadow-2xl  // Exception: modals can use larger shadows
```

### Important Rules

```tsx
// BAD - Don't use colored shadows
shadow-slate-900/10
shadow-blue-500/20

// GOOD - Use default shadows
shadow-lg
shadow-xl
```

---

## Icons

### IMPORTANT: Use `data-icon` Attribute

```tsx
// BAD - Don't use sizing classes in components
<Button>
  <Eye className="h-4 w-4" />
  Text
</Button>

// GOOD - Use data-icon
<Button>
  <Eye data-icon="inline-start" />
  Text
</Button>

// data-icon values:
// - "inline-start" - Icon at start
// - "inline-end" - Icon at end
```

### Sizes (Outside Components)

```tsx
// Only use when icon is NOT inside Button, Input, etc.
size-3      // 12px - Tiny icons
size-3.5    // 14px - Small icons (arrows, etc.)
size-4      // 16px - Default icons (most common)
size-5      // 20px - Medium icons
size-6      // 24px - Large icons
size-8      // 32px - Logo, hero icons

// Note: Use size-* instead of h-* w-*
// BAD: h-4 w-4
// GOOD: size-4
```

### UI Icons (Lucide React)

```tsx
import { Eye, Mail, ArrowLeft } from 'lucide-react';

// In button
<Button>
  <Eye data-icon="inline-start" />
  View
</Button>

// Standalone (not in component)
<Mail className="size-4 text-muted-foreground" />
```

---

## Animations & Transitions

### Timing

```tsx
duration-150    // 150ms - Quick interactions (hover, focus)
duration-200    // 200ms - Standard transitions (most common)
duration-300    // 300ms - Slow transitions (shadows, complex)
duration-700    // 700ms - Page entrance animations
```

### Common Patterns

**Shadow Transition:**
```tsx
transition-shadow hover:shadow-xl
```

**Color Transition:**
```tsx
transition-colors hover:text-primary
```

**Page Entrance:**
```tsx
animate-in fade-in slide-in-from-bottom-4 duration-700
```

### DO NOT Add Custom Animations on Components

```tsx
// BAD - Components handle animations themselves
<Button className="transition-all hover:scale-[1.02]">

// GOOD - Let component handle it
<Button>
```

---

## Layouts

### Container Widths

```tsx
max-w-md    // 448px - Forms, auth pages
max-w-lg    // 512px - Small content
max-w-xl    // 576px - Medium content
max-w-2xl   // 672px - Large content
max-w-4xl   // 896px - Wide content
max-w-7xl   // 1280px - Full width content
```

### Grid Layouts

```tsx
// Two columns (social buttons)
<div className="grid grid-cols-2 gap-3">
  <Button>Google</Button>
  <Button>Facebook</Button>
</div>

// Responsive
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
  {/* Items */}
</div>
```

### Flex Layouts

```tsx
// Horizontal (default)
<div className="flex items-center gap-2">
  <Icon />
  <span>Text</span>
</div>

// Vertical
<div className="flex flex-col gap-4">
  {/* Items */}
</div>

// Space between
<div className="flex items-center justify-between">
  <span>Left</span>
  <span>Right</span>
</div>

// Center
<div className="flex items-center justify-center">
  {/* Centered content */}
</div>
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

```tsx
sm:   // 640px
md:   // 768px
lg:   // 1024px
xl:   // 1280px
2xl:  // 1536px
```

### Mobile-First Approach

```tsx
// Base (mobile)
<div className="px-4">

// Tablet and up
<div className="px-4 md:px-6">

// Desktop and up
<div className="px-4 md:px-6 lg:px-8">
```

### Common Patterns

```tsx
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

## Checklist for New Components

When creating a new component, ensure:

- [ ] Use semantic tokens (`text-foreground`, `bg-card`, etc.)
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
```

### Link
```tsx
<Link className="text-primary hover:underline">
```

### Icon
```tsx
// In button
<Icon data-icon="inline-start" />

// Standalone
<Icon className="size-4 text-muted-foreground" />
```

### Separator
```tsx
<Separator />
```

---

## Version History

- **3.0.0** (2026-05-23) - Simplified, English, updated with latest shadcn/ui patterns
- **2.0.0** (2026-05-17) - Updated with shadcn/ui conventions, Vietnamese
- **1.0.0** (2026-05-17) - Initial version based on auth module
