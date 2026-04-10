'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { Plus, Search, X, Folder } from 'lucide-react';
import { getCategories, updateCategory, deleteCategory, moveCategories, type Category } from '@/lib/api/categories';
import { ApiException } from '@/lib/client';
import { type TreeNode, flattenTree } from '@/lib/types/categories';
import { CategoryTree } from './category-tree';
import { CategoryPanel } from './category-panel';
import { DeleteDialog } from './delete-dialog';

type FilterStatus = 'all' | 'active' | 'inactive';

export default function DashboardCategoriesPage() {
  const [flatList, setFlatList] = useState<Category[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [panel, setPanel] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const expandedBeforeSearch = useRef<Set<number>>(new Set());
  const prevSearch = useRef('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const treeData = await getCategories({ tree: true }) as TreeNode[];
      setTree(treeData);
      setFlatList(flattenTree(treeData));
    } catch {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Stats
  const total = flatList.length;
  const activeCount = flatList.filter((c) => c.active).length;
  const rootCount = flatList.filter((c) => !c.parentId).length;
  const subCount = flatList.filter((c) => !!c.parentId).length;

  // Search + filter
  const searchLower = search.toLowerCase();
  const matchedIds = search
    ? new Set(flatList.filter((c) => c.name.toLowerCase().includes(searchLower) || c.slug.includes(searchLower)).map((c) => c.id))
    : null;

  function filterTree(nodes: TreeNode[]): TreeNode[] {
    if (!matchedIds) return nodes;
    return nodes.reduce<TreeNode[]>((acc, node) => {
      const fc = filterTree(node.children);
      if (matchedIds.has(node.id) || fc.length > 0) acc.push({ ...node, children: fc });
      return acc;
    }, []);
  }

  const visibleTree = filterTree(tree).filter((n) =>
    filterStatus === 'all' ? true : filterStatus === 'active' ? n.active : !n.active
  );

  // Save/restore expanded state when searching
  useEffect(() => {
    if (!prevSearch.current && search) expandedBeforeSearch.current = new Set(expandedIds);
    else if (prevSearch.current && !search) setExpandedIds(expandedBeforeSearch.current);
    prevSearch.current = search;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function toggleExpand(id: number) {
    setExpandedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function expandAll() {
    setExpandedIds(new Set(flatList.filter((c) => c.parentId !== null).map((c) => c.parentId as number)));
  }
  function collapseAll() { setExpandedIds(new Set()); }

  async function handleToggleActive(cat: Category) {
    setTogglingId(cat.id);
    try {
      const updated = await updateCategory(cat.id, { active: !cat.active });
      function patch(nodes: TreeNode[]): TreeNode[] {
        return nodes.map((n) => n.id === updated.id ? { ...n, ...updated } : { ...n, children: patch(n.children) });
      }
      setTree((prev) => patch(prev));
      setFlatList((prev) => prev.map((c) => c.id === updated.id ? updated : c));
      toast.success(updated.active ? 'Đã kích hoạt' : 'Đã tắt');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(cat: Category) {
    setDeleting(true);
    try {
      await deleteCategory(cat.id);
      await load();
      toast.success('Đã xóa danh mục');
    } catch (e) {
      if (e instanceof ApiException && e.error.code === 'CATEGORY_HAS_CHILDREN')
        toast.error('Không thể xóa — còn danh mục con đang hoạt động');
      else toast.error(e instanceof ApiException ? e.error.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  // DnD — useSortable + isSortable pattern (docs: Managing sortable state)
  // OptimisticSortingPlugin handles visual reorder; read source.initialIndex/index/group in onDragEnd
  const handleDragEnd = useCallback((event: { operation: { source: unknown }; canceled: boolean }) => {
    if (event.canceled) { load(); return; }

    const { source } = event.operation;
    if (!isSortable(source as never)) return;

    const s = source as { id: number; index: number; initialIndex: number; group: string; initialGroup: string };
    const { id: movedId, index, initialIndex, group, initialGroup } = s;
    if (group === initialGroup && index === initialIndex) return;

    const parseParent = (g: string): number | null => {
      const v = g.replace('g-', '');
      return v === 'root' ? null : Number(v);
    };
    const fromParentId = parseParent(initialGroup);
    const toParentId = parseParent(group);

    const destSiblings = flatList
      .filter((c) => c.parentId === toParentId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => c.id);

    const withoutMoved = destSiblings.filter((id) => id !== movedId);
    withoutMoved.splice(index, 0, movedId);

    const payload: Parameters<typeof moveCategories>[0] = {
      movedId, fromParentId, toParentId,
      targetOrderedIds: withoutMoved,
    };
    if (fromParentId !== toParentId) {
      payload.sourceOrderedIds = flatList
        .filter((c) => c.parentId === fromParentId && c.id !== movedId)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.id);
    }

    moveCategories(payload).then(() => load()).catch(() => {
      toast.error('Sắp xếp thất bại');
      load();
    });
  }, [flatList, load]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh mục</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kéo handle để sắp xếp · Click mũi tên để mở rộng</p>
        </div>
        <button onClick={() => setPanel({ open: true, category: null })}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          <Plus className="h-4 w-4" />Thêm danh mục
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng', value: total, color: 'text-slate-900' },
          { label: 'Hoạt động', value: activeCount, color: 'text-emerald-600' },
          { label: 'Danh mục gốc', value: rootCount, color: 'text-blue-600' },
          { label: 'Danh mục con', value: subCount, color: 'text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"><Search className="h-4 w-4" /></span>
          <input type="text" placeholder="Tìm tên, slug..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as FilterStatus[]).map((v) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${filterStatus === v ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
              {v === 'all' ? 'Tất cả' : v === 'active' ? 'Hoạt động' : 'Đã tắt'}
            </button>
          ))}
          <button onClick={expandAll} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">Mở tất cả</button>
          <button onClick={collapseAll} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">Đóng tất cả</button>
        </div>
      </div>

      {/* Tree */}
      <DragDropProvider onDragEnd={handleDragEnd as never}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
            </div>
          ) : visibleTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Folder className="mb-3 h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium">{search ? `Không tìm thấy "${search}"` : 'Chưa có danh mục nào'}</p>
              {search && <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-blue-500 hover:underline">Xóa bộ lọc</button>}
            </div>
          ) : (
            <div className="p-2">
              <CategoryTree
                nodes={visibleTree} depth={0}
                expandedIds={search ? new Set(flatList.map((c) => c.id)) : expandedIds}
                onToggleExpand={toggleExpand}
                onEdit={(c) => setPanel({ open: true, category: c })}
                onDelete={setDeleteTarget}
                onToggleActive={handleToggleActive}
                togglingId={togglingId}
              />
            </div>
          )}
          {!loading && visibleTree.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
              {search ? `${matchedIds?.size ?? 0} kết quả cho "${search}"` : `${total} danh mục · ${rootCount} gốc · ${subCount} con`}
            </div>
          )}
        </div>
      </DragDropProvider>

      {panel.open && (
        <CategoryPanel
          category={panel.category}
          allCategories={flatList}
          onClose={() => setPanel({ open: false, category: null })}
          onSaved={() => { load(); setPanel({ open: false, category: null }); }}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          category={deleteTarget}
          loading={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
        />
      )}
    </div>
  );
}
