'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useQueryState, parseAsInteger, parseAsString, parseAsArrayOf } from 'nuqs';
import { getProducts, getProductFacets } from '@/lib/api/products';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
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

const MAX_VISIBLE_ITEMS = 8;

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

  // Local state for "show more"
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  // Fetch products with keepPreviousData to avoid flickering
  const {
    data: productsData,
    isLoading: productsLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ['products', { page, size, sort, search, category, brands, minPrice, maxPrice }],
    queryFn: async () => {
      console.log('Fetching products with params:', {
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
      console.log('Products result:', result);
      return result;
    },
    placeholderData: (prev) => prev, // Keep previous data while fetching
  });

  console.log('Products data:', productsData);
  console.log('Products loading:', productsLoading);
  console.log('Products error:', error);

  // Fetch facets (without filters to get all options)
  const { data: facets, isLoading: facetsLoading } = useQuery({
    queryKey: ['product-facets-all'],
    queryFn: () => getProductFacets({ active: true }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const products = productsData?.content || [];
  const totalElements = productsData?.totalElements || 0;
  const totalPages = productsData?.totalPages || 0;

  // Prepare categories list
  const categoriesList = facets?.categories || [];
  const visibleCategories = showAllCategories
    ? categoriesList
    : categoriesList.slice(0, MAX_VISIBLE_ITEMS);

  // Prepare brands list
  const brandsList = facets?.brands || [];
  const visibleBrands = showAllBrands ? brandsList : brandsList.slice(0, MAX_VISIBLE_ITEMS);

  const hasActiveFilters = category || brands.length > 0 || minPrice !== null || maxPrice !== null;

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-36">
          {/* Filters */}
          <div className="rounded-lg border border-slate-200 bg-white">
            {facetsLoading ? (
              <div className="space-y-4 p-4">
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
                      <div className="space-y-3">
                        {visibleCategories.map((cat) => {
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
                                <span className="ml-2 shrink-0 text-xs text-slate-400">
                                  {cat.count}
                                </span>
                              </Label>
                            </div>
                          );
                        })}
                        {categoriesList.length > MAX_VISIBLE_ITEMS && (
                          <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="text-xs text-slate-500 transition-colors hover:text-slate-700"
                          >
                            {showAllCategories
                              ? 'Thu gọn'
                              : `Xem thêm ${categoriesList.length - MAX_VISIBLE_ITEMS}`}
                          </button>
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
                      <div className="space-y-3">
                        {visibleBrands.map((brand) => {
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
                                <span className="ml-2 shrink-0 text-xs text-slate-400">
                                  {brand.count}
                                </span>
                              </Label>
                            </div>
                          );
                        })}
                        {brandsList.length > MAX_VISIBLE_ITEMS && (
                          <button
                            onClick={() => setShowAllBrands(!showAllBrands)}
                            className="text-xs text-slate-500 transition-colors hover:text-slate-700"
                          >
                            {showAllBrands
                              ? 'Thu gọn'
                              : `Xem thêm ${brandsList.length - MAX_VISIBLE_ITEMS}`}
                          </button>
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
                      <div className="space-y-3">
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
                                <span className="ml-2 shrink-0 text-xs text-slate-400">
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
        </div>
      </aside>

      {/* Product grid */}
      <div className="min-w-0 flex-1">
        {/* Toolbar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-900">{totalElements}</span> sản phẩm
              </p>
              {isFetching && !productsLoading && (
                <div className="size-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-900" />
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
                <Label htmlFor="pageSize" className="hidden text-sm text-slate-500 sm:block">
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
                  <SelectContent position="popper" sideOffset={4} className="min-w-0 w-20">
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
                <Label htmlFor="sort" className="hidden text-sm text-slate-500 sm:block">
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
                  <SelectContent position="popper" sideOffset={4} className="min-w-0 w-40">
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
              <span className="text-xs text-slate-500">Lọc theo:</span>
              {category && (
                <button
                  onClick={() => {
                    setCategory(null);
                    setPage(0);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs text-white transition-colors hover:bg-slate-700"
                >
                  <span>{category}</span>
                  <X className="size-3" />
                </button>
              )}
              {brands.map((brand) => (
                <button
                  key={brand}
                  onClick={() => {
                    setBrands(brands.filter((b) => b !== brand));
                    setPage(0);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs text-white transition-colors hover:bg-slate-700"
                >
                  <span>{brand}</span>
                  <X className="size-3" />
                </button>
              ))}
              {(minPrice !== null || maxPrice !== null) && (
                <button
                  onClick={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                    setPage(0);
                  }}
                  className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs text-white transition-colors hover:bg-slate-700"
                >
                  <span>
                    {minPrice !== null && maxPrice !== null
                      ? `${minPrice.toLocaleString()}₫ - ${maxPrice.toLocaleString()}₫`
                      : minPrice !== null
                        ? `Trên ${minPrice.toLocaleString()}₫`
                        : `Dưới ${maxPrice?.toLocaleString()}₫`}
                  </span>
                  <X className="size-3" />
                </button>
              )}
              <button
                onClick={() => {
                  setCategory(null);
                  setBrands([]);
                  setMinPrice(null);
                  setMaxPrice(null);
                  setPage(0);
                }}
                className="text-xs text-slate-500 transition-colors hover:text-slate-700"
              >
                Xóa tất cả
              </button>
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
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">Không tìm thấy sản phẩm</p>
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
