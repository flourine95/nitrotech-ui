'use client';
import Link from 'next/link';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { Download, Plus, Search, Upload, X } from 'lucide-react';
import {
  bulkDeleteProducts,
  bulkHardDeleteProducts,
  bulkRestoreProducts,
  bulkUpdateActive,
  deleteProduct,
  exportProducts,
  getProducts,
  hardDeleteProduct,
  type Product,
  restoreProduct,
  updateProduct,
} from '@/lib/api/products';
import type { Category } from '@/lib/api/categories';
import { getCategories } from '@/lib/api/categories';
import { getBrands } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  downloadCSV,
  PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  productsToCSV,
  SORT_OPTIONS,
  SORT_VALUES,
  type PageSizeOption,
  type SortValue,
} from './utils';
import { ProductFilterChips } from './product-filter-chips';
import { ProductBulkBar } from './product-bulk-bar';
import { ProductImportDialog } from './product-import-dialog';
import { ProductTable } from './product-table';
import { ProductDialogs } from './product-dialogs';

type FilterStatus = 'all' | 'active' | 'inactive' | 'deleted';

// Module-level stable parsers — outside component to avoid re-creating on every render
const FILTER_STATUS_VALUES: FilterStatus[] = ['all', 'active', 'inactive', 'deleted'];

const filterParsers = {
  q: parseAsString.withDefault(''),
  status: parseAsStringEnum<FilterStatus>(FILTER_STATUS_VALUES).withDefault('all'),
  cat: parseAsInteger,
  brand: parseAsInteger,
  page: parseAsInteger.withDefault(0),
  size: parseAsInteger.withDefault(PAGE_SIZE),
  sort: parseAsStringEnum<SortValue>(SORT_VALUES).withDefault('createdAt,desc'),
};

const EMPTY_CATEGORIES: Category[] = [];
const EMPTY_BRANDS: Brand[] = [];

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hiển thị' },
  { value: 'inactive', label: 'Ẩn' },
  { value: 'deleted', label: 'Đã xóa' },
];

type Brand = { id: number; name: string };

const FilterBar = memo(function FilterBar({
  searchValue,
  filterStatus,
  filterCategoryId,
  filterBrandId,
  sortBy,
  categories,
  brands,
  onSearchCommit,
  onStatusChange,
  onCategoryChange,
  onBrandChange,
  onSortChange,
}: {
  searchValue: string;
  filterStatus: FilterStatus;
  filterCategoryId: number | null;
  filterBrandId: number | null;
  sortBy: SortValue;
  categories: Category[];
  brands: Brand[];
  onSearchCommit: (val: string) => void;
  onStatusChange: (val: FilterStatus) => void;
  onCategoryChange: (val: number | null) => void;
  onBrandChange: (val: number | null) => void;
  onSortChange: (val: SortValue) => void;
}) {
  const [inputVal, setInputVal] = useState(searchValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync input when external searchValue changes (e.g. clearAllFilters)
  useEffect(() => {
    setInputVal(searchValue);
  }, [searchValue]);

  function handleInputChange(val: string) {
    setInputVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchCommit(val), 300);
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm tên, slug..."
          value={inputVal}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pr-10 pl-9"
        />
        {inputVal && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setInputVal('');
              onSearchCommit('');
              if (debounceRef.current) clearTimeout(debounceRef.current);
            }}
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filterStatus === f.value ? 'default' : 'outline'}
            size="sm"
            className="h-8"
            onClick={() => onStatusChange(f.value)}
          >
            {f.label}
          </Button>
        ))}
        <Select
          value={filterCategoryId ? String(filterCategoryId) : 'all'}
          onValueChange={(v) => onCategoryChange(v === 'all' ? null : Number(v))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterBrandId ? String(filterBrandId) : 'all'}
          onValueChange={(v) => onBrandChange(v === 'all' ? null : Number(v))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Thương hiệu" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="all">Tất cả thương hiệu</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b.id} value={String(b.id)}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortValue)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Sắp xếp" />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {SORT_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

export default function DashboardProductsPage() {
  const queryClient = useQueryClient();

  const [filters, setFilters] = useQueryStates(filterParsers, {
    shallow: true,
    history: 'replace',
    throttleMs: 100,
  });
  const {
    q: search,
    status: filterStatus,
    cat: filterCategoryId,
    brand: filterBrandId,
    page: currentPage,
    size: pageSize,
    sort: sortBy,
  } = filters;

  const setSearch = useCallback(
    (val: string | null) => {
      void setFilters({ q: val, page: 0 });
    },
    [setFilters],
  );
  const setFilterStatus = useCallback(
    (val: FilterStatus) => {
      void setFilters({ status: val, page: 0 });
    },
    [setFilters],
  );
  const setFilterCategoryId = useCallback(
    (val: number | null) => {
      void setFilters({ cat: val, page: 0 });
    },
    [setFilters],
  );
  const setFilterBrandId = useCallback(
    (val: number | null) => {
      void setFilters({ brand: val, page: 0 });
    },
    [setFilters],
  );
  const setCurrentPage = useCallback(
    (val: number) => {
      void setFilters({ page: val });
    },
    [setFilters],
  );
  const setPageSize = useCallback(
    (val: PageSizeOption) => {
      void setFilters({ size: val, page: 0 });
    },
    [setFilters],
  );
  const setSortBy = useCallback(
    (val: SortValue | null) => {
      void setFilters({ sort: val, page: 0 });
    },
    [setFilters],
  );

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showImport, setShowImport] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Product | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Product | null>(null);

  const isDeleted = filterStatus === 'deleted';
  const activeFilter =
    filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined;

  const queryKey = [
    'products',
    search,
    filterStatus,
    filterCategoryId,
    filterBrandId,
    currentPage,
    pageSize,
    sortBy,
  ] as const;

  const productsQuery = useQuery({
    queryKey,
    queryFn: () =>
      getProducts({
        search: search || undefined,
        active: isDeleted ? undefined : activeFilter,
        deleted: isDeleted ? true : undefined,
        categoryId: filterCategoryId ?? undefined,
        brandId: filterBrandId ?? undefined,
        page: currentPage,
        size: pageSize,
        sort: sortBy,
      }),
    placeholderData: (prev) => prev,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await getCategories({ tree: false });
      return Array.isArray(res)
        ? (res as Category[])
        : ((res as { content: Category[] }).content ?? []);
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const brandsQuery = useQuery({
    queryKey: ['brands-all'],
    queryFn: () => getBrands({ size: 100 }).then((r) => r.content),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (product: Product) => updateProduct(product.id, { active: !product.active }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, (old: typeof productsQuery.data) =>
        old
          ? { ...old, content: old.content.map((p) => (p.id === updated.id ? updated : p)) }
          : old,
      );
      toast.success(updated.active ? 'Đã hiển thị' : 'Đã ẩn');
    },
    onError: () => toast.error('Cập nhật thất bại'),
  });

  const deleteMutation = useMutation({
    mutationFn: (product: Product) => deleteProduct(product.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã xóa sản phẩm');
      setDeleteTarget(null);
    },
    onError: (e) => {
      if (!(e instanceof ApiException)) toast.error('Xóa thất bại');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (product: Product) => restoreProduct(product.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã khôi phục sản phẩm');
      setRestoreTarget(null);
    },
    onError: () => toast.error('Khôi phục thất bại'),
  });

  const hardDeleteMutation = useMutation({
    mutationFn: (product: Product) => hardDeleteProduct(product.id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Đã xóa vĩnh viễn');
      setHardDeleteTarget(null);
    },
    onError: () => toast.error('Xóa vĩnh viễn thất bại'),
  });

  // ── Selection helpers ──────────────────────────────────────────────────────

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  }

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const onSearchChange = useCallback(
    (val: string) => {
      setSearch(val || null);
      clearSelection();
    },
    [setSearch, clearSelection],
  );
  const onStatusChange = useCallback(
    (val: FilterStatus) => {
      setFilterStatus(val);
      clearSelection();
    },
    [setFilterStatus, clearSelection],
  );
  const onCategoryChange = useCallback(
    (val: number | null) => {
      setFilterCategoryId(val);
      clearSelection();
    },
    [setFilterCategoryId, clearSelection],
  );
  const onBrandChange = useCallback(
    (val: number | null) => {
      setFilterBrandId(val);
      clearSelection();
    },
    [setFilterBrandId, clearSelection],
  );
  const onSortChange = useCallback(
    (val: SortValue) => {
      setSortBy(val);
    },
    [setSortBy],
  );

  // ── Bulk actions ───────────────────────────────────────────────────────────

  async function handleBulkShow() {
    const ids = [...selectedIds];
    const r = await bulkUpdateActive(ids, true);
    toast.success(`Đã hiển thị ${r.success} sản phẩm${r.failed ? `, ${r.failed} thất bại` : ''}`);
    void queryClient.invalidateQueries({ queryKey: ['products'] });
    clearSelection();
  }

  async function handleBulkHide() {
    const ids = [...selectedIds];
    const r = await bulkUpdateActive(ids, false);
    toast.success(`Đã ẩn ${r.success} sản phẩm${r.failed ? `, ${r.failed} thất bại` : ''}`);
    void queryClient.invalidateQueries({ queryKey: ['products'] });
    clearSelection();
  }

  async function handleBulkDelete() {
    const ids = [...selectedIds];
    const r = await bulkDeleteProducts(ids);
    toast.success(`Đã xóa ${r.success} sản phẩm${r.failed ? `, ${r.failed} thất bại` : ''}`);
    void queryClient.invalidateQueries({ queryKey: ['products'] });
    clearSelection();
  }

  async function handleBulkRestore() {
    const ids = [...selectedIds];
    const r = await bulkRestoreProducts(ids);
    toast.success(`Đã khôi phục ${r.success} sản phẩm${r.failed ? `, ${r.failed} thất bại` : ''}`);
    void queryClient.invalidateQueries({ queryKey: ['products'] });
    clearSelection();
  }

  async function handleBulkHardDelete() {
    const ids = [...selectedIds];
    const r = await bulkHardDeleteProducts(ids);
    toast.success(
      `Đã xóa vĩnh viễn ${r.success} sản phẩm${r.failed ? `, ${r.failed} thất bại` : ''}`,
    );
    void queryClient.invalidateQueries({ queryKey: ['products'] });
    clearSelection();
  }

  // ── Export ─────────────────────────────────────────────────────────────────

  function handleExportSelected() {
    const selected = products.filter((p) => selectedIds.has(p.id));
    downloadCSV(productsToCSV(selected), `products-selected-${Date.now()}.csv`);
    toast.success(`Đã xuất ${selected.length} sản phẩm`);
  }

  async function handleExportFiltered() {
    toast.info('Đang xuất dữ liệu...');
    try {
      const data = await exportProducts({
        search: search || undefined,
        active: isDeleted ? undefined : activeFilter,
        deleted: isDeleted ? true : undefined,
        categoryId: filterCategoryId ?? undefined,
        brandId: filterBrandId ?? undefined,
        sort: sortBy,
      });
      downloadCSV(productsToCSV(data.content), `products-export-${Date.now()}.csv`);
      toast.success(`Đã xuất ${data.content.length} sản phẩm`);
    } catch {
      toast.error('Xuất thất bại');
    }
  }

  // ── Filter clear helpers ───────────────────────────────────────────────────

  function clearAllFilters() {
    void setFilters({ q: null, cat: null, brand: null, sort: null, page: 0, size: PAGE_SIZE });
    clearSelection();
  }

  const products = productsQuery.data?.content ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 0;
  const totalElements = productsQuery.data?.totalElements ?? 0;
  const loading = productsQuery.isLoading;
  const isFetching = productsQuery.isFetching;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;
  const brands = brandsQuery.data ?? EMPTY_BRANDS;

  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected = products.some((p) => selectedIds.has(p.id)) && !allSelected;

  const categoryName = categories.find((c) => c.id === filterCategoryId)?.name;
  const brandName = brands.find((b) => b.id === filterBrandId)?.name;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sản phẩm</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý danh sách sản phẩm</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportFiltered}>
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button asChild size="sm">
            <Link
              href="/dashboard/products/new"
              onMouseEnter={() => import('./rich-text-editor-v2')}
            >
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <FilterBar
        searchValue={search}
        filterStatus={filterStatus}
        filterCategoryId={filterCategoryId}
        filterBrandId={filterBrandId}
        sortBy={sortBy as SortValue}
        categories={categories}
        brands={brands}
        onSearchCommit={onSearchChange}
        onStatusChange={onStatusChange}
        onCategoryChange={onCategoryChange}
        onBrandChange={onBrandChange}
        onSortChange={onSortChange}
      />

      {/* Active filter chips */}
      <ProductFilterChips
        search={search}
        filterStatus={filterStatus}
        filterCategoryId={filterCategoryId}
        filterBrandId={filterBrandId}
        sortBy={sortBy as SortValue}
        categoryName={categoryName}
        brandName={brandName}
        totalElements={totalElements}
        onClearSearch={() => {
          setSearch(null);
          clearSelection();
        }}
        onClearCategory={() => {
          setFilterCategoryId(null);
          clearSelection();
        }}
        onClearBrand={() => {
          setFilterBrandId(null);
          clearSelection();
        }}
        onClearSort={() => {
          setSortBy(null);
        }}
        onClearAll={clearAllFilters}
      />

      {/* Bulk action bar */}
      <ProductBulkBar
        selectedCount={selectedIds.size}
        isDeleted={isDeleted}
        onClearSelection={clearSelection}
        onBulkShow={handleBulkShow}
        onBulkHide={handleBulkHide}
        onBulkDelete={handleBulkDelete}
        onBulkRestore={handleBulkRestore}
        onBulkHardDelete={handleBulkHardDelete}
        onExportSelected={handleExportSelected}
      />

      {/* Table */}
      <ProductTable
        products={products}
        loading={loading}
        isFetching={isFetching}
        isDeleted={isDeleted}
        selectedIds={selectedIds}
        allSelected={allSelected}
        someSelected={someSelected}
        currentPage={currentPage}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={pageSize}
        toggleActivePending={toggleActiveMutation.isPending}
        onToggleSelect={toggleSelect}
        onToggleSelectAll={toggleSelectAll}
        onToggleActive={(p) => toggleActiveMutation.mutate(p)}
        onDelete={setDeleteTarget}
        onRestore={setRestoreTarget}
        onHardDelete={setHardDeleteTarget}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        onClearFilters={clearAllFilters}
        hasActiveFilters={!!(search || filterCategoryId || filterBrandId)}
      />

      {/* Dialogs */}
      <ProductDialogs
        deleteTarget={deleteTarget}
        restoreTarget={restoreTarget}
        hardDeleteTarget={hardDeleteTarget}
        deletePending={deleteMutation.isPending}
        restorePending={restoreMutation.isPending}
        hardDeletePending={hardDeleteMutation.isPending}
        onDeleteConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onRestoreConfirm={() => restoreTarget && restoreMutation.mutate(restoreTarget)}
        onHardDeleteConfirm={() => hardDeleteTarget && hardDeleteMutation.mutate(hardDeleteTarget)}
        onDeleteClose={() => setDeleteTarget(null)}
        onRestoreClose={() => setRestoreTarget(null)}
        onHardDeleteClose={() => setHardDeleteTarget(null)}
      />

      {/* Import dialog */}
      <ProductImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['products'] })}
      />
    </div>
  );
}
