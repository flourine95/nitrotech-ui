import type { Category } from '@/lib/api/public/categories';

export interface TreeNode extends Category {
  children: TreeNode[];
}

export function flattenTree(nodes: TreeNode[]): Category[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}
