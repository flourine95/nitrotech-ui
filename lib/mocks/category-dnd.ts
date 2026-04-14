export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  sortOrder: number;
  active: boolean;
  description?: string;
};

export type CategoryTreeNode = CategoryItem & {
  children: CategoryTreeNode[];
};

export const mockCategories: CategoryItem[] = [
  { id: 1, name: 'Điện tử', slug: 'dien-tu', parentId: null, sortOrder: 0, active: true },
  { id: 2, name: 'Laptop', slug: 'laptop', parentId: 1, sortOrder: 0, active: true },
  { id: 3, name: 'Điện thoại', slug: 'dien-thoai', parentId: 1, sortOrder: 1, active: true },
  { id: 4, name: 'Phụ kiện', slug: 'phu-kien', parentId: 1, sortOrder: 2, active: true },

  { id: 5, name: 'Thời trang', slug: 'thoi-trang', parentId: null, sortOrder: 1, active: true },
  { id: 6, name: 'Nam', slug: 'nam', parentId: 5, sortOrder: 0, active: true },
  { id: 7, name: 'Nữ', slug: 'nu', parentId: 5, sortOrder: 1, active: true },

  { id: 8, name: 'Nhà cửa', slug: 'nha-cua', parentId: null, sortOrder: 2, active: false },
  { id: 9, name: 'Bếp', slug: 'bep', parentId: 8, sortOrder: 0, active: true },
  { id: 10, name: 'Phòng ngủ', slug: 'phong-ngu', parentId: 8, sortOrder: 1, active: true },
];

export function buildCategoryTree(items: CategoryItem[]): CategoryTreeNode[] {
  const sorted = [...items].sort((a, b) => {
    if ((a.parentId ?? -1) !== (b.parentId ?? -1)) {
      return (a.parentId ?? -1) - (b.parentId ?? -1);
    }
    return a.sortOrder - b.sortOrder;
  });

  const map = new Map<number, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  for (const item of sorted) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of sorted) {
    const node = map.get(item.id)!;
    if (item.parentId == null) {
      roots.push(node);
    } else {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  function sortChildren(nodes: CategoryTreeNode[]): CategoryTreeNode[] {
    return nodes
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((node) => ({
        ...node,
        children: sortChildren(node.children),
      }));
  }

  return sortChildren(roots);
}

export function flattenCategoryTree(nodes: CategoryTreeNode[]): CategoryItem[] {
  return nodes.flatMap((node) => [
    {
      id: node.id,
      name: node.name,
      slug: node.slug,
      parentId: node.parentId,
      sortOrder: node.sortOrder,
      active: node.active,
      description: node.description,
    },
    ...flattenCategoryTree(node.children),
  ]);
}

export function reorderSameParent(
  items: CategoryItem[],
  parentId: number | null,
  fromIndex: number,
  toIndex: number,
): CategoryItem[] {
  const siblings = items
    .filter((item) => item.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (fromIndex < 0 || toIndex < 0 || fromIndex >= siblings.length || toIndex >= siblings.length) {
    return items;
  }

  const reordered = [...siblings];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  const nextOrderMap = new Map<number, number>();
  reordered.forEach((item, index) => {
    nextOrderMap.set(item.id, index);
  });

  return items.map((item) =>
    item.parentId === parentId
      ? {
          ...item,
          sortOrder: nextOrderMap.get(item.id) ?? item.sortOrder,
        }
      : item,
  );
}
