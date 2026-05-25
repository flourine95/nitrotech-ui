'use client';

import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api/products';
import { useProductFilters } from './use-product-filters';
import { ProductFilters } from './product-filters';
import { ProductToolbar } from './product-toolbar';
import { ProductGrid } from './product-grid';
import { Pagination } from './pagination';

export function ProductsClient() {
  const filters = useProductFilters();

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: [
      'products',
      {
        page: filters.page,
        size: filters.size,
        sort: filters.sort,
        search: filters.search,
        category: filters.category,
        brands: filters.brands,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
      },
    ],
    queryFn: async () => {
      return await getProducts({
        page: filters.page,
        size: filters.size,
        sort: filters.sort,
        search: filters.search || undefined,
        category: filters.category || undefined,
        brand: filters.brands.length > 0 ? filters.brands : undefined,
        minPrice: filters.minPrice ?? undefined,
        maxPrice: filters.maxPrice ?? undefined,
        active: true,
      });
    },
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  });

  const products = productsData?.content || [];
  const totalElements = productsData?.totalElements || 0;
  const totalPages = productsData?.totalPages || 0;

  return (
    <div className="flex gap-8">
      <ProductFilters
        category={filters.category}
        onCategoryChange={filters.setCategory}
        brands={filters.brands}
        onBrandsChange={filters.setBrands}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onPriceChange={(min, max) => {
          filters.setMinPrice(min);
          filters.setMaxPrice(max);
        }}
        onPageReset={() => filters.setPage(0)}
      />

      <div className="min-w-0 flex-1">
        <ProductToolbar
          totalElements={totalElements}
          size={filters.size}
          onSizeChange={filters.setSize}
          sort={filters.sort}
          onSortChange={filters.setSort}
          category={filters.category}
          onCategoryRemove={() => filters.setCategory(null)}
          brands={filters.brands}
          onBrandRemove={(brand) => filters.setBrands(filters.brands.filter((b) => b !== brand))}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onPriceRemove={() => {
            filters.setMinPrice(null);
            filters.setMaxPrice(null);
          }}
          hasActiveFilters={filters.hasActiveFilters}
          onClearAll={filters.clearAllFilters}
          onPageReset={() => filters.setPage(0)}
        />

        <ProductGrid products={products} isLoading={productsLoading} />

        <Pagination
          page={filters.page}
          totalPages={totalPages}
          onPageChange={filters.setPage}
        />
      </div>
    </div>
  );
}
