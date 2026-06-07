'use client';

import { useQuery } from '@tanstack/react-query';
import { getProducts } from '@/lib/api/public/products';
import { useProductFilters } from './use-product-filters';
import { ProductFilters } from './product-filters';
import { ProductToolbar } from './product-toolbar';
import { ProductGrid } from './product-grid';
import { Pagination } from './pagination';

export function ProductsClient() {
  const filters = useProductFilters();

  // Fetch products
  const { data: productsData, isLoading: productsLoading, isError: productsError } = useQuery({
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
    queryFn: () =>
      getProducts({
        page: filters.page,
        size: filters.size,
        sort: filters.sort,
        search: filters.search || undefined,
        category: filters.category || undefined,
        brand: filters.brands.length > 0 ? filters.brands : undefined,
        minPrice: filters.minPrice ?? undefined,
        maxPrice: filters.maxPrice ?? undefined,
        active: true,
      }),
    placeholderData: (prev) => prev,
    staleTime: 2 * 60 * 1000,
  });

  const products = productsData?.content || [];
  const totalElements = productsData?.totalElements || 0;
  const totalPages = productsData?.totalPages || 0;

  // Event handlers (React Compiler auto-optimizes these)
  const handlePriceChange = (min: number | null, max: number | null) => {
    void filters.setMinPrice(min);
    void filters.setMaxPrice(max);
  };

  const handlePageReset = () => {
    void filters.setPage(0);
  };

  const handleCategoryRemove = () => {
    void filters.setCategory(null);
  };

  const handleBrandRemove = (brand: string) => {
    void filters.setBrands(filters.brands.filter((b) => b !== brand));
  };

  const handlePriceRemove = () => {
    void filters.setMinPrice(null);
    void filters.setMaxPrice(null);
  };

  return (
    <div className="flex gap-8">
      <ProductFilters
        category={filters.category}
        onCategoryChange={filters.setCategory}
        brands={filters.brands}
        onBrandsChange={filters.setBrands}
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onPriceChange={handlePriceChange}
        onPageReset={handlePageReset}
      />

      <div className="min-w-0 flex-1">
        <ProductToolbar
          totalElements={totalElements}
          size={filters.size}
          onSizeChange={filters.setSize}
          sort={filters.sort}
          onSortChange={filters.setSort}
          category={filters.category}
          onCategoryRemove={handleCategoryRemove}
          brands={filters.brands}
          onBrandRemove={handleBrandRemove}
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onPriceRemove={handlePriceRemove}
          hasActiveFilters={filters.hasActiveFilters}
          onClearAll={filters.clearAllFilters}
          onPageReset={handlePageReset}
        />

        <ProductGrid products={products} isLoading={productsLoading} isError={productsError} />

        <Pagination page={filters.page} totalPages={totalPages} onPageChange={filters.setPage} />
      </div>
    </div>
  );
}
