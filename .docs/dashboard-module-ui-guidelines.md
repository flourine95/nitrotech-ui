# Dashboard Module UI Guidelines

Use this guide when building or editing dense admin modules in NitroTech UI, such as orders, products, customers, inventory, reports, and settings. The goal is a calm workspace that scales from laptop screens to large desktop monitors without wasting space or breaking controls.

## Core Principles

- Build a working module screen, not a marketing page.
- Optimize for scanning: the primary entity, status, key metadata, value, date, progress or state, and next action should be easy to find.
- Use shadcn/ui primitives where they exist. Avoid hand-rolled dropdowns, badges, menus, switches, separators, and buttons.
- Keep copy in one language per screen. For NitroTech admin screens, prefer Vietnamese labels and Vietnamese formatting.
- Hardcoded prototypes should still look structurally realistic, so they can later accept real data without redesigning the layout.

## Page Layout

- Do not center admin workspaces inside narrow marketing-style containers.
- Let module content use the available dashboard width with `w-full`, `max-w-none`, `min-w-0`, and `flex-1`.
- Keep the global dashboard sidebar separate from module-level sidebars or toolbars.
- Avoid huge empty gutters on wide monitors. If the screen has more room, give it to the main content first.
- Prevent horizontal overflow. Every flex child that can shrink should usually have `min-w-0`.
- Use `overflow-hidden` on the workspace shell, then put scrolling on the regions that actually need it.

## Module Sidebars

- Module sidebars should be useful but not greedy.
- Laptop width should usually be around `w-56` to `w-60`.
- Wider desktop width can grow to `w-65` or `w-75` only if the main content still has enough room.
- If the sidebar contains many filters or sections, make the sidebar scroll internally.
- Do not let a secondary module sidebar compete with the global dashboard sidebar for too much space.

## Toolbar Behavior

- Toolbars should respond to available width. They should not keep the same visual density at every viewport.
- Use 2 or 3 density tiers:
  - Compact laptop: narrower sidebar, smaller gaps, fewer always-visible controls, secondary actions behind a menu.
  - Standard desktop: normal gaps, search/filter/summary visible.
  - Wide desktop: allow slightly wider filters or extra summary controls, but do not over-expand buttons.
- Search should have responsive width:
  - Compact: around `w-56` to `w-64`.
  - Standard: around `w-72` to `w-80`.
  - Wide: cap width instead of stretching forever.
- Toolbar groups should wrap, collapse, or move secondary actions into a `DropdownMenu` before they cause overflow.
- Use `gap-2` or `gap-3` for dense toolbars. Avoid large gaps that look fine on 27 inch screens but waste laptop space.
- Icon-only toolbar actions should use square sizes such as `size-10`.
- Primary actions should stay visible when possible, but their label can become shorter on compact screens if the meaning remains clear.

## Sticky And Scroll Behavior

- Global navigation may stay fixed or sticky.
- Module sidebars can be sticky or internally scrollable depending on content length.
- Main lists, tables, or boards should own their own scroll when pagination, selection bars, or summary toolbars need to remain reachable.
- If a summary toolbar is sticky, keep it visually light and include its divider so the pinned area feels intentional.
- Avoid making the entire dashboard page scroll when the module is meant to behave like an admin workspace.

## Sizing

- Use Tailwind scale values instead of arbitrary values when possible:
  - Prefer `w-60` over `w-[240px]`.
  - Prefer `w-65` over `w-[260px]`.
  - Prefer `w-75` over `w-[300px]`.
- Use consistent control heights within one screen:
  - Primary page action: usually `h-10`.
  - Inputs and select triggers: usually `h-10` or `h-11`.
  - Compact row/card actions: usually `h-9` or `h-10`.
  - Icon-only buttons: use square sizes such as `size-9` or `size-10`.
- Use `size-*` when width and height are the same.
- Use `gap-*` for spacing between children.
- Avoid negative letter spacing and viewport-based font scaling.

## Typography

- Page title: usually `text-xl` on admin screens.
- Section title: usually `text-sm` to `text-base`, depending on density.
- Row/card title: strong but compact, usually `text-base` to `text-lg`.
- Metadata: muted, compact, and readable.
- Labels inside dense filters should be small but not tiny, commonly `text-sm`.
- Do not use hero-scale typography inside admin modules, filters, cards, tables, or toolbars.

## Borders, Radius, And Separators

- Use one-pixel borders before adding shadows.
- Use `border-dashed` for quiet section dividers when separating header, summary, and content zones.
- Keep radius consistent:
  - Panels/cards: usually `rounded-xl`.
  - Buttons and inputs: usually `rounded-lg`.
  - Badges/chips: use shadcn `Badge`; do not hand-roll mixed pill and rounded-rectangle styles.
- Avoid nested cards unless the inner surface is a real sub-panel with a separate job.

## Components

- Use `Badge` for statuses, labels, tags, priority, and state chips.
- Status badges should use the soft-filled pattern, not tinted outlines:
  - Use `border-transparent`, `rounded-md`, `px-2`, `text-xs`, `font-semibold`, and a subtle `shadow-sm`.
  - Use light semantic fills such as `bg-rose-500/12 text-rose-700`, `bg-amber-500/12 text-amber-700`, `bg-emerald-500/12 text-emerald-700`, or `bg-sky-500/12 text-sky-700`.
  - Keep hover on the same fill, for example `hover:bg-rose-500/12`, so status chips do not look interactive unless they actually open a menu.
  - Avoid `variant="outline"` plus colored borders for primary order/payment/status chips.
- Use `DropdownMenu` for action menus, sorting menus, page-size menus, and simple option lists.
- Use `DropdownMenuRadioGroup` when the menu represents one selected value.
- Use `Popover` only when the content is not a normal menu, such as custom date ranges or advanced filter panels.
- Use `Select` when the interaction is a form-like select and does not need menu actions.
- Icon-only buttons must have `aria-label`.
- Icons inside `Button` should use `data-icon="inline-start"` or `data-icon="inline-end"` instead of manual icon sizing.
- Use `Separator` instead of raw `hr`.
- Do not use `top-1/2 -translate-y-1/2` to position absolute custom `Button` components vertically. The component's base `active` class has a press offset (`translate-y-px`) which overrides the negative translate, causing a click jump. Position absolute buttons with `inset-y-0 my-auto` instead.

## Dropdown Rules

- Dropdown content should open below the trigger unless there is not enough viewport space.
- Dropdown width should usually match the trigger width:
  - Use `w-(--radix-dropdown-menu-trigger-width)` for `DropdownMenuContent`.
  - Use `w-(--radix-popover-trigger-width)` for `PopoverContent`.
- Keep dropdown items a comfortable single-line height when possible.
- Do not let dropdown labels wrap awkwardly. Shorten labels before widening the menu too much.
- Use shadcn menu check/radio affordances instead of manually positioning custom check icons.

## Filters

- Put the highest-frequency filter first.
- Search should be near the top or in the main toolbar, depending on the module.
- Common filter groups include:
  - Status or lifecycle state.
  - Category, source, owner, or method.
  - Date range.
  - Numeric range.
  - Needs attention or archived toggle.
- Use a range slider when users are exploring a numeric range.
- Include a reset filters action when more than one filter can be changed.
- The reset action should be quiet: ghost-style, left-aligned, and paired with a reset icon.

## Dense Rows, Cards, Tables, And Boards

- Pick the view based on the work:
  - Table for comparison-heavy data.
  - Card list for workflow state and next actions.
  - Board for stage movement.
  - Split view for review/detail workflows.
- Each item should show enough information to decide the next action without opening details.
- Keep right-side value/date/action blocks aligned and visually stable.
- Thumbnails or avatars should support recognition, not dominate the layout.
- Primary row actions should match the current workflow state.
- Avoid item heights that show only one or two records on a laptop unless the workflow truly needs expanded details.

## Pagination And Density

- Always provide a visible page-size control when a list is paginated.
- Use compact labels such as `10 / trang`, `20 / trang`, and `50 / trang`.
- Keep pagination reachable on laptop-height screens.
- Reduce gaps and secondary sidebar width before removing useful item content.
- If the data view has large cards, consider a compact mode or table mode later.

## Responsive Behavior

- Browser zoom changes CSS pixels and can change when breakpoints apply. Do not assume physical monitor size maps directly to a breakpoint.
- Test at laptop widths and heights, not only on a 27 inch monitor.
- For laptop screens, prefer compact spacing, narrower module sidebars, and internal scroll.
- For wide screens, expand useful content rather than centering the workspace with empty gutters.
- If the viewport becomes narrow, stack or collapse secondary filters before squeezing the main content until it breaks.

## Vietnamese And Formatting

- Use Vietnamese UI labels consistently on admin screens.
- Format VND consistently, for example `84.150.000 ₫`.
- Format dates consistently, for example `28/03/2026`.
- Avoid mixing English labels such as `New`, `Most recent`, or `Invoice` into a Vietnamese admin screen unless the product language intentionally requires it.

## AI Implementation Checklist

- Does the module use the dashboard width instead of a centered marketing container?
- Does each sidebar or toolbar have responsive density rules?
- Does the main content avoid horizontal overflow?
- Are scroll regions intentional and reachable?
- Are dropdowns implemented with shadcn `DropdownMenu`, `Select`, or `Popover` according to the interaction?
- Are status chips implemented with `Badge` using the soft-filled status pattern instead of tinted outlines?
- Are icon-only buttons labeled with `aria-label`?
- Are Tailwind classes canonical where possible?
- Are labels, dates, and money formatted consistently?
- Does the screen show enough records on a laptop viewport?
- Do absolute buttons inside inputs or containers avoid `top-1/2 -translate-y-1/2` to prevent translation jumps on click?
- Did you run `npm run typecheck` and lint the touched file or route?
