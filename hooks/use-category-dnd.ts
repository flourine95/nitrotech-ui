'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  buildCategoryTree,
  mockCategories,
  reorderSameParent,
  type CategoryItem,
} from '@/lib/mocks/category-dnd';
import { isSortable } from '@dnd-kit/react/sortable';

type FilterStatus = 'all' | 'active' | 'inactive';

function parseGroup(group: string | number | undefined): number | null {
  if (group == null) return null;
  const raw = String(group).replace('g-', '');
  return raw === 'root' ? null : Number(raw);
}

export function useCategoryDnd() {
  const [items, setItems] = useState<CategoryItem[]>(mockCategories);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([1, 5, 8]));
  const [dragMessage, setDragMessage] = useState<string | null>(null);

  const tree = useMemo(() => buildCategoryTree(items), [items]);

  const total = items.length;
  const activeCount = useMemo(() => items.filter((i) => i.active).length, [items]);
  const rootCount = useMemo(() => items.filter((i) => i.parentId == null).length, [items]);
  const subCount = useMemo(() => items.filter((i) => i.parentId != null).length, [items]);

  const matchedIds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return new Set(
      items
        .filter(
          (item) => item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q),
        )
        .map((item) => item.id),
    );
  }, [items, search]);

  const visibleTree = useMemo(() => {
    function filterTree(
      nodes: ReturnType<typeof buildCategoryTree>,
    ): ReturnType<typeof buildCategoryTree> {
      if (!matchedIds) return nodes;

      return nodes.reduce<typeof nodes>((acc, node) => {
        const children = filterTree(node.children);
        if (matchedIds.has(node.id) || children.length > 0) {
          acc.push({ ...node, children });
        }
        return acc;
      }, []);
    }

    return filterTree(tree).filter((node) =>
      filterStatus === 'all' ? true : filterStatus === 'active' ? node.active : !node.active,
    );
  }, [tree, matchedIds, filterStatus]);

  const activeExpandedIds = useMemo(() => {
    if (!search.trim()) return expandedIds;
    return new Set(items.map((i) => i.id));
  }, [search, expandedIds, items]);

  const toggleExpand = useCallback((id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const parentIds = new Set(
      items.filter((item) => item.parentId != null).map((item) => item.parentId as number),
    );
    setExpandedIds(parentIds);
  }, [items]);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const toggleActive = useCallback((id: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item)),
    );
  }, []);

  const handleDragEnd = useCallback(
    (event: { operation: { source: unknown }; canceled: boolean }) => {
      setDragMessage(null);

      if (event.canceled) return;

      const { source } = event.operation;
      if (!isSortable(source as never)) return;

      const sortable = source as {
        id: string | number;
        index: number;
        initialIndex: number;
        group?: string | number;
        initialGroup?: string | number;
      };

      const { index, initialIndex, group, initialGroup } = sortable;
      if (group == null || initialGroup == null) return;

      if (group !== initialGroup) {
        setDragMessage('Bản local hiện chỉ hỗ trợ kéo thả trong cùng danh mục cha');
        return;
      }

      if (index === initialIndex) return;

      const parentId = parseGroup(group);

      setItems((prev) => reorderSameParent(prev, parentId, initialIndex, index));
      setDragMessage('Đã sắp xếp cục bộ thành công');
    },
    [],
  );

  return {
    items,
    tree,
    visibleTree,
    total,
    activeCount,
    rootCount,
    subCount,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    expandedIds: activeExpandedIds,
    toggleExpand,
    expandAll,
    collapseAll,
    toggleActive,
    handleDragEnd,
    dragMessage,
  };
}
