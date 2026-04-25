'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Folder, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import type { Category } from '@/lib/api/categories';
import { ApiException } from '@/lib/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { CategoryTree } from './category-tree';
import { CategoryPanel } from './category-panel';
import { useCategories, type FilterStatus } from './use-categories';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hiển thị' },
  { value: 'inactive', label: 'Ẩn' },
  { value: 'deleted', label: 'Đã xóa' },
];

export default function DashboardCategoriesPage() {
  const [panel, setPanel] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<Category | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Category | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [hardDeleting, setHardDeleting] = useState(false);

  const {
    flatList,
    tree,
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    total,
    activeCount,
    rootCount,
    subCount,
    deletedCount,
    visibleTree,
    visibleDeleted,
    matchedIds,
    expandedIds,
    togglingId,
    toggleExpand,
    expandAll,
    collapseAll,
    handleToggleActive,
    handleDelete,
    handleMoveUp,
    handleMoveDown,
    handleChangeParent,
    handleRestore,
    handleHardDelete,
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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Danh mục</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý danh mục sản phẩm</p>
        </div>
        <Button size="sm" className="h-9 shrink-0" onClick={() => setPanel({ open: true, category: null })}>
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </Button>
      </div>

      {/* Stats summary — 1 line */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{total}</span> danh mục
        {' · '}
        <span className="font-medium text-emerald-600">{activeCount}</span> hoạt động
        {' · '}
        <span className="font-medium text-primary">{rootCount}</span> gốc
        {' · '}
        <span className="font-medium text-foreground/70">{subCount}</span> con
      </p>

      {/* Search + filters */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pr-8 pl-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            >
              <X />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Status toggle */}
          <div className="flex h-9 items-center rounded-md border bg-muted/40 p-0.5">
            <ToggleGroup
              type="single"
              value={filterStatus}
              onValueChange={(v) => v && setFilterStatus(v as FilterStatus)}
              className="gap-0"
            >
              {STATUS_FILTERS.map((f) => (
                <ToggleGroupItem
                  key={f.value}
                  value={f.value}
                  className="h-8 rounded px-3 text-sm data-[state=on]:bg-background data-[state=on]:font-medium data-[state=on]:shadow-sm"
                >
                  {f.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Expand/collapse — hidden in deleted view to avoid layout shift */}
          <Button
            variant="outline"
            size="sm"
            className={cn('h-9', filterStatus === 'deleted' && 'invisible')}
            onClick={expandAll}
          >
            Mở tất cả
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn('h-9', filterStatus === 'deleted' && 'invisible')}
            onClick={collapseAll}
          >
            Đóng tất cả
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        {loading ? (
          <div className="divide-y">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="ml-auto h-3.5 w-16" />
              </div>
            ))}
          </div>
        ) : filterStatus === 'deleted' ? (
          visibleDeleted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Trash2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">
                {search ? `Không tìm thấy "${search}"` : 'Không có danh mục nào trong thùng rác'}
              </p>
              {search && (
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setSearch('')}
                  className="mt-1 h-auto p-0 text-xs"
                >
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleDeleted.map((cat) => (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                  <Folder className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-muted-foreground line-through">
                      {cat.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground/70">{cat.slug}</p>
                  </div>
                  {cat.parentName && (
                    <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground/70">
                      {cat.parentName}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreTarget(cat)}
                      aria-label={`Khôi phục ${cat.name}`}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Khôi phục
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHardDeleteTarget(cat)}
                      aria-label={`Xóa vĩnh viễn ${cat.name}`}
                      className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Xóa vĩnh viễn
                    </Button>
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
            {search ? (
              <Button
                variant="link"
                size="sm"
                onClick={() => setSearch('')}
                className="mt-1 h-auto p-0 text-xs"
              >
                Xóa tìm kiếm
              </Button>
            ) : (
              <p className="mt-1 text-xs">Nhấn "Thêm danh mục" để bắt đầu.</p>
            )}
          </div>
        ) : (
          <div className="p-2">
            <CategoryTree
              nodes={visibleTree}
              depth={0}
              expandedIds={expandedIds}
              tree={tree}
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
        {!loading && filterStatus !== 'deleted' && search && matchedIds && (
          <div className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground/70">
            {matchedIds.size} kết quả cho &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {panel.open && (
        <CategoryPanel
          category={panel.category}
          allCategories={flatList}
          onClose={() => setPanel({ open: false, category: null })}
          onSaved={() => {
            reload();
            setPanel({ open: false, category: null });
          }}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {(deleteTarget?.children?.length ?? 0) > 0 ? (
                <>
                  Danh mục này có {deleteTarget!.children.length} danh mục con. Hãy xóa hoặc di chuyển chúng trước khi xóa danh mục cha.
                </>
              ) : (
                <>
                  Danh mục sẽ được chuyển vào thùng rác. Bạn có thể khôi phục lại sau.
                </>
              )}
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
            <AlertDialogTitle>Khôi phục "{restoreTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Danh mục sẽ hiển thị trở lại trên cửa hàng.
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
            <AlertDialogTitle>Xóa vĩnh viễn "{hardDeleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này không thể hoàn tác. Danh mục sẽ bị xóa hoàn toàn khỏi hệ thống.
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
