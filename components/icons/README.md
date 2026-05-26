# Icons

Custom icon components for NitroTech UI.

## Usage

```tsx
import { FacebookIcon, GoogleIcon, LogoIcon } from '@/components/icons';
import { ShoppingCart, User } from 'lucide-react'; // UI icons from lucide-react

// Brand icons
<FacebookIcon className="h-4 w-4" />
<GoogleIcon className="h-5 w-5" />

// Custom icons
<LogoIcon className="h-6 w-6 text-white" />

// UI icons (use lucide-react)
<ShoppingCart className="h-5 w-5" />
<User className="h-4 w-4" />
```

## Icon Guidelines

### When to use `lucide-react`:
- UI icons (arrows, checkmarks, menus, search, cart, user, etc.)
- Generic icons available in lucide-react library
- **Always prefer lucide-react for UI icons**

### When to use `components/icons/`:
- **Brand icons** (Facebook, Google, YouTube, TikTok, etc.)
- **Custom icons** (logo, custom illustrations)
- Icons **not available** in lucide-react

### Never:
- ❌ Inline SVG directly in components
- ❌ Duplicate icon definitions
- ❌ Use different icon libraries

## Structure

```
components/icons/
  brand/              Brand icons (social media, etc.)
    facebook.tsx
    google.tsx
    youtube.tsx
    tiktok.tsx
  logo.tsx            Custom logo icon
  index.ts            Re-export all icons
  README.md           This file
```

## Adding New Icons

### 1. Create icon component:

```tsx
// components/icons/brand/twitter.tsx
import type { SVGProps } from 'react';

export function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="..." />
    </svg>
  );
}
```

### 2. Export in `index.ts`:

```tsx
export { TwitterIcon } from './brand/twitter';
```

### 3. Use in components:

```tsx
import { TwitterIcon } from '@/components/icons';

<TwitterIcon className="h-4 w-4" />
```

## API

All icon components accept standard SVG props:

```tsx
interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
  // ... all other SVG attributes
}
```

### Common props:
- `className` — Tailwind classes for size, color, etc.
- `aria-label` — Accessibility label (if icon is not decorative)
- `onClick` — Click handler
- `style` — Inline styles (avoid if possible)

### Examples:

```tsx
// Size
<FacebookIcon className="h-4 w-4" />
<FacebookIcon className="h-6 w-6" />

// Color (uses currentColor by default)
<FacebookIcon className="h-4 w-4 text-blue-600" />
<LogoIcon className="h-6 w-6 text-white" />

// With click handler
<FacebookIcon 
  className="h-4 w-4 cursor-pointer hover:text-blue-600" 
  onClick={() => console.log('clicked')}
/>

// Accessibility
<FacebookIcon 
  className="h-4 w-4" 
  aria-label="Facebook"
  role="img"
/>
```

## Migration from inline SVG

### Before:
```tsx
<svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
</svg>
```

### After:
```tsx
import { LogoIcon } from '@/components/icons';

<LogoIcon className="h-4 w-4" />
```

## Benefits

✅ **Consistency** — All icons have the same API  
✅ **Reusability** — No duplicate SVG code  
✅ **Maintainability** — Update once, apply everywhere  
✅ **Type-safe** — Full TypeScript support  
✅ **Accessibility** — Centralized ARIA handling  
✅ **Performance** — Tree-shaking friendly  
