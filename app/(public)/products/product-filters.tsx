import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { getProductFacets } from '@/lib/api/public/products';
import { cn } from '@/lib/utils';
import { removeVietnameseTones } from '@/lib/utils/string';
import { formatPriceShort } from '@/lib/utils/formatting';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Search } from 'lucide-react';

interface ProductFiltersProps {
  category: string | null;
  onCategoryChange: (category: string | null) => void;
  brands: string[];
  onBrandsChange: (brands: string[]) => void;
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (minPrice: number | null, maxPrice: number | null) => void;
  onPageReset: () => void;
}

export function ProductFilters({
  category,
  onCategoryChange,
  brands,
  onBrandsChange,
  minPrice,
  maxPrice,
  onPriceChange,
  onPageReset,
}: ProductFiltersProps) {
  // Local state for filter search
  const [categorySearch, setCategorySearch] = useState('');
  const [brandSearch, setBrandSearch] = useState('');

  // Debounced search values using use-debounce library
  const [debouncedCategorySearch] = useDebounce(categorySearch, 150);
  const [debouncedBrandSearch] = useDebounce(brandSearch, 150);

  // Fetch facets WITHOUT any filters
  const { data: facets, isLoading: facetsLoading } = useQuery({
    queryKey: ['product-facets'],
    queryFn: () => getProductFacets({ active: true }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const categoriesList = facets?.categories || [];
  const brandsList = facets?.brands || [];

  // Filter categories and brands based on search with Vietnamese tone removal
  const filteredCategories = categoriesList.filter((cat) => {
    if (!debouncedCategorySearch.trim()) return true;
    const query = removeVietnameseTones(debouncedCategorySearch.trim());
    const name = removeVietnameseTones(cat.name);
    const queryWords = query.split(/\s+/);
    return queryWords.every((word) => name.includes(word));
  });

  const filteredBrands = brandsList.filter((brand) => {
    if (!debouncedBrandSearch.trim()) return true;
    const query = removeVietnameseTones(debouncedBrandSearch.trim());
    const name = removeVietnameseTones(brand.name);
    const queryWords = query.split(/\s+/);
    return queryWords.every((word) => name.includes(word));
  });

  return (
    <aside className="hidden w-64 shrink-0 lg:block">
      <div className="sticky top-24 rounded-lg border border-border bg-card">
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
                      className="h-9 rounded-full pl-9 text-sm font-normal focus-visible:ring-1"
                    />
                  </div>
                  <RadioGroup
                    value={category || ''}
                    onValueChange={(value) => {
                      onCategoryChange(value || null);
                      onPageReset();
                    }}
                    className={cn(
                      'space-y-3 pr-2',
                      filteredCategories.length > 8 && 'max-h-64 overflow-y-auto',
                    )}
                  >
                    {filteredCategories.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        Không tìm thấy danh mục
                      </p>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="" id="cat-all" />
                          <Label
                            htmlFor="cat-all"
                            className="flex flex-1 cursor-pointer items-center text-sm font-normal"
                          >
                            <span>Tất cả danh mục</span>
                          </Label>
                        </div>
                        {filteredCategories.map((cat) => (
                          <div key={cat.slug} className="flex items-center gap-2">
                            <RadioGroupItem value={cat.slug} id={`cat-${cat.slug}`} />
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
                        ))}
                      </>
                    )}
                  </RadioGroup>
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
                      className="h-9 rounded-full pl-9 text-sm font-normal focus-visible:ring-1"
                    />
                  </div>
                  <div
                    className={cn(
                      'space-y-3 pr-2',
                      filteredBrands.length > 8 && 'max-h-64 overflow-y-auto',
                    )}
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
                                if (checked === true) {
                                  onBrandsChange([...brands, brand.slug]);
                                } else {
                                  onBrandsChange(brands.filter((b) => b !== brand.slug));
                                }
                                onPageReset();
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
                  <RadioGroup
                    value={
                      minPrice !== null && maxPrice !== null
                        ? `${minPrice}-${maxPrice}`
                        : minPrice !== null
                          ? `${minPrice}-null`
                          : ''
                    }
                    onValueChange={(value) => {
                      if (!value) {
                        onPriceChange(null, null);
                      } else {
                        const [min, max] = value.split('-');
                        onPriceChange(parseInt(min), max === 'null' ? null : parseInt(max));
                      }
                      onPageReset();
                    }}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value="" id="price-all" />
                      <Label
                        htmlFor="price-all"
                        className="flex flex-1 cursor-pointer items-center text-sm font-normal"
                      >
                        <span>Tất cả mức giá</span>
                      </Label>
                    </div>
                    {facets.priceRanges.map((range, idx) => {
                      const label =
                        range.max === null
                          ? `Trên ${formatPriceShort(range.min)}`
                          : `${formatPriceShort(range.min)} - ${formatPriceShort(range.max)}`;

                      const value =
                        range.max === null ? `${range.min}-null` : `${range.min}-${range.max}`;

                      return (
                        <div key={idx} className="flex items-center gap-2">
                          <RadioGroupItem value={value} id={`price-${idx}`} />
                          <Label
                            htmlFor={`price-${idx}`}
                            className="flex flex-1 cursor-pointer items-center justify-between text-sm font-normal"
                          >
                            <span className="truncate">{label}</span>
                            <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                              {range.count}
                            </span>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        )}
      </div>
    </aside>
  );
}
