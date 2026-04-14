'use client';

import { memo, useRef, useState } from 'react';
import { useSortable } from '@dnd-kit/react/sortable';
import { Folder, FolderOpen, ChevronRight, GripVertical } from 'lucide-react';
import type { CategoryItem, CategoryTreeNode } from '@/lib/mocks/category-dnd';

interface TreeNodeContentProps {
  node: CategoryTreeNode;
  depth: number;
  expanded: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  handleRef: React.Ref<HTMLButtonElement>;
  onToggleExpand: () => void;
  onToggleActive: () => void;
}

const TreeNodeContent = memo(function TreeNodeContent({
  node,
  depth,
  expanded,
  isDragging,
  isDropTarget,
  handleRef,
  onToggleExpand,
  onToggleActive,
}: TreeNodeContentProps) {
  const hasChildren = node.children.length > 0;

  return (
    <div
      className={`rounded-xl transition-colors duration-100 ${
        isDropTarget ? 'bg-blue-50 ring-2 ring-blue-300' : ''
      } ${isDragging ? 'opacity-30' : ''}`}
    >
      <div
        className="group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        <button
          ref={handleRef}
          type="button"
          tabIndex={-1}
          aria-label="Kéo để sắp xếp"
          className="cursor-grab touch-none text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={onToggleExpand}
          aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-700 ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        </button>

        <span className={`shrink-0 ${depth === 0 ? 'text-blue-500' : 'text-slate-400'}`}>
          {expanded && hasChildren ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={`truncate text-sm font-medium ${node.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}
            >
              {node.name}
            </span>
            {hasChildren && (
              <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                {node.children.length}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-slate-400">/{node.slug}</p>
        </div>

        <button
          onClick={onToggleActive}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
            node.active ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        >
          <span
            className={`inline-flex h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
              node.active ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
});

function TreeNodeRow({
  node,
  index,
  depth,
  expanded,
  onToggleExpand,
  onToggleActive,
}: {
  node: CategoryTreeNode;
  index: number;
  depth: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onToggleActive: () => void;
}) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);

  const { isDragging, isDropTarget } = useSortable({
    id: node.id,
    index,
    group: `g-${node.parentId ?? 'root'}`,
    type: 'category',
    accept: 'category',
    element,
    handle: handleRef,
  });

  return (
    <div ref={setElement}>
      <TreeNodeContent
        node={node}
        depth={depth}
        expanded={expanded}
        isDragging={isDragging}
        isDropTarget={isDropTarget}
        handleRef={handleRef}
        onToggleExpand={onToggleExpand}
        onToggleActive={onToggleActive}
      />
    </div>
  );
}

export const CategoryTreeDnd = memo(function CategoryTreeDnd({
  nodes,
  depth,
  expandedIds,
  onToggleExpand,
  onToggleActive,
}: {
  nodes: CategoryTreeNode[];
  depth: number;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onToggleActive: (id: number) => void;
}) {
  return (
    <>
      {nodes.map((node, index) => (
        <div key={node.id}>
          <TreeNodeRow
            node={node}
            index={index}
            depth={depth}
            expanded={expandedIds.has(node.id)}
            onToggleExpand={() => onToggleExpand(node.id)}
            onToggleActive={() => onToggleActive(node.id)}
          />

          {node.children.length > 0 && expandedIds.has(node.id) && (
            <div className="ml-8 border-l border-slate-100">
              <CategoryTreeDnd
                nodes={node.children}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onToggleActive={onToggleActive}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
});
