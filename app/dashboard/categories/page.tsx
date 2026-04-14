'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Folder, Plus, Search, Trash2, X } from 'lucide-react';
import type { Category } from '@/lib/api/categories';
import { ApiException } from '@/lib/client';
import { CategoryTree } from './category-tree';
import { CategoryPanel } from './category-panel';
import { useCategories, type FilterStatus } from './use-categories';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogMedia, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DashboardCategoriesPage() {
  const [panel, setPanel] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    flatList, loading, search, setSearch,
    filterStatus, setFilterStatus,
    total, activeCount, rootCount, subCount,
    visibleTree, matchedIds,
    expandedIds, togglingId,
    toggleExpand, expandAll, collapseAll,
    handleToggleActive, handleDelete,
    handleMoveUp, handleMoveDown, handleChangeParent,
    reload,
  } = useCategories();

  async function confirmDelete(cat: Category) {
    setDeleting(true);
    try {
      await handleDelete(cat);
    } catch (e) {
      if (!(e instanceof ApiException)) toast.error('Xóa thất bại');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh mục</h1>
          <p className="mt-0.5 text-sm text-slate-500">Quản lý cây danh mục sản phẩm</p>
        </div>
        <button
          onClick={() => setPanel({ open: true, category: null })}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          { label: 'Tổng', value: total, color: 'text-slate-900' },
          { label: 'Hoạt động', value: activeCount, color: 'text-emerald-600' },
          { label: 'Danh mục gốc', value: rootCount, color: 'text-blue-600' },
          { label: 'Danh mục con', value: subCount, color: 'text-violet-600' },
        ] as const).map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

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
            <button
              onClick={() => setSearch('')}
              aria-label="Xóa"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as FilterStatus[]).map((v) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v)}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${filterStatus === v ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              {v === 'all' ? 'Tất cả' : v === 'active' ? 'Hoạt động' : 'Đã tắt'}
            </button>
          ))}
          <button onClick={expandAll} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Mở tất cả
          </button>
          <button onClick={collapseAll} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Đóng tất cả
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : visibleTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Folder className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium">
              {search ? `Không tìm thấy "${search}"` : 'Chưa có danh mục nào'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-blue-500 hover:underline">
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <div className="p-2">
            <CategoryTree
              nodes={visibleTree}
              depth={0}
              expandedIds={expandedIds}
              allCategories={flatList}
              onToggleExpand={toggleExpand}
              onEdit={(c) => setPanel({ open: true, category: c })}
              onDelete={setDeleteTarget}
              onToggleActive={handleToggleActive}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onChangeParent={handleChangeParent}
              togglingId={togglingId}
            />
          </div>
        )}
        {!loading && visibleTree.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {search
              ? `${matchedIds?.size ?? 0} kết quả cho "${search}"`
              : `${total} danh mục · ${rootCount} gốc · ${subCount} con`}
          </div>
        )}
      </div>

      {panel.open && (
        <CategoryPanel
          category={panel.category}
          allCategories={flatList}
          onClose={() => setPanel({ open: false, category: null })}
          onSaved={() => { reload(); setPanel({ open: false, category: null }); }}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp xóa <strong className="text-slate-900">{deleteTarget?.name}</strong>.
              {(deleteTarget?.children?.length ?? 0) > 0 && (
                <> Có {deleteTarget!.children.length} danh mục con — xóa con trước.</>
              )}{' '}
              Soft delete, có thể khôi phục sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
