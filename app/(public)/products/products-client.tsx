'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { toast } from 'sonner';
import { getProductFacets, getProducts } from '@/lib/api/products';
import { removeVietnameseTones } from '@/lib/utils';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Filter, Loader2, Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const sortOptions = [
  { label: 'Mới nhất', value: 'createdAt,desc' },
  { label: 'Giá tăng dần', value: 'price,asc' },
  { label: 'Giá giảm dần', value: 'price,desc' },
  { label: 'Tên A-Z', value: 'name,asc' },
  { label: 'Tên Z-A', value: 'name,desc' },
];

const pageSizeOptions = [
  { label: '24', value: 24 },
  { label: '48', value: 48 },
  { label: '96', value: 96 },
];

export function ProductsClient() {
  // URL state
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState('size', parseAsInteger.withDefault(24));
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('createdAt,desc'));
  const [search] = useQueryState('search', parseAsString.withDefault(''));
  const [category, setCategory] = useQueryState('category', parseAsString);
  const [brands, setBrands] = useQueryState(
    'brands',
    parseAsArrayOf(parseAsString).withDefault([]),
  );
  const [minPrice, setMinPrice] = useQueryState('minPrice', parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState('maxPrice', parseAsInteger);

  // Local state for filter search
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // Debounced search values
  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState('');
  const [debouncedBrandSearch, setDebouncedBrandSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCategorySearch(categorySearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [categorySearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedBrandSearch(brandSearch);
    }, 150);
    return () => clearTimeout(timer);
  }, [brandSearch]);

  // Fetch products with keepPreviousData to avoid flickering
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching,
  } = useQuery({
    queryKey: ['products', { page, size, sort, search, category, brands, minPrice, maxPrice }],
    queryFn: async () => {
      const result = await getProducts({
        page,
        size,
        sort,
        search: search || undefined,
        category: category || undefined,
        brand: brands.length > 0 ? brands : undefined,
        minPrice: minPrice ?? undefined,
        maxPrice: maxPrice ?? undefined,
        active: true,
      });
      return result;
    },
    placeholderData: (prev) => prev, // Keep previous data while fetching
  });

  // Fetch facets (without filters to get all options)
  const { data: facets, isLoading: facetsLoading } = useQuery({
    queryKey: ['product-facets-all'],
    queryFn: () => getProductFacets({ active: true }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const products = productsData?.content || [];
  const totalElements = productsData?.totalElements || 0;
  const totalPages = productsData?.totalPages || 0;

  const categoriesList = facets?.categories || [];
  const brandsList = facets?.brands || [];

  // Filter categories and brands based on search with Vietnamese tone removal
  const filteredCategories = categoriesList.filter((cat) => {
    if (!debouncedCategorySearch.trim()) return true;
    const query = removeVietnameseTones(debouncedCategorySearch.trim());
    const name = removeVietnameseTones(cat.name);

    // Split query into words and check if all words are found in name
    const queryWords = query.split(/\s+/);
    return queryWords.every((word) => name.includes(word));
  });

  const filteredBrands = brandsList.filter((brand) => {
    if (!debouncedBrandSearch.trim()) return true;
    const query = removeVietnameseTones(debouncedBrandSearch.trim());
    const name = removeVietnameseTones(brand.name);

    // Split query into words and check if all words are found in name
    const queryWords = query.split(/\s+/);
    return queryWords.every((word) => name.includes(word));
  });

  const hasActiveFilters = category || brands.length > 0 || minPrice !== null || maxPrice !== null;

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-card">
          {/* Filters */}
          {facetsLoading ? (
            <div className="flex flex-col gap-4 p-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-24" />
            </div>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={['categories', 'brands', 'price']}
              className="w-full"
            >
              {/* Categories */}
              {categoriesList.length > 0 && (
                <AccordionItem value="categories">
                  <AccordionTrigger className="px-4 text-sm font-semibold">
                    Danh mục
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {/* Search input */}
                    <div className="relative mb-3">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Tìm danh mục..."
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        className="h-9 rounded-full pr-9 pl-9 text-sm font-normal focus-visible:ring-1"
                      />
                      {categorySearch && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setCategorySearch('')}
                          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                          aria-label="Xóa tìm kiếm"
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div
                      className={`space-y-3 pr-2 ${filteredCategories.length > 8 ? 'max-h-64 overflow-y-auto' : ''}`}
                    >
                      {filteredCategories.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Không tìm thấy danh mục
                        </p>
                      ) : (
                        filteredCategories.map((cat) => {
                          const isSelected = category === cat.slug;
                          return (
                            <div key={cat.slug} className="flex items-center gap-2">
                              <Checkbox
                                id={`cat-${cat.slug}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  setCategory(checked ? cat.slug : null);
                                  setPage(0);
                                }}
                              />
                              <Label
                                htmlFor={`cat-${cat.slug}`}
                                className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal"
                              >
                                <span className="truncate">{cat.name}</span>
                                <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                                  {cat.count}
                                </span>
                              </Label>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Brands */}
              {brandsList.length > 0 && (
                <AccordionItem value="brands">
                  <AccordionTrigger className="px-4 text-sm font-semibold">
                    Thương hiệu
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    {/* Search input */}
                    <div className="relative mb-3">
                      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Tìm thương hiệu..."
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        className="h-9 rounded-full pr-9 pl-9 text-sm font-normal focus-visible:ring-1"
                      />
                      {brandSearch && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setBrandSearch('')}
                          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                          aria-label="Xóa tìm kiếm"
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                    <div
                      className={`space-y-3 pr-2 ${filteredBrands.length > 8 ? 'max-h-64 overflow-y-auto' : ''}`}
                    >
                      {filteredBrands.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          Không tìm thấy thương hiệu
                        </p>
                      ) : (
                        filteredBrands.map((brand) => {
                          const isSelected = brands.includes(brand.slug);
                          return (
                            <div key={brand.slug} className="flex items-center gap-2">
                              <Checkbox
                                id={`brand-${brand.slug}`}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setBrands([...brands, brand.slug]);
                                  } else {
                                    setBrands(brands.filter((b) => b !== brand.slug));
                                  }
                                  setPage(0);
                                }}
                              />
                              <Label
                                htmlFor={`brand-${brand.slug}`}
                                className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal"
                              >
                                <span className="truncate">{brand.name}</span>
                                <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                                  {brand.count}
                                </span>
                              </Label>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Price Ranges */}
              {facets?.priceRanges && facets.priceRanges.length > 0 && (
                <AccordionItem value="price">
                  <AccordionTrigger className="px-4 text-sm font-semibold">
                    Khoảng giá
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="flex flex-col gap-3">
                      {facets.priceRanges.map((range, idx) => {
                        const isSelected = minPrice === range.min && maxPrice === range.max;
                        const label =
                          range.max === null
                            ? `Trên ${range.min.toLocaleString()}₫`
                            : `${range.min.toLocaleString()}₫ - ${range.max.toLocaleString()}₫`;
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <Checkbox
                              id={`price-${idx}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setMinPrice(range.min);
                                  setMaxPrice(range.max);
                                } else {
                                  setMinPrice(null);
                                  setMaxPrice(null);
                                }
                                setPage(0);
                              }}
                            />
                            <Label
                              htmlFor={`price-${idx}`}
                              className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal"
                            >
                              <span>{label}</span>
                              <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                                {range.count}
                              </span>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          )}
        </div>
      </aside>

      {/* Product grid */}
      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalElements}</span> sản phẩm
              </p>
              {isFetching && !productsLoading && (
                <Loader2 className="size-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile filter */}
              <Button variant="outline" size="sm" className="lg:hidden">
                <Filter data-icon="inline-start" />
                Lọc
              </Button>

              {/* Page size */}
              <div className="flex items-center gap-2">
                <Label htmlFor="pageSize" className="hidden text-sm text-muted-foreground sm:block">
                  Hiển thị:
                </Label>
                <Select
                  value={String(size)}
                  onValueChange={(value) => {
                    setSize(Number(value));
                    setPage(0);
                  }}
                >
                  <SelectTrigger id="pageSize" className="h-9 w-20 rounded-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="w-20 min-w-0">
                    {pageSizeOptions.map((o) => (
                      <SelectItem key={o.value} value={String(o.value)}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <Label htmlFor="sort" className="hidden text-sm text-muted-foreground sm:block">
                  Sắp xếp:
                </Label>
                <Select
                  value={sort}
                  onValueChange={(value) => {
                    setSort(value);
                    setPage(0);
                  }}
                >
                  <SelectTrigger id="sort" className="h-9 w-40 rounded-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" sideOffset={4} className="w-40 min-w-0">
                    {sortOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Active filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">Đang lọc:</span>
              {category && (
                <Button
                  onClick={() => {
                    setCategory(null);
                    setPage(0);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full border-blue-200 bg-blue-50 px-3 text-xs text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                >
                  <span>{category}</span>
                  <X className="size-3" />
                </Button>
              )}
              {brands.map((brand) => (
                <Button
                  key={brand}
                  onClick={() => {
                    setBrands(brands.filter((b) => b !== brand));
                    setPage(0);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full border-purple-200 bg-purple-50 px-3 text-xs text-purple-700 hover:bg-purple-100 hover:text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300"
                >
                  <span>{brand}</span>
                  <X className="size-3" />
                </Button>
              ))}
              {(minPrice !== null || maxPrice !== null) && (
                <Button
                  onClick={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                    setPage(0);
                  }}
                  variant="outline"
                  size="sm"
                  className="h-7 gap-1.5 rounded-full border-green-200 bg-green-50 px-3 text-xs text-green-700 hover:bg-green-100 hover:text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                >
                  <span>
                    {minPrice !== null && maxPrice !== null
                      ? `${minPrice.toLocaleString()}₫ - ${maxPrice.toLocaleString()}₫`
                      : minPrice !== null
                        ? `Trên ${minPrice.toLocaleString()}₫`
                        : `Dưới ${maxPrice?.toLocaleString()}₫`}
                  </span>
                  <X className="size-3" />
                </Button>
              )}
              <Button
                onClick={() => {
                  setCategory(null);
                  setBrands([]);
                  setMinPrice(null);
                  setMaxPrice(null);
                  setPage(0);
                }}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Xóa tất cả
              </Button>
            </div>
          )}
        </div>

        {/* Grid */}
        {productsLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                name={p.name}
                cat={p.categoryName || ''}
                price={`${p.priceMin?.toLocaleString()}₫`}
                badge={p.badge || undefined}
                rating={p.rating || 0}
                reviews={p.reviewCount}
                onAddToCart={(product) => {
                  toast.success('Đã thêm vào giỏ hàng', { description: product.name });
                }}
                onAddToWishlist={(product) => {
                  toast.success('Đã thêm vào yêu thích', { description: product.name });
                }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i;
              return (
                <Button
                  key={i}
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  className="size-9"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
