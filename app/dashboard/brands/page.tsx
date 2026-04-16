'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Pencil, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import type { Brand } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import { BrandPanel } from './brand-panel';
import { useBrands, type FilterStatus } from './use-brands';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogMedia, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function DashboardBrandsPage() {
  const [panel, setPanel] = useState<{ open: boolean; brand: Brand | null }>({ open: false, brand: null });
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Brand | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [hardDeleting, setHardDeleting] = useState(false);

  const {
    loading, search, setSearch,
    filterStatus, setFilterStatus,
    total, activeCount, inactiveCount, deletedCount,
    visibleBrands, visibleDeleted,
    handleToggleActive, handleDelete, handleRestore, handleHardDelete,
    reload,
  } = useBrands();

  async function confirmDelete(brand: Brand) {
    setDeleting(true);
    try {
      await handleDelete(brand);
    } catch (e) {
      if (!(e instanceof ApiException)) toast.error('Xóa thất bại');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function confirmRestore(brand: Brand) {
    setRestoring(true);
    try {
      await handleRestore(brand);
    } finally {
      setRestoring(false);
      setRestoreTarget(null);
    }
  }

  async function confirmHardDelete(brand: Brand) {
    setHardDeleting(true);
    try {
      await handleHardDelete(brand);
    } finally {
      setHardDeleting(false);
      setHardDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Thương hiệu</h1>
          <p className="mt-0.5 text-sm text-slate-500">Quản lý thương hiệu sản phẩm</p>
        </div>
        <button
          onClick={() => setPanel({ open: true, brand: null })}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm thương hiệu
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          { label: 'Tổng', value: total, color: 'text-slate-900' },
          { label: 'Hiển thị', value: activeCount, color: 'text-emerald-600' },
          { label: 'Ẩn', value: inactiveCount, color: 'text-slate-400' },
          { label: 'Đã xóa', value: deletedCount, color: 'text-rose-500' },
        ] as const).map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
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
            <button onClick={() => setSearch('')} aria-label="Xóa" className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {([
            { value: 'all', label: 'Tất cả', count: total },
            { value: 'active', label: 'Hiển thị', count: activeCount },
            { value: 'inactive', label: 'Ẩn', count: inactiveCount },
            { value: 'deleted', label: 'Đã xóa', count: deletedCount },
          ] as { value: FilterStatus; label: string; count: number }[]).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                filterStatus === f.value
                  ? f.value === 'deleted' ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className={`ml-1 ${filterStatus === f.value ? 'opacity-75' : 'text-slate-400'}`}>
                  ({f.count})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table / Deleted list */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        ) : filterStatus === 'deleted' ? (
          visibleDeleted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Trash2 className="mb-3 h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium">
                {search ? `Không tìm thấy "${search}"` : 'Không có thương hiệu nào đã xóa'}
              </p>
              {search && <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-blue-500 hover:underline">Xóa bộ lọc</button>}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {visibleDeleted.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs font-bold text-slate-400">
                    {b.logo && b.logo.startsWith('http')
                      ? <img src={b.logo} alt={b.name} className="h-full w-full object-contain p-1 opacity-50" />
                      : b.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-400 line-through">{b.name}</p>
                    <p className="font-mono text-[11px] text-slate-400">{b.slug}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setRestoreTarget(b)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Khôi phục
                    </button>
                    <button
                      onClick={() => setHardDeleteTarget(b)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : visibleBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Building2 className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium">
              {search ? `Không tìm thấy "${search}"` : 'Chưa có thương hiệu nào'}
            </p>
            {search && <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-blue-500 hover:underline">Xóa bộ lọc</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Thương hiệu</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Slug</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Mô tả</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Trạng thái</th>
                  <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Ngày tạo</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleBrands.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs font-bold text-slate-500">
                              {b.logo && b.logo.startsWith('http')
                                ? <img src={b.logo} alt={b.name} className="h-full w-full object-contain p-1" />
                                : b.name[0].toUpperCase()}
                            </div>
                          </TooltipTrigger>
                          {b.logo && b.logo.startsWith('http') ? (
                            <TooltipContent side="right" className="p-2">
                              <img src={b.logo} alt={b.name} className="h-40 w-40 rounded-lg object-contain" />
                              <p className="mt-1.5 text-center text-xs text-slate-500">{b.name}</p>
                            </TooltipContent>
                          ) : (
                            <TooltipContent side="right"><p>Chưa có logo</p></TooltipContent>
                          )}
                        </Tooltip>
                        <span className={`font-semibold ${b.active ? 'text-slate-900' : 'text-slate-400'}`}>{b.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-slate-500">{b.slug}</td>
                    <td className="max-w-xs truncate px-5 py-4 text-slate-500">
                      {b.description ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleToggleActive(b)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none ${b.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-flex h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${b.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>{b.active ? 'Đang hiển thị — nhấn để ẩn' : 'Đang ẩn — nhấn để hiển thị'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="px-5 py-4 text-center text-xs text-slate-400">
                      {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPanel({ open: true, brand: b })}
                          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
                          aria-label={`Sửa ${b.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(b)}
                          className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Xóa ${b.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer count */}
        {!loading && filterStatus !== 'deleted' && visibleBrands.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {search ? `${visibleBrands.length} kết quả cho "${search}"` : `${total} thương hiệu · ${activeCount} hiển thị · ${inactiveCount} ẩn`}
          </div>
        )}
        {!loading && filterStatus === 'deleted' && visibleDeleted.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {search ? `${visibleDeleted.length} kết quả cho "${search}"` : `${deletedCount} thương hiệu đã xóa`}
          </div>
        )}
      </div>

      {/* Panel */}
      {panel.open && (
        <BrandPanel
          brand={panel.brand}
          onClose={() => setPanel({ open: false, brand: null })}
          onSaved={() => { reload(); setPanel({ open: false, brand: null }); }}
        />
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa thương hiệu?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong className="text-slate-900">{deleteTarget?.name}</strong>.
              Thương hiệu sẽ bị ẩn và có thể khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore dialog */}
      <AlertDialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-emerald-100 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Khôi phục thương hiệu?</AlertDialogTitle>
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
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa vĩnh viễn?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-slate-900">{hardDeleteTarget?.name}</strong> sẽ bị xóa hoàn toàn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => hardDeleteTarget && confirmHardDelete(hardDeleteTarget)}
              disabled={hardDeleting}
            >
              {hardDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
