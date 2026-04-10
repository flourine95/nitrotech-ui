'use client';
import { useSortable } from '@dnd-kit/react/sortable';
import { Folder, FolderOpen, ChevronRight, GripVertical, Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/lib/api/categories';
import type { TreeNode } from '@/lib/types/categories';

function TreeNodeRow({ node, index, depth, expanded, onToggleExpand, onEdit, onDelete, onToggleActive, toggling }: {
  node: TreeNode; index: number; depth: number; expanded: boolean;
  onToggleExpand: () => void; onEdit: () => void; onDelete: () => void;
  onToggleActive: () => void; toggling: boolean;
}) {
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: node.id,
    index,
    group: `g-${node.parentId ?? 'root'}`,
    type: 'category',
    accept: 'category',
  });
  const hasChildren = node.children.length > 0;

  return (
    <div ref={ref} className={`rounded-xl transition-colors duration-100 ${isDropTarget ? 'bg-blue-50 ring-2 ring-blue-300' : ''} ${isDragging ? 'opacity-30' : ''}`}>
      <div className="group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50" style={{ paddingLeft: `${12 + depth * 24}px` }}>
        <button ref={handleRef} type="button" tabIndex={-1} aria-label="Kéo để sắp xếp"
          className="cursor-grab touch-none text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={onToggleExpand} aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-700 ${!hasChildren ? 'invisible' : ''}`}>
          <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <span className={`shrink-0 ${depth === 0 ? 'text-blue-500' : 'text-slate-400'}`}>
          {expanded && hasChildren ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
        </span>

        {/* Name + slug */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`truncate text-sm font-medium ${node.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
              {node.name}
            </span>
            {hasChildren && (
              <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                {node.children.length}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-slate-400">{node.slug}</p>
        </div>

        {/* Active toggle */}
        <button onClick={onToggleActive} disabled={toggling}
          title={node.active ? 'Đang hoạt động — nhấn để tắt' : 'Đã tắt — nhấn để bật'}
          className={`relative shrink-0 inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-wait disabled:opacity-60 ${node.active ? 'bg-emerald-500 focus:ring-emerald-400' : 'bg-slate-300 focus:ring-slate-400'}`}>
          <span className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${node.active ? 'translate-x-4' : 'translate-x-0.5'}`}>
            {node.active
              ? <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2 6 5 9 10 3" /></svg>
              : <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="3" x2="9" y2="9" /><line x1="9" y1="3" x2="3" y2="9" /></svg>}
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600" aria-label="Sửa"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label="Xóa"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

export function CategoryTree({ nodes, depth, expandedIds, onToggleExpand, onEdit, onDelete, onToggleActive, togglingId }: {
  nodes: TreeNode[]; depth: number; expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
  togglingId: number | null;
}) {
  return (
    <>
      {nodes.map((node, index) => (
        <div key={node.id}>
          <TreeNodeRow
            node={node} index={index} depth={depth}
            expanded={expandedIds.has(node.id)}
            onToggleExpand={() => onToggleExpand(node.id)}
            onEdit={() => onEdit(node)}
            onDelete={() => onDelete(node)}
            onToggleActive={() => onToggleActive(node)}
            toggling={togglingId === node.id}
          />
          {node.children.length > 0 && expandedIds.has(node.id) && (
            <div className="ml-8 border-l border-slate-100">
              <CategoryTree
                nodes={node.children} depth={depth + 1} expandedIds={expandedIds}
                onToggleExpand={onToggleExpand} onEdit={onEdit} onDelete={onDelete}
                onToggleActive={onToggleActive} togglingId={togglingId}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}
