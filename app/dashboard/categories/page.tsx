'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Folder, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
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
  const [restoreTarget, setRestoreTarget] = useState<Category | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Category | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [hardDeleting, setHardDeleting] = useState(false);

  const {
    flatList, loading, search, setSearch,
    filterStatus, setFilterStatus,
    total, activeCount, rootCount, subCount, deletedCount,
    visibleTree, visibleDeleted, matchedIds,
    expandedIds, togglingId,
    toggleExpand, expandAll, collapseAll,
    handleToggleActive, handleDelete,
    handleMoveUp, handleMoveDown, handleChangeParent,
    handleRestore, handleHardDelete,
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

  async function confirmRestore(cat: Category) {
    setRestoring(true);
    try {
      await handleRestore(cat);
    } finally {
      setRestoring(false);
      setRestoreTarget(null);
    }
  }

  async function confirmHardDelete(cat: Category) {
    setHardDeleting(true);
    try {
      await handleHardDelete(cat);
    } finally {
      setHardDeleting(false);
      setHardDeleteTarget(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Danh mục</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Quản lý cây danh mục sản phẩm</p>
        </div>
        <button
          onClick={() => setPanel({ open: true, category: null })}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          { label: 'Tổng', value: total, color: 'text-foreground' },
          { label: 'Hoạt động', value: activeCount, color: 'text-emerald-600' },
          { label: 'Danh mục gốc', value: rootCount, color: 'text-primary' },
          { label: 'Danh mục con', value: subCount, color: 'text-violet-600' },
        ] as const).map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <input
            type="text"
            placeholder="Tìm tên, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-card py-2.5 pr-4 pl-9 text-sm text-foreground/80 outline-none placeholder:text-muted-foreground/70 focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Xóa"
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-muted-foreground/70 hover:text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {([
            { value: 'all', label: 'Tất cả', count: total },
            { value: 'active', label: 'Hoạt động', count: activeCount },
            { value: 'inactive', label: 'Ẩn', count: total - activeCount },
            { value: 'deleted', label: 'Đã xóa', count: deletedCount },
          ] as { value: FilterStatus; label: string; count: number }[]).map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                filterStatus === f.value
                  ? f.value === 'deleted'
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-slate-900 bg-slate-900 text-white'
                  : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {f.label}{f.count > 0 && <span className={`ml-1 ${filterStatus === f.value ? 'opacity-75' : 'text-muted-foreground/70'}`}>({f.count})</span>}
            </button>
          ))}
          {filterStatus !== 'deleted' && (
            <>
              <button onClick={expandAll} className="cursor-pointer rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50">
                Mở tất cả
              </button>
              <button onClick={collapseAll} className="cursor-pointer rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50">
                Đóng tất cả
              </button>
            </>
          )}
          {filterStatus === 'deleted' && (
            <>
              <button disabled className="invisible rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                Mở tất cả
              </button>
              <button disabled className="invisible rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground">
                Đóng tất cả
              </button>
            </>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filterStatus === 'deleted' ? (
          visibleDeleted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Trash2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">
                {search ? `Không tìm thấy "${search}"` : 'Không có danh mục nào đã xóa'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-primary hover:underline">
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleDeleted.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                  <Folder className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-muted-foreground line-through">{cat.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground/70">{cat.slug}</p>
                  </div>
                  {cat.parentName && (
                    <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground/70">
                      {cat.parentName}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setRestoreTarget(cat)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Khôi phục
                    </button>
                    <button
                      onClick={() => setHardDeleteTarget(cat)}
                      className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa vĩnh viễn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : visibleTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Folder className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">
              {search ? `Không tìm thấy "${search}"` : 'Chưa có danh mục nào'}
            </p>
            {search && (
              <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-primary hover:underline">
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
        {!loading && filterStatus !== 'deleted' && visibleTree.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground/70">
            {search
              ? `${matchedIds?.size ?? 0} kết quả cho "${search}"`
              : `${total} danh mục · ${rootCount} gốc · ${subCount} con`}
          </div>
        )}
        {!loading && filterStatus === 'deleted' && visibleDeleted.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground/70">
            {search ? `${visibleDeleted.length} kết quả cho "${search}"` : `${deletedCount} danh mục đã xóa`}
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
              Bạn sắp xóa <strong className="text-foreground">{deleteTarget?.name}</strong>.
              {(deleteTarget?.children?.length ?? 0) > 0 && (
                <> Danh mục này còn {deleteTarget!.children.length} danh mục con, hãy xóa chúng trước.</>
              )}{' '}
              Danh mục sẽ bị ẩn và có thể khôi phục lại sau.
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

      <AlertDialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-emerald-100 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Khôi phục danh mục?</AlertDialogTitle>
            <AlertDialogDescription>
              Khôi phục <strong className="text-foreground">{restoreTarget?.name}</strong> về trạng thái hoạt động.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreTarget && confirmRestore(restoreTarget)}
              disabled={restoring}
            >
              {restoring ? 'Đang khôi phục...' : 'Khôi phục'}
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
              <strong className="text-foreground">{hardDeleteTarget?.name}</strong> sẽ bị xóa hoàn toàn và không thể khôi phục.
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
