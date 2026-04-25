'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  type Brand,
  deleteBrand,
  getBrands,
  hardDeleteBrand,
  restoreBrand,
  updateBrand,
} from '@/lib/api/brands';
import type { Page } from '@/lib/types/pagination';

export type FilterStatus = 'all' | 'active' | 'inactive' | 'deleted';

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [deletedBrands, setDeletedBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [active, deleted] = await Promise.all([getBrands(), getBrands({ deleted: true })]);
      setBrands(active.content);
      setDeletedBrands((deleted as Page<Brand>).content ?? []);
    } catch {
      toast.error('Không thể tải danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = brands.length;
  const activeCount = useMemo(() => brands.filter((b) => b.active).length, [brands]);
  const inactiveCount = total - activeCount;
  const deletedCount = deletedBrands.length;

  const visibleBrands = useMemo(() => {
    const q = search.toLowerCase();
    return brands.filter((b) => {
      const matchSearch = !q || b.name.toLowerCase().includes(q) || b.slug.includes(q);
      const matchStatus =
        filterStatus === 'all'
          ? true
          : filterStatus === 'active'
            ? b.active
            : filterStatus === 'inactive'
              ? !b.active
              : false;
      return matchSearch && matchStatus;
    });
  }, [brands, search, filterStatus]);

  const visibleDeleted = useMemo(() => {
    if (filterStatus !== 'deleted') return [];
    const q = search.toLowerCase();
    return !q
      ? deletedBrands
      : deletedBrands.filter((b) => b.name.toLowerCase().includes(q) || b.slug.includes(q));
  }, [deletedBrands, filterStatus, search]);

  const handleToggleActive = useCallback(async (brand: Brand) => {
    try {
      const updated = await updateBrand(brand.id, { active: !brand.active });
      setBrands((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      toast.success(updated.active ? `Đã hiển thị "${updated.name}"` : `Đã ẩn "${updated.name}"`);
    } catch {
      toast.error('Cập nhật thất bại');
    }
  }, []);

  const handleDelete = useCallback(
    async (brand: Brand) => {
      await deleteBrand(brand.id);
      await load();
      toast.success('Đã xóa thương hiệu');
    },
    [load],
  );

  const handleRestore = useCallback(
    async (brand: Brand) => {
      await restoreBrand(brand.id);
      await load();
      toast.success('Đã khôi phục thương hiệu');
    },
    [load],
  );

  const handleHardDelete = useCallback(async (brand: Brand) => {
    await hardDeleteBrand(brand.id);
    setDeletedBrands((prev) => prev.filter((b) => b.id !== brand.id));
    toast.success('Đã xóa vĩnh viễn');
  }, []);

  return {
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    total,
    activeCount,
    inactiveCount,
    deletedCount,
    visibleBrands,
    visibleDeleted,
    handleToggleActive,
    handleDelete,
    handleRestore,
    handleHardDelete,
    reload: load,
  };
}
