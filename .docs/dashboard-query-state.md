---
meta:
  contentType: Reference
---

# Manage dashboard query state

This page defines frontend conventions for dashboard list filters, URL state, debounce behavior, and API parameter mapping.

## Use backend parameter names

Dashboard URLs should use the same query parameter names as the backend API when the URL represents backend query state.

Use these names for admin list modules:

- `search`
- `status`
- `paymentMethod`
- `createdFrom`
- `createdTo`
- `amountMin`
- `amountMax`
- `page`
- `size`
- `sort`

Avoid short aliases such as `q`, `st`, `pay`, `from`, `to`, `sortBy`, and `sortDir` for new dashboard work.

Reason: matching URL, API client, and backend request DTO names makes debugging easier. A dashboard URL should be easy to compare with a backend request.

## Keep units consistent

URL state and API calls should use backend units.

For order amount filters:

- Store `amountMin` and `amountMax` in VND.
- Display friendlier labels in the UI when useful, such as million VND.

Example:

```text
/dashboard/orders?amountMin=5000000&amountMax=75000000
```

The UI can display this as:

```text
5 triệu - 75 triệu
```

## Debounce high-frequency controls

Debounce controls that can emit many changes quickly before writing URL state or triggering TanStack Query.

Debounce these controls:

- Text search inputs
- Range sliders
- Inputs that update while the user types

Do not debounce simple low-frequency controls such as status buttons, payment method menus, page size menus, pagination buttons, or explicit Apply buttons.

Recommended pattern:

```tsx
const [search, setSearch] = useQueryState('search', parseAsString.withDefault(''));
const [searchInput, setSearchInput] = useState(search);
const [debouncedSearch] = useDebounce(searchInput, 350);

useEffect(() => {
  if (debouncedSearch === search) return;
  void setSearch(debouncedSearch);
  void setCurrentPage(0);
}, [debouncedSearch, search, setCurrentPage, setSearch]);
```

Use the same pattern for sliders:

```tsx
const [amountMin, setAmountMin] = useQueryState('amountMin', parseAsInteger.withDefault(0));
const [amountMax, setAmountMax] = useQueryState('amountMax', parseAsInteger.withDefault(100_000_000));
const [amountRange, setAmountRange] = useState([0, 100]);
const [debouncedAmountRange] = useDebounce(amountRange, 350);

useEffect(() => {
  const nextMin = (debouncedAmountRange[0] ?? 0) * 1_000_000;
  const nextMax = (debouncedAmountRange[1] ?? 100) * 1_000_000;
  if (nextMin === amountMin && nextMax === amountMax) return;
  void setAmountMin(nextMin);
  void setAmountMax(nextMax);
  void setCurrentPage(0);
}, [amountMax, amountMin, debouncedAmountRange, setAmountMax, setAmountMin, setCurrentPage]);
```

## Keep sort shape API-compatible

Use a single `sort` URL parameter with the same shape sent to the backend:

```text
sort=createdAt,desc
```

Avoid splitting dashboard URL sort state into `sortBy` and `sortDir` for new list pages.

When calling an API wrapper, parse the URL value into the wrapper shape:

```tsx
const [sortBy = 'createdAt', sortDir = 'desc'] = sortParam.split(',');

getAdminOrders({
  sort: [{ field: sortBy, dir: sortDir as 'asc' | 'desc' }],
});
```

## Reset page on filter changes

Reset `page` to `0` when any filter, search value, amount range, date range, page size, or sort value changes.

This prevents the UI from staying on an out-of-range page after the result set changes.

## Keep facets separate

Dashboard list pages should fetch facet metadata separately from list rows when the backend exposes a `/facets` endpoint.

Use list queries for rows:

```text
GET /api/admin/orders?search=&status=&page=0&size=20
```

Use facet queries for counts and filter options:

```text
GET /api/admin/orders/facets?search=&paymentMethod=&amountMin=&amountMax=
```

Sorting and paging should not affect facet queries.
