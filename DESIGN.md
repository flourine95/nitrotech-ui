---
name: NitroTech UI
description: Product-commerce interface for browsing, comparing, cart, checkout, and dashboard workflows.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  primary: "oklch(0.279 0.041 260.031)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.97 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.556 0 0)"
  border: "oklch(0.922 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  headline:
    fontFamily: "var(--font-sans), Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "var(--font-sans), Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "var(--font-sans), Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-sans), Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
rounded:
  sm: "calc(var(--radius) * 0.6)"
  md: "calc(var(--radius) * 0.8)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) * 1.4)"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0 0.625rem"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "2rem"
    padding: "0.25rem 0.625rem"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
    padding: "1rem"
---

# Design System: NitroTech UI

## 1. Overview

**Creative North Star: "The Clear Tech Counter"**

NitroTech UI is a restrained product-commerce system for people scanning technical products, comparing options, moving through cart and checkout, and handling dense dashboard tasks. The interface should feel practical, calm, and trustworthy: a clean retail counter for high-consideration technology purchases.

The system uses familiar shadcn-style primitives, neutral surfaces, compact controls, and a slate-navy public primary color. It should make product names, prices, statuses, and next actions easy to find without ornamental layout.

**Key Characteristics:**
- Clear max-width content frames (`max-w-7xl`) for public commerce pages.
- Neutral card and panel surfaces with light borders rather than heavy decoration.
- Compact, predictable controls with visible hover and focus states.
- Rounded but controlled shapes: `rounded-lg`, `rounded-xl`, and full pills where navigation or commerce affordances need a softer touch.

## 2. Colors

The palette is restrained: near-white surfaces, charcoal text, pale gray structure, and a slate-navy primary for public CTAs and account actions.

### Primary
- **Public Slate Navy**: Used for public site CTAs, announcement bars, account buttons, cart badges, and selected commerce actions.

### Secondary
- **Soft Neutral Fill**: Used for secondary buttons, muted nav states, filter backgrounds, and low-emphasis panels.

### Neutral
- **Clean Surface**: The default page and card surface. Keep it bright and direct.
- **Charcoal Text**: Primary reading color for headings, product names, prices, and table text.
- **Muted Text**: Secondary copy, metadata, helper text, and inactive navigation.
- **Fine Border**: One-pixel dividers, cards, inputs, tables, and panel boundaries.

### Named Rules
**The Accent Has Work Rule.** Use primary color for actions, current state, and commerce signals. Do not use it as ambient decoration.

**The One-Frame Rule.** Public commerce content should sit inside the same max-width rhythm (`max-w-7xl`) unless a page has a deliberate full-bleed media treatment.

## 3. Typography

**Display Font:** `var(--font-sans), Be Vietnam Pro, system-ui, sans-serif`
**Body Font:** `var(--font-sans), Be Vietnam Pro, system-ui, sans-serif`
**Label/Mono Font:** Browser monospace only for editor code blocks.

**Character:** The type system is a single sans family with Vietnamese-friendly fallbacks. It should read like a working commerce app, not a marketing poster.

### Hierarchy
- **Headline** (700, `1.875rem`, `1.2`): Page titles such as products, cart, checkout, and dashboard headings.
- **Title** (700 or 600, `1rem` to `1.125rem`, `1.35`): Section headings, card titles, panel titles, and order summaries.
- **Body** (400, `0.875rem` to `1rem`, `1.5`): Product metadata, descriptions, helper copy, and form content.
- **Label** (500, `0.75rem` to `0.875rem`, `1.25`): Buttons, form labels, nav items, status labels, and table controls.

### Named Rules
**The Product Name Rule.** Product names get readable weight and enough width. Avoid decorative truncation unless a list row requires it.

**The No Display Drama Rule.** Do not introduce oversized fluid typography inside product, checkout, cart, account, or dashboard surfaces.

## 4. Elevation

NitroTech is flat by default. Depth comes from light borders, tonal background layers, and occasional shadows on sticky headers or hoverable commerce cards. Shadows should support scanning, not create floating-card decoration.

### Shadow Vocabulary
- **Header Shadow** (`shadow-sm`): Used on the sticky public header to separate navigation from content.
- **Commerce Hover Lift** (`hover:shadow-md`): Used sparingly on cart/product cards where hover confirms clickability.
- **Dropdown Shadow** (`shadow-xl`): Used for account menus and overlays that need clear stacking.

### Named Rules
**The Border First Rule.** Use a one-pixel border before using a shadow. Shadows are for layering, menus, and hover feedback.

## 5. Components

### Buttons
- **Shape:** Gently rounded rectangles (`rounded-lg`) for system buttons; full pills (`rounded-full`) for public header and cart CTAs.
- **Primary:** Slate-navy or current `--primary` background with `--primary-foreground` text.
- **Hover / Focus:** Hover darkens or mutes the fill; focus uses `ring-ring/50` with a visible three-pixel ring.
- **Secondary / Ghost / Outline:** Secondary uses neutral fill; outline keeps a border and transparent background; ghost appears only on hover.

### Chips
- **Style:** Small, rounded, compact (`h-5`, `text-xs`, `rounded-4xl`) with primary, secondary, destructive, outline, ghost, and link variants.
- **State:** Use primary chips for selected or important status only. Use outline or muted fills for descriptive attributes.

### Cards / Containers
- **Corner Style:** Rounded panels (`rounded-xl`, often `rounded-2xl` on public commerce cards).
- **Background:** White or card surface with foreground text.
- **Shadow Strategy:** Flat at rest. Hover shadows only when the whole card is an interactive item.
- **Border:** Fine neutral borders or ring treatment.
- **Internal Padding:** Dense system cards use `1rem`; public commerce cards commonly use `1.25rem` to `1.5rem`.

### Inputs / Fields
- **Style:** Full-width, compact fields with transparent background, one-pixel border, and `rounded-lg`.
- **Focus:** Border shifts to ring color and adds a visible ring.
- **Error / Disabled:** Destructive ring and border for invalid states; disabled fields lower opacity and stop pointer interaction.

### Navigation
- **Style:** Public navigation uses a sticky top bar, `max-w-7xl` inner frame, pill hover states, and muted inactive text.
- **Active / Hover:** Active links receive muted background and stronger foreground. Hover moves muted links toward foreground.
- **Mobile:** Mobile menu collapses into stacked rounded links with the same muted-to-foreground hover vocabulary.

## 6. Do's and Don'ts

### Do:
- **Do** keep public product, cart, checkout, and search pages in a consistent `max-w-7xl` content frame.
- **Do** use neutral surfaces and borders to organize dense product and order information.
- **Do** keep checkout and cart summaries visually narrower than the primary content column on desktop.
- **Do** use primary color for decisive actions such as login, checkout, selected states, and cart badges.
- **Do** preserve compact button and input heights unless the surrounding public commerce layout intentionally uses larger CTAs.

### Don't:
- **Don't** add decorative gradient text, glassmorphism, or colored side-stripe borders.
- **Don't** make checkout, cart, or product list content span wider than the established public content frame.
- **Don't** create nested cards for ordinary page sections.
- **Don't** use primary color as a background wash across large inactive areas.
- **Don't** introduce display fonts or fluid hero typography into task surfaces.
