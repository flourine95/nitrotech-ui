'use client';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import {
  ArrowUpDown, ChevronLeft, ChevronRight, Download, Ellipsis, Eye, EyeOff, Package,
  Pencil, Plus, RotateCcw, Search, Trash2, Upload, X,
} from 'lucide-react';
import {
  deleteProduct, getProducts, hardDeleteProduct,
  type Product, restoreProduct, updateProduct,
  bulkDeleteProducts, bulkRestoreProducts, bulkUpdateActive, bulkHardDeleteProducts,
  exportProducts,
} from '@/lib/api/products';
import type { Category } from '@/lib/api/categories';
import { getCategories } from '@/lib/api/categories';
import { getBrands } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogMedia, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useDeferredValue, useState } from 'react';
import { formatPrice, PAGE_SIZE, SORT_OPTIONS, type SortValue, productsToCSV, downloadCSV } from './utils';
import { ProductFilterChips } from './product-filter-chips';
import { ProductBulkBar } from './product-bulk-bar';
import { ProductImportDialog } from './product-import-dialog';

type FilterStatus = 'all' | 'active' | 'inactive' | 'deleted';

export default function DashboardProductsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [filterStatus, setFilterStatus] = useQueryState(
    'status',
    parseAsStringEnum<FilterStatus>(['all', 'active', 'inactive', 'deleted']).withDefault('all'),
  );
  const [filterCategoryId, setFilterCategoryId] = useQueryState('cat', parseAsInteger);
  const [filterBrandId, setFilterBrandId] = useQueryState('brand', parseAsInteger);
  const [currentPage, setCurrentPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [sortBy, setSortBy] = useQueryState(
    'sort',
    parseAsStringEnum<SortValue>(SORT_OPTIONS.map((o) => o.value) as SortValue[]).withDefault('createdAt,desc'),
  );

  const deferredSearch = useDeferredValue(search);

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
    'products', deferredSearch, filterStatus, filterCategoryId, filterBrandId, currentPage, sortBy,
  ] as const;

  const productsQuery = useQuery({
    queryKey,
    queryFn: () =>
      getProducts({
        search: deferredSearch || undefined,
        active: isDeleted ? undefined : activeFilter,
        deleted: isDeleted ? true : undefined,
        categoryId: filterCategoryId ?? undefined,
        brandId: filterBrandId ?? undefined,
        page: currentPage,
        size: PAGE_SIZE,
        sort: sortBy,
      }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await getCategories({ tree: false });
      return Array.isArray(res)
        ? (res as Category[])
        : ((res as { content: Category[] }).content ?? []);
    },
    staleTime: 5 * 60 * 1000, // 5 min — categories don't change often
  });

  const brandsQuery = useQuery({
    queryKey: ['brands-all'],
    queryFn: () => getBrands({ size: 100 }).then((r) => r.content),
    staleTime: 5 * 60 * 1000,
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (product: Product) => updateProduct(product.id, { active: !product.active }),
    onSuccess: (updated) => {
      queryClient.setQueryData(
        queryKey,
        (old: typeof productsQuery.data) =>
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
      next.has(id) ? next.delete(id) : next.add(id);
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

  function clearSelection() {
    setSelectedIds(new Set());
  }

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
    toast.success(`Đã xóa vĩnh viễn ${r.success} sản phẩm${r.failed ? `, ${r.failed} thất bại` : ''}`);
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
        search: deferredSearch || undefined,
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
    void setSearch(null);
    void setFilterCategoryId(null);
    void setFilterBrandId(null);
    void setSortBy(null);
    void setCurrentPage(0);
    clearSelection();
  }

  const products = productsQuery.data?.content ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 0;
  const totalElements = productsQuery.data?.totalElements ?? 0;
  const loading = productsQuery.isLoading;
  const categories = categoriesQuery.data ?? [];
  const brands = brandsQuery.data ?? [];

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
              onMouseEnter={() => import('./rich-text-editor')}
            >
              <Plus className="h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm tên, slug..."
            value={search}
            onChange={(e) => {
              void setSearch(e.target.value || null);
              void setCurrentPage(0);
              clearSelection();
            }}
            className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent py-1 pr-4 pl-9 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-hidden"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { void setSearch(null); void setCurrentPage(0); clearSelection(); }}
              className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: 'all', label: 'Tất cả' },
              { value: 'active', label: 'Hiển thị' },
              { value: 'inactive', label: 'Ẩn' },
              { value: 'deleted', label: 'Đã xóa' },
            ] as { value: FilterStatus; label: string }[]
          ).map((f) => (
            <Button
              key={f.value}
              variant={filterStatus === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => { void setFilterStatus(f.value); void setCurrentPage(0); clearSelection(); }}
            >
              {f.label}
            </Button>
          ))}
          <Select
            value={filterCategoryId ? String(filterCategoryId) : 'all'}
            onValueChange={(v) => {
              void setFilterCategoryId(v === 'all' ? null : Number(v));
              void setCurrentPage(0);
              clearSelection();
            }}
          >
            <SelectTrigger className="h-9 w-auto min-w-36">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={filterBrandId ? String(filterBrandId) : 'all'}
            onValueChange={(v) => {
              void setFilterBrandId(v === 'all' ? null : Number(v));
              void setCurrentPage(0);
              clearSelection();
            }}
          >
            <SelectTrigger className="h-9 w-auto min-w-36">
              <SelectValue placeholder="Thương hiệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thương hiệu</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={sortBy}
            onValueChange={(v) => { void setSortBy(v as SortValue); void setCurrentPage(0); }}
          >
            <SelectTrigger className="h-9 w-auto min-w-36">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

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
        onClearSearch={() => { void setSearch(null); void setCurrentPage(0); clearSelection(); }}
        onClearCategory={() => { void setFilterCategoryId(null); void setCurrentPage(0); clearSelection(); }}
        onClearBrand={() => { void setFilterBrandId(null); void setCurrentPage(0); clearSelection(); }}
        onClearSort={() => { void setSortBy(null); }}
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
      <div className="rounded-md border">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm font-medium">
              {search || filterCategoryId || filterBrandId
                ? 'Không tìm thấy sản phẩm nào phù hợp'
                : isDeleted
                  ? 'Không có sản phẩm nào đã xóa'
                  : 'Chưa có sản phẩm nào'}
            </p>
            {(search || filterCategoryId || filterBrandId) && (
              <Button variant="link" size="sm" onClick={clearAllFilters} className="mt-1 h-auto p-0 text-xs">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 px-4">
                  <Checkbox
                    checked={someSelected ? 'indeterminate' : allSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Chọn tất cả"
                  />
                </TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Danh mục / Thương hiệu</TableHead>
                <TableHead className="text-right">Giá</TableHead>
                <TableHead className="text-center">Variants</TableHead>
                {!isDeleted && <TableHead className="text-center">Trạng thái</TableHead>}
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow
                  key={p.id}
                  data-state={selectedIds.has(p.id) ? 'selected' : undefined}
                >
                  <TableCell className="px-4">
                    <Checkbox
                      checked={selectedIds.has(p.id)}
                      onCheckedChange={() => toggleSelect(p.id)}
                      aria-label={`Chọn ${p.name}`}
                    />
                  </TableCell>

                  {/* Product */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded-md">
                            {p.thumbnail && p.thumbnail.startsWith('http') ? (
                              <Image src={p.thumbnail} alt={p.name} fill className="object-cover" sizes="40px" />
                            ) : (
                              <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </TooltipTrigger>
                        {p.thumbnail && p.thumbnail.startsWith('http') && (
                          <TooltipContent side="right" className="p-1.5">
                            <Image src={p.thumbnail} alt={p.name} width={160} height={160} className="rounded object-contain" />
                          </TooltipContent>
                        )}
                      </Tooltip>
                      <span className={`max-w-[260px] truncate text-sm font-medium ${!p.active ? 'text-muted-foreground' : ''}`}>
                        {p.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Category / Brand */}
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      {p.categoryName && (
                        <Badge variant="secondary" className="w-fit font-normal">{p.categoryName}</Badge>
                      )}
                      {p.brandName && (
                        <span className="text-xs text-muted-foreground">{p.brandName}</span>
                      )}
                      {!p.categoryName && !p.brandName && <span className="text-muted-foreground">—</span>}
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatPrice(p.priceMin, p.priceMax)}
                  </TableCell>

                  {/* Variants */}
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-normal">{p.variantCount}</Badge>
                  </TableCell>

                  {/* Status toggle */}
                  {!isDeleted && (
                    <TableCell className="text-center">
                      <Switch
                        checked={p.active}
                        onCheckedChange={() => toggleActiveMutation.mutate(p)}
                        disabled={toggleActiveMutation.isPending}
                        aria-label={p.active ? 'Đang hiển thị' : 'Đang ẩn'}
                      />
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell>
                    <div className="flex justify-end">
                      {isDeleted ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" aria-label={`Hành động cho ${p.name}`}>
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setRestoreTarget(p)}>
                              <RotateCcw className="h-4 w-4" /> Khôi phục
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setHardDeleteTarget(p)}>
                              <Trash2 className="h-4 w-4" /> Xóa vĩnh viễn
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 rounded-full text-muted-foreground" aria-label={`Hành động cho ${p.name}`}>
                              <Ellipsis className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/products/${p.id}`}>
                                <Eye className="h-4 w-4" /> Xem chi tiết
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/products/${p.id}/edit`}>
                                <Pencil className="h-4 w-4" /> Chỉnh sửa
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleActiveMutation.mutate(p)}>
                              {p.active
                                ? <><EyeOff className="h-4 w-4" /> Ẩn</>
                                : <><Eye className="h-4 w-4" /> Hiển thị</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(p)}>
                              <Trash2 className="h-4 w-4" /> Xóa
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Footer: count + pagination */}
        {!loading && totalElements > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              {totalElements} sản phẩm · trang {currentPage + 1}/{totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => void setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i : currentPage < 4 ? i : currentPage > totalPages - 4 ? totalPages - 7 + i : currentPage - 3 + i;
                return (
                  <Button key={p} variant={currentPage === p ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => void setCurrentPage(p)}>
                    {p + 1}
                  </Button>
                );
              })}
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => void setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong className="text-slate-900">{deleteTarget?.name}</strong>. Sản phẩm
              sẽ bị ẩn và có thể khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-emerald-100 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Khôi phục sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Khôi phục <strong className="text-slate-900">{restoreTarget?.name}</strong> về trạng
              thái hiển thị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreTarget && restoreMutation.mutate(restoreTarget)}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? 'Đang khôi phục...' : 'Khôi phục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!hardDeleteTarget} onOpenChange={(v) => !v && setHardDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa vĩnh viễn?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-slate-900">{hardDeleteTarget?.name}</strong> sẽ bị xóa hoàn
              toàn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => hardDeleteTarget && hardDeleteMutation.mutate(hardDeleteTarget)}
              disabled={hardDeleteMutation.isPending}
            >
              {hardDeleteMutation.isPending ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import dialog */}
      <ProductImportDialog
        open={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={() => void queryClient.invalidateQueries({ queryKey: ['products'] })}
      />
    </div>
  );
}
