'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  type Category,
  deleteCategory,
  getCategories,
  hardDeleteCategory,
  moveCategories,
  restoreCategory,
  updateCategory,
} from '@/lib/api/categories';
import { ApiException } from '@/lib/client';
import { flattenTree, type TreeNode } from '@/lib/types/categories';
import type { Page } from '@/lib/types/pagination';

type FilterStatus = 'all' | 'active' | 'inactive' | 'deleted';

function buildTree(flat: Category[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];
  const sorted = [...flat].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const c of sorted) map.set(c.id, { ...c, children: [] });
  for (const c of sorted) {
    const node = map.get(c.id)!;
    if (c.parentId == null) roots.push(node);
    else map.get(c.parentId)?.children.push(node);
  }
  return roots;
}

export function useCategories() {
  const [flatList, setFlatList] = useState<Category[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [deletedList, setDeletedList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const expandedBeforeSearch = useRef<Set<number>>(new Set());
  const prevSearch = useRef('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [active, deleted] = await Promise.all([
        getCategories({ tree: true }) as Promise<TreeNode[]>,
        getCategories({ deleted: true }) as Promise<Page<Category>>,
      ]);
      setTree(active);
      setFlatList(flattenTree(active));
      setDeletedList(
        Array.isArray(deleted) ? deleted : ((deleted as Page<Category>).content ?? []),
      );
    } catch {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!prevSearch.current && search) expandedBeforeSearch.current = new Set(expandedIds);
    else if (prevSearch.current && !search) setExpandedIds(expandedBeforeSearch.current);
    prevSearch.current = search;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const total = flatList.length;
  const activeCount = useMemo(() => flatList.filter((c) => c.active).length, [flatList]);
  const rootCount = useMemo(() => flatList.filter((c) => !c.parentId).length, [flatList]);
  const subCount = useMemo(() => flatList.filter((c) => !!c.parentId).length, [flatList]);
  const deletedCount = deletedList.length;

  const matchedIds = useMemo(() => {
    if (!search) return null;
    const q = search.toLowerCase();
    const sourceList = filterStatus === 'deleted' ? deletedList : flatList;
    return new Set(
      sourceList
        .filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q))
        .map((c) => c.id),
    );
  }, [flatList, deletedList, filterStatus, search]);

  const visibleTree = useMemo(() => {
    if (filterStatus === 'deleted') return [];
    function filter(nodes: TreeNode[]): TreeNode[] {
      if (!matchedIds) return nodes;
      return nodes.reduce<TreeNode[]>((acc, node) => {
        const children = filter(node.children);
        if (matchedIds.has(node.id) || children.length > 0) acc.push({ ...node, children });
        return acc;
      }, []);
    }
    return filter(tree).filter((n) =>
      filterStatus === 'all' ? true : filterStatus === 'active' ? n.active : !n.active,
    );
  }, [tree, matchedIds, filterStatus]);

  const visibleDeleted = useMemo(() => {
    if (filterStatus !== 'deleted') return [];
    if (!search) return deletedList;
    const q = search.toLowerCase();
    return deletedList.filter((c) => c.name.toLowerCase().includes(q) || c.slug.includes(q));
  }, [deletedList, filterStatus, search]);

  const activeExpandedIds = useMemo(
    () => (search ? new Set(flatList.map((c) => c.id)) : expandedIds),
    [search, flatList, expandedIds],
  );

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    // Expand all nodes that have children
    const withChildren = new Set<number>();
    function collect(nodes: TreeNode[]) {
      for (const n of nodes) {
        if (n.children.length > 0) {
          withChildren.add(n.id);
          collect(n.children);
        }
      }
    }
    collect(tree);
    setExpandedIds(withChildren);
  }, [tree]);

  const collapseAll = useCallback(() => setExpandedIds(new Set()), []);

  const handleToggleActive = useCallback(async (cat: Category) => {
    setTogglingId(cat.id);
    try {
      const updated = await updateCategory(cat.id, { active: !cat.active });
      function patch(nodes: TreeNode[]): TreeNode[] {
        return nodes.map((n) =>
          n.id === updated.id
            ? { ...n, active: updated.active }
            : { ...n, children: patch(n.children) },
        );
      }
      setTree((prev) => patch(prev));
      setFlatList((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, active: updated.active } : c)),
      );
      toast.success(updated.active ? `Đã hiển thị "${updated.name}"` : `Đã ẩn "${updated.name}"`);
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setTogglingId(null);
    }
  }, []);

  const handleDelete = useCallback(
    async (cat: Category) => {
      try {
        await deleteCategory(cat.id);
        await load();
        toast.success('Đã xóa danh mục');
      } catch (e) {
        if (e instanceof ApiException && e.error.code === 'CATEGORY_HAS_CHILDREN')
          toast.error('Xóa thất bại — hãy xóa các danh mục con trước');
        else toast.error(e instanceof ApiException ? e.error.message : 'Xóa thất bại');
        throw e;
      }
    },
    [load],
  );

  const applyReorder = useCallback(
    (parentId: number | null, reordered: Category[]) => {
      const orderMap = new Map(reordered.map((c, i) => [c.id, i]));
      const next = flatList.map((c) =>
        c.parentId === parentId && orderMap.has(c.id)
          ? { ...c, sortOrder: orderMap.get(c.id)! }
          : c,
      );
      setFlatList(next);
      setTree(buildTree(next));
    },
    [flatList],
  );

  const applyChangeParent = useCallback(
    (id: number, from: number | null, to: number | null) => {
      const next = flatList.map((c) => (c.id === id ? { ...c, parentId: to } : c));
      const nextMap = new Map(next.map((c) => [c.id, c]));
      const reindex = (pid: number | null) => {
        next
          .filter((c) => c.parentId === pid)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .forEach((c, i) => {
            const item = nextMap.get(c.id);
            if (item) item.sortOrder = i;
          });
      };
      reindex(from);
      reindex(to);
      setFlatList([...next]);
      setTree(buildTree(next));
    },
    [flatList],
  );

  const handleMoveUp = useCallback(
    async (id: number, parentId: number | null) => {
      const siblings = flatList
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = siblings.findIndex((c) => c.id === id);
      if (idx <= 0) return;
      const reordered = [...siblings];
      [reordered[idx - 1], reordered[idx]] = [reordered[idx], reordered[idx - 1]];
      const snapshot = { flatList, tree };
      applyReorder(parentId, reordered);
      try {
        await moveCategories({
          movedId: id,
          fromParentId: parentId,
          toParentId: parentId,
          targetOrderedIds: reordered.map((c) => c.id),
        });
        toast.success('Đã sắp xếp lại');
      } catch {
        setFlatList(snapshot.flatList);
        setTree(snapshot.tree);
        toast.error('Sắp xếp thất bại — thử lại sau');
      }
    },
    [flatList, tree, applyReorder],
  );

  const handleMoveDown = useCallback(
    async (id: number, parentId: number | null) => {
      const siblings = flatList
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const idx = siblings.findIndex((c) => c.id === id);
      if (idx < 0 || idx >= siblings.length - 1) return;
      const reordered = [...siblings];
      [reordered[idx], reordered[idx + 1]] = [reordered[idx + 1], reordered[idx]];
      const snapshot = { flatList, tree };
      applyReorder(parentId, reordered);
      try {
        await moveCategories({
          movedId: id,
          fromParentId: parentId,
          toParentId: parentId,
          targetOrderedIds: reordered.map((c) => c.id),
        });
        toast.success('Đã sắp xếp lại');
      } catch {
        setFlatList(snapshot.flatList);
        setTree(snapshot.tree);
        toast.error('Sắp xếp thất bại — thử lại sau');
      }
    },
    [flatList, tree, applyReorder],
  );

  const handleChangeParent = useCallback(
    async (id: number, newParentId: number | null) => {
      const node = flatList.find((c) => c.id === id);
      if (!node || node.parentId === newParentId) return;
      const fromParentId = node.parentId;
      const snapshot = { flatList, tree };
      applyChangeParent(id, fromParentId, newParentId);
      const destSiblings = [
        ...flatList
          .filter((c) => c.parentId === newParentId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((c) => c.id),
        id,
      ];
      try {
        await moveCategories({
          movedId: id,
          fromParentId,
          toParentId: newParentId,
          targetOrderedIds: destSiblings,
          sourceOrderedIds: flatList
            .filter((c) => c.parentId === fromParentId && c.id !== id)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c) => c.id),
        });
        toast.success('Đã đổi danh mục cha');
      } catch {
        setFlatList(snapshot.flatList);
        setTree(snapshot.tree);
        toast.error('Không thể di chuyển danh mục — thử lại sau');
      }
    },
    [flatList, tree, applyChangeParent],
  );

  const handleRestore = useCallback(
    async (cat: Category) => {
      try {
        await restoreCategory(cat.id);
        await load();
        toast.success('Đã khôi phục danh mục');
      } catch {
        toast.error('Khôi phục thất bại');
      }
    },
    [load],
  );

  const handleHardDelete = useCallback(async (cat: Category) => {
    try {
      await hardDeleteCategory(cat.id);
      setDeletedList((prev) => prev.filter((c) => c.id !== cat.id));
      toast.success('Đã xóa vĩnh viễn');
    } catch {
      toast.error('Xóa vĩnh viễn thất bại');
    }
  }, []);

  return {
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
    expandedIds: activeExpandedIds,
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
    reload: load,
  };
}

export type { FilterStatus };
