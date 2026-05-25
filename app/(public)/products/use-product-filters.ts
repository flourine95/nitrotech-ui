import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs';

export function useProductFilters() {
  // URL state
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0).withOptions({ shallow: true }));
  const [size, setSize] = useQueryState('size', parseAsInteger.withDefault(24).withOptions({ shallow: true }));
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('createdAt,desc').withOptions({ shallow: true }));
  const [search] = useQueryState('search', parseAsString.withDefault('').withOptions({ shallow: true }));
  const [category, setCategory] = useQueryState('category', parseAsString.withOptions({ shallow: true }));
  const [brands, setBrands] = useQueryState(
    'brands',
    parseAsArrayOf(parseAsString).withDefault([]).withOptions({ shallow: true }),
  );
  const [minPrice, setMinPrice] = useQueryState('minPrice', parseAsInteger.withOptions({ shallow: true }));
  const [maxPrice, setMaxPrice] = useQueryState('maxPrice', parseAsInteger.withOptions({ shallow: true }));

  const hasActiveFilters = category || brands.length > 0 || minPrice !== null || maxPrice !== null;

  const clearAllFilters = () => {
    setCategory(null);
    setBrands([]);
    setMinPrice(null);
    setMaxPrice(null);
    setPage(0);
  };

  return {
    page,
    setPage,
    size,
    setSize,
    sort,
    setSort,
    search,
    category,
    setCategory,
    brands,
    setBrands,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    hasActiveFilters,
    clearAllFilters,
  };
}
