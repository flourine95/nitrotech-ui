'use client';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState, parseAsInteger, parseAsString } from 'nuqs';
import type { SortRule } from '@/components/data-table-toolbar';
import { ApiException } from '@/lib/client';
import {
  type Brand,
  type BrandsQuery,
  deleteBrand,
  getBrands,
  hardDeleteBrand,
  restoreBrand,
  updateBrand,
} from '@/lib/api/brands';

export type FilterStatus = 'all' | 'active' | 'inactive' | 'deleted';

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function useBrands() {
  const qc = useQueryClient();

  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''));
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault('all'));
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(0));
  const [size, setSize] = useQueryState('size', parseAsInteger.withDefault(10));
  const [sortParam, setSortParam] = useQueryState('sort', parseAsString.withDefault(''));

  const filterStatus = status as FilterStatus;

  // sortParam format: "field1,dir1|field2,dir2"
  const sortRules: SortRule[] = sortParam
    ? sortParam.split('|').map((s) => {
        const [field, direction] = s.split(',');
        return { field, direction: (direction ?? 'desc') as 'asc' | 'desc' };
      })
    : [];

  function buildQuery(): BrandsQuery {
    const q: BrandsQuery = { page, size };
    if (search.trim()) q.search = search.trim();
    if (filterStatus === 'active') { q.active = true; q.deleted = false; }
    else if (filterStatus === 'inactive') { q.active = false; q.deleted = false; }
    else if (filterStatus === 'deleted') { q.deleted = true; }
    else { q.deleted = false; } // 'all' — vẫn ẩn deleted
    if (sortRules.length > 0) q.sort = sortRules.map((r) => `${r.field},${r.direction}`);
    return q;
  }

  const queryKey = ['brands', search, filterStatus, page, size, sortParam];

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey,
    queryFn: () => getBrands(buildQuery()),
    placeholderData: (prev) => prev,
  });

  const invalidate = useCallback(() => qc.invalidateQueries({ queryKey: ['brands'] }), [qc]);

  const handleToggleActive = useCallback(
    async (brand: Brand) => {
      try {
        await updateBrand(brand.id, { active: !brand.active });
        toast.success(brand.active ? `Đã ẩn "${brand.name}"` : `Đã hiển thị "${brand.name}"`);
        invalidate();
      } catch (e) {
        if (e instanceof ApiException) {
          toast.error(e.error.message);
        } else {
          toast.error('Cập nhật thất bại');
        }
      }
    },
    [invalidate],
  );

  const handleDelete = useCallback(
    async (brand: Brand) => {
      await deleteBrand(brand.id);
      toast.success('Đã xóa thương hiệu');
      invalidate();
    },
    [invalidate],
  );

  const handleRestore = useCallback(
    async (brand: Brand) => {
      await restoreBrand(brand.id);
      toast.success('Đã khôi phục thương hiệu');
      invalidate();
    },
    [invalidate],
  );

  const handleHardDelete = useCallback(
    async (brand: Brand) => {
      await hardDeleteBrand(brand.id);
      toast.success('Đã xóa vĩnh viễn');
      invalidate();
    },
    [invalidate],
  );

  function resetFilters() {
    setSearch('');
    setStatus('all');
    setPage(0);
    setSortParam('');
  }

  return {
    // data
    brands: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    // state
    isLoading,
    isFetching,
    isError,
    search,
    setSearch: (v: string) => { setSearch(v); setPage(0); },
    filterStatus,
    setFilterStatus: (v: FilterStatus) => { setStatus(v); setPage(0); },
    page,
    setPage,
    size,
    setSize: (v: number) => { setSize(v); setPage(0); },
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    sortRules,
    setSortRules: (rules: SortRule[]) => {
      setSortParam(rules.length ? rules.map((r) => `${r.field},${r.direction}`).join('|') : '');
    },
    // actions
    handleToggleActive,
    handleDelete,
    handleRestore,
    handleHardDelete,
    resetFilters,
    reload: invalidate,
  };
}
