'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Building2, ChevronLeft, ChevronRight, Package,
  Pencil, Plus, RotateCcw, Search, Trash2, X,
} from 'lucide-react';
import {
  type Product, deleteProduct, getProducts,
  hardDeleteProduct, restoreProduct, updateProduct,
} from '@/lib/api/products';
import { getCategories } from '@/lib/api/categories';
import { getBrands } from '@/lib/api/brands';
import type { Category } from '@/lib/api/categories';
import type { Brand } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogMedia, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Page } from '@/lib/types/pagination';

type FilterStatus = 'all' | 'active' | 'inactive' | 'deleted';

function formatPrice(min: number | null, max: number | null): string {
  if (min === null) return '—';
  const fmt = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
  return min === max ? fmt(min) : `${fmt(min)} – ${fmt(max!)}`;
}

const PAGE_SIZE = 20;

export default function DashboardProductsPage() {
  const [page, setPage] = useState<Page<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterCategoryId, setFilterCategoryId] = useState<number | undefined>();
  const [filterBrandId, setFilterBrandId] = useState<number | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Product | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [hardDeleting, setHardDeleting] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setCurrentPage(0); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const isDeleted = filterStatus === 'deleted';
      const active = filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined;
      const data = await getProducts({
        search: debouncedSearch || undefined,
        active: isDeleted ? undefined : active,
        deleted: isDeleted ? true : undefined,
        categoryId: filterCategoryId,
        brandId: filterBrandId,
        page: currentPage,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
      });
      setPage(data);
    } catch {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, filterCategoryId, filterBrandId, currentPage]);

  useEffect(() => { load(); }, [load]);

  // Load categories + brands for filters
  useEffect(() => {
    Promise.all([
      getCategories({ tree: false }) as Promise<{ content: Category[] }>,
      getBrands({ size: 100 }),
    ]).then(([cats, brnds]) => {
      const catList = Array.isArray(cats) ? cats : (cats as { content: Category[] }).content ?? [];
      setCategories(catList);
      setBrands(brnds.content);
    }).catch(() => {});
  }, []);

  const products = page?.content ?? [];
  const totalPages = page?.totalPages ?? 0;
  const totalElements = page?.totalElements ?? 0;

  const filterCounts = useMemo(() => ({
    all: filterStatus === 'all' ? totalElements : undefined,
  }), [filterStatus, totalElements]);

  async function handleToggleActive(product: Product) {
    try {
      const updated = await updateProduct(product.id, { active: !product.active });
      setPage((prev) => prev ? {
        ...prev,
        content: prev.content.map((p) => p.id === updated.id ? updated : p),
      } : prev);
      toast.success(updated.active ? 'Đã hiển thị' : 'Đã ẩn');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  }

  async function confirmDelete(product: Product) {
    setDeleting(true);
    try {
      await deleteProduct(product.id);
      await load();
      toast.success('Đã xóa sản phẩm');
    } catch (e) {
      if (!(e instanceof ApiException)) toast.error('Xóa thất bại');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function confirmRestore(product: Product) {
    setRestoring(true);
    try {
      await restoreProduct(product.id);
      await load();
      toast.success('Đã khôi phục sản phẩm');
    } finally {
      setRestoring(false);
      setRestoreTarget(null);
    }
  }

  async function confirmHardDelete(product: Product) {
    setHardDeleting(true);
    try {
      await hardDeleteProduct(product.id);
      await load();
      toast.success('Đã xóa vĩnh viễn');
    } finally {
      setHardDeleting(false);
      setHardDeleteTarget(null);
    }
  }

  const isDeleted = filterStatus === 'deleted';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="mt-0.5 text-sm text-slate-500">Quản lý danh sách sản phẩm</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            { value: 'all', label: 'Tất cả' },
            { value: 'active', label: 'Hiển thị' },
            { value: 'inactive', label: 'Ẩn' },
            { value: 'deleted', label: 'Đã xóa' },
          ] as { value: FilterStatus; label: string }[]).map((f) => (
            <button
              key={f.value}
              onClick={() => { setFilterStatus(f.value); setCurrentPage(0); }}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                filterStatus === f.value
                  ? f.value === 'deleted' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
          {/* Category filter */}
          <Select
            value={filterCategoryId ? String(filterCategoryId) : 'all'}
            onValueChange={(v) => { setFilterCategoryId(v === 'all' ? undefined : Number(v)); setCurrentPage(0); }}
          >
            <SelectTrigger className="h-9 rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-600">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {/* Brand filter */}
          <Select
            value={filterBrandId ? String(filterBrandId) : 'all'}
            onValueChange={(v) => { setFilterBrandId(v === 'all' ? undefined : Number(v)); setCurrentPage(0); }}
          >
            <SelectTrigger className="h-9 rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-600">
              <SelectValue placeholder="Tất cả thương hiệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thương hiệu</SelectItem>
              {brands.map((b) => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Package className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium">
              {search ? `Không tìm thấy "${search}"` : isDeleted ? 'Không có sản phẩm nào đã xóa' : 'Chưa có sản phẩm nào'}
            </p>
            {search && <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-blue-500 hover:underline">Xóa bộ lọc</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Sản phẩm</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Danh mục / Thương hiệu</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Giá</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Variants</th>
                  {!isDeleted && <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>}
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                              {p.thumbnail && p.thumbnail.startsWith('http')
                                ? <img src={p.thumbnail} alt={p.name} className="h-full w-full object-cover" />
                                : <Package className="h-5 w-5 text-slate-300" />}
                            </div>
                          </TooltipTrigger>
                          {p.thumbnail && p.thumbnail.startsWith('http') && (
                            <TooltipContent side="right" className="p-2">
                              <img src={p.thumbnail} alt={p.name} className="h-40 w-40 rounded-lg object-contain" />
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <div>
                          <p className={`font-semibold ${p.active ? 'text-slate-900' : 'text-slate-400'}`}>{p.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {p.categoryName && <p className="text-xs text-slate-600">{p.categoryName}</p>}
                        {p.brandName && <p className="text-xs text-slate-400">{p.brandName}</p>}
                        {!p.categoryName && !p.brandName && <span className="text-slate-300">—</span>}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        {formatPrice(p.priceMin, p.priceMax)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {p.variantCount}
                      </span>
                    </td>
                    {!isDeleted && (
                      <td className="px-5 py-4 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleToggleActive(p)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${p.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            >
                              <span className={`inline-flex h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${p.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{p.active ? 'Đang hiển thị — nhấn để ẩn' : 'Đang ẩn — nhấn để hiển thị'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {isDeleted ? (
                          <>
                            <button
                              onClick={() => setRestoreTarget(p)}
                              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Khôi phục
                            </button>
                            <button
                              onClick={() => setHardDeleteTarget(p)}
                              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Xóa vĩnh viễn
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              href={`/dashboard/products/${p.id}/edit`}
                              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                              aria-label={`Sửa ${p.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Xóa ${p.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer: count + pagination */}
        {!loading && page && totalElements > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
            <p className="text-xs text-slate-400">
              {totalElements} sản phẩm · trang {currentPage + 1}/{totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i : currentPage < 4 ? i : currentPage > totalPages - 4 ? totalPages - 7 + i : currentPage - 3 + i;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${currentPage === p ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600"><Trash2 className="h-5 w-5" /></AlertDialogMedia>
            <AlertDialogTitle>Xóa sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong className="text-slate-900">{deleteTarget?.name}</strong>.
              Sản phẩm sẽ bị ẩn và có thể khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" className="bg-destructive text-white hover:bg-destructive/90" onClick={() => deleteTarget && confirmDelete(deleteTarget)} disabled={deleting}>
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore dialog */}
      <AlertDialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-emerald-100 text-emerald-600"><RotateCcw className="h-5 w-5" /></AlertDialogMedia>
            <AlertDialogTitle>Khôi phục sản phẩm?</AlertDialogTitle>
            <AlertDialogDescription>
              Khôi phục <strong className="text-slate-900">{restoreTarget?.name}</strong> về trạng thái hiển thị.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => restoreTarget && confirmRestore(restoreTarget)} disabled={restoring}>
              {restoring ? 'Đang khôi phục...' : 'Khôi phục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard delete dialog */}
      <AlertDialog open={!!hardDeleteTarget} onOpenChange={(v) => !v && setHardDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600"><Trash2 className="h-5 w-5" /></AlertDialogMedia>
            <AlertDialogTitle>Xóa vĩnh viễn?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-slate-900">{hardDeleteTarget?.name}</strong> sẽ bị xóa hoàn toàn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction variant="destructive" className="bg-destructive text-white hover:bg-destructive/90" onClick={() => hardDeleteTarget && confirmHardDelete(hardDeleteTarget)} disabled={hardDeleting}>
              {hardDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
