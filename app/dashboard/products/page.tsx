'use client';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from 'nuqs';
import {
  ChevronLeft, ChevronRight, Package,
  Pencil, Plus, RotateCcw, Search, Trash2, X,
} from 'lucide-react';
import {
  deleteProduct, getProducts, hardDeleteProduct,
  type Product, restoreProduct, updateProduct,
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
import { useDeferredValue, useState } from 'react';
import { formatPrice, PAGE_SIZE } from './utils';

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

  const deferredSearch = useDeferredValue(search);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Product | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Product | null>(null);

  const isDeleted = filterStatus === 'deleted';
  const activeFilter =
    filterStatus === 'active' ? true : filterStatus === 'inactive' ? false : undefined;

  const productsQuery = useQuery({
    queryKey: [
      'products',
      deferredSearch,
      filterStatus,
      filterCategoryId,
      filterBrandId,
      currentPage,
    ],
    queryFn: () =>
      getProducts({
        search: deferredSearch || undefined,
        active: isDeleted ? undefined : activeFilter,
        deleted: isDeleted ? true : undefined,
        categoryId: filterCategoryId ?? undefined,
        brandId: filterBrandId ?? undefined,
        page: currentPage,
        size: PAGE_SIZE,
        sort: 'createdAt,desc',
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
        ['products', deferredSearch, filterStatus, filterCategoryId, filterBrandId, currentPage],
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

  const products = productsQuery.data?.content ?? [];
  const totalPages = productsQuery.data?.totalPages ?? 0;
  const totalElements = productsQuery.data?.totalElements ?? 0;
  const loading = productsQuery.isLoading;
  const categories = categoriesQuery.data ?? [];
  const brands = brandsQuery.data ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sản phẩm</h1>
          <p className="mt-0.5 text-sm text-slate-500">Quản lý danh sách sản phẩm</p>
        </div>
        <Button asChild size="lg" className="rounded-xl">
          <Link href="/dashboard/products/new">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm tên, slug..."
            value={search}
            onChange={(e) => {
              void setSearch(e.target.value || null);
              void setCurrentPage(0);
            }}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => { void setSearch(null); void setCurrentPage(0); }}
              className="absolute top-1/2 right-2 -translate-y-1/2"
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
              onClick={() => { void setFilterStatus(f.value); void setCurrentPage(0); }}
              className={`rounded-xl text-xs ${filterStatus === f.value && f.value === 'deleted' ? 'border-rose-600 bg-rose-600 hover:bg-rose-700' : ''}`}
            >
              {f.label}
            </Button>
          ))}
          <Select
            value={filterCategoryId ? String(filterCategoryId) : 'all'}
            onValueChange={(v) => {
              void setFilterCategoryId(v === 'all' ? null : Number(v));
              void setCurrentPage(0);
            }}
          >
            <SelectTrigger className="h-9 rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-600">
              <SelectValue placeholder="Tất cả danh mục" />
            </SelectTrigger>
            <SelectContent>
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
            onValueChange={(v) => {
              void setFilterBrandId(v === 'all' ? null : Number(v));
              void setCurrentPage(0);
            }}
          >
            <SelectTrigger className="h-9 rounded-xl border-slate-200 bg-white text-xs font-medium text-slate-600">
              <SelectValue placeholder="Tất cả thương hiệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thương hiệu</SelectItem>
              {brands.map((b) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Package className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium">
              {search
                ? `Không tìm thấy "${search}"`
                : isDeleted
                  ? 'Không có sản phẩm nào đã xóa'
                  : 'Chưa có sản phẩm nào'}
            </p>
            {search && (
              <Button variant="link" size="sm" onClick={() => void setSearch(null)} className="mt-1 h-auto p-0 text-xs">
                Xóa bộ lọc
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Sản phẩm
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Danh mục / Thương hiệu
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Giá
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Variants
                  </th>
                  {!isDeleted && (
                    <th className="px-5 py-3.5 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      Trạng thái
                    </th>
                  )}
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
                              {p.thumbnail && p.thumbnail.startsWith('http') ? (
                                <Image src={p.thumbnail} alt={p.name} width={40} height={40} className="h-full w-full object-cover" />
                              ) : (
                                <Package className="h-5 w-5 text-slate-300" />
                              )}
                            </div>
                          </TooltipTrigger>
                          {p.thumbnail && p.thumbnail.startsWith('http') && (
                            <TooltipContent side="right" className="p-2">
                              <Image src={p.thumbnail} alt={p.name} width={160} height={160} className="rounded-lg object-contain" />
                            </TooltipContent>
                          )}
                        </Tooltip>
                        <div>
                          <p
                            className={`font-semibold ${p.active ? 'text-slate-900' : 'text-slate-400'}`}
                          >
                            {p.name}
                          </p>
                          <p className="font-mono text-[11px] text-slate-400">{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        {p.categoryName && (
                          <p className="text-xs text-slate-600">{p.categoryName}</p>
                        )}
                        {p.brandName && <p className="text-xs text-slate-400">{p.brandName}</p>}
                        {!p.categoryName && !p.brandName && (
                          <span className="text-slate-300">—</span>
                        )}
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
                            <span>
                              <Switch
                                checked={p.active}
                                onCheckedChange={() => toggleActiveMutation.mutate(p)}
                                disabled={toggleActiveMutation.isPending}
                                aria-label={p.active ? 'Đang hiển thị — nhấn để ẩn' : 'Đang ẩn — nhấn để hiển thị'}
                              />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>
                              {p.active
                                ? 'Đang hiển thị — nhấn để ẩn'
                                : 'Đang ẩn — nhấn để hiển thị'}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    )}
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {isDeleted ? (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setRestoreTarget(p)} className="rounded-lg text-xs hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700">
                              <RotateCcw className="h-3.5 w-3.5" /> Khôi phục
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setHardDeleteTarget(p)} className="rounded-lg text-xs hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700">
                              <Trash2 className="h-3.5 w-3.5" /> Xóa vĩnh viễn
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon-sm" asChild className="rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600">
                              <Link href={`/dashboard/products/${p.id}/edit`} aria-label={`Sửa ${p.name}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(p)} className="rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Xóa ${p.name}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
        {!loading && totalElements > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5">
            <p className="text-xs text-slate-400">
              {totalElements} sản phẩm · trang {currentPage + 1}/{totalPages}
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon-sm" onClick={() => void setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className="rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const p = totalPages <= 7 ? i : currentPage < 4 ? i : currentPage > totalPages - 4 ? totalPages - 7 + i : currentPage - 3 + i;
                return (
                  <Button key={p} variant={currentPage === p ? 'default' : 'outline'} size="icon-sm" onClick={() => void setCurrentPage(p)} className="rounded-lg text-xs">
                    {p + 1}
                  </Button>
                );
              })}
              <Button variant="outline" size="icon-sm" onClick={() => void setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage >= totalPages - 1} className="rounded-lg">
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
    </div>
  );
}
