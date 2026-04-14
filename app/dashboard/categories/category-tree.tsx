'use client';
import { memo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Folder, FolderOpen, ChevronRight, Pencil, Trash2,
  ChevronUp, ChevronDown, CornerDownRight,
} from 'lucide-react';
import type { Category } from '@/lib/api/categories';
import type { TreeNode } from '@/lib/types/categories';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ── Change-parent popover ─────────────────────────────────────────────────────

function ParentPopover({
  node,
  allCategories,
  anchorRef,
  onSelect,
  onClose,
}: {
  node: TreeNode;
  allCategories: Category[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onSelect: (newParentId: number | null) => void;
  onClose: () => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Tính vị trí ngay lập tức từ anchor — không dùng useEffect để tránh flash
  const pos = (() => {
    if (!anchorRef.current) return { top: 0, left: 0, width: 224, ready: false };
    const rect = anchorRef.current.getBoundingClientRect();
    const w = 224;
    const left = rect.right - w < 8 ? rect.left : rect.right - w;
    // Flip lên nếu không đủ chỗ phía dưới
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < 220 ? rect.top - 220 : rect.bottom + 4;
    return { top, left, width: w, ready: true };
  })();

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (
        popoverRef.current?.contains(e.target as Node) ||
        anchorRef.current?.contains(e.target as Node)
      ) return;
      onClose();
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('scroll', onClose, true);
    };
  }, [onClose, anchorRef]);

  const descendantIds = getDescendantIds(node);
  const options: Array<{ id: number | null; name: string; depth: number }> = [
    { id: null, name: 'Danh mục gốc', depth: 0 },
  ];
  function collectOptions(nodes: TreeNode[], depth: number) {
    for (const n of nodes) {
      if (n.id !== node.id && !descendantIds.has(n.id)) {
        options.push({ id: n.id, name: n.name, depth });
        if (n.children.length) collectOptions(n.children, depth + 1);
      }
    }
  }
  collectOptions(buildDisplayTree(allCategories), 1);

  if (!pos.ready) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
    >
      <div className="border-b border-slate-100 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Chuyển vào</p>
      </div>
      <div className="max-h-52 overflow-y-auto py-1">
        {options.map((opt) => {
          const isCurrent = opt.id === node.parentId;
          return (
            <button
              key={opt.id ?? 'root'}
              onClick={() => { onSelect(opt.id); onClose(); }}
              disabled={isCurrent}
              className={`flex w-full cursor-pointer items-center gap-2 py-2 pr-3 text-left text-sm transition-colors
                ${isCurrent ? 'cursor-default bg-blue-50 text-blue-600 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
              style={{ paddingLeft: `${12 + opt.depth * 16}px` }}
            >
              {opt.depth > 0 && <CornerDownRight className="h-3 w-3 shrink-0 text-slate-300" />}
              <Folder className={`h-3.5 w-3.5 shrink-0 ${opt.depth === 0 ? 'text-blue-400' : 'text-slate-300'}`} />
              <span className="truncate">{opt.name}</span>
              {isCurrent && (
                <span className="ml-auto shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">
                  hiện tại
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}

// ── Node row ──────────────────────────────────────────────────────────────────

interface NodeRowProps {
  node: TreeNode;
  depth: number;
  expanded: boolean;
  toggling: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  allCategories: Category[];
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChangeParent: (newParentId: number | null) => void;
}

const NodeRow = memo(function NodeRow({
  node, depth, expanded, toggling,
  canMoveUp, canMoveDown, allCategories,
  onToggleExpand, onEdit, onDelete, onToggleActive,
  onMoveUp, onMoveDown, onChangeParent,
}: NodeRowProps) {
  const hasChildren = node.children.length > 0;
  const [showParentPicker, setShowParentPicker] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="group relative">
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-slate-50"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {/* Expand */}
        <button
          onClick={onToggleExpand}
          aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 ${!hasChildren ? 'invisible' : ''}`}
        >
          <ChevronRight className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </button>

        {/* Icon */}
        <span className={`shrink-0 ${depth === 0 ? 'text-blue-500' : 'text-slate-400'}`}>
          {expanded && hasChildren
            ? <FolderOpen className="h-4 w-4" />
            : <Folder className="h-4 w-4" />}
        </span>

        {/* Name + slug */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`truncate text-sm font-medium leading-tight ${node.active ? 'text-slate-800' : 'text-slate-400 line-through'}`}>
              {node.name}
            </span>
            {hasChildren && (
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                {node.children.length}
              </span>
            )}
            {!node.active && (
              <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                Tắt
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-slate-400">{node.slug}</p>
        </div>

        {/* ── Actions ── */}
        <div className="flex shrink-0 items-center gap-1">

          {/* Move up/down */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-white">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onMoveUp}
                  disabled={!canMoveUp}
                  className="cursor-pointer rounded-l-lg px-1.5 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>Di chuyển lên</p></TooltipContent>
            </Tooltip>
            <div className="h-4 w-px bg-slate-200" />
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onMoveDown}
                  disabled={!canMoveDown}
                  className="cursor-pointer rounded-r-lg px-1.5 py-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-25"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>Di chuyển xuống</p></TooltipContent>
            </Tooltip>
          </div>

          {/* Change parent */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  ref={anchorRef}
                  onClick={() => setShowParentPicker((v) => !v)}
                  className={`cursor-pointer rounded-lg border px-2 py-1 text-xs font-medium transition-colors
                    ${showParentPicker
                      ? 'border-blue-300 bg-blue-50 text-blue-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                >
                  <CornerDownRight className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top"><p>Chuyển danh mục cha</p></TooltipContent>
            </Tooltip>
            {showParentPicker && (
              <ParentPopover
                node={node}
                allCategories={allCategories}
                anchorRef={anchorRef}
                onSelect={onChangeParent}
                onClose={() => setShowParentPicker(false)}
              />
            )}
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200" />

          {/* Active toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleActive}
                disabled={toggling}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-wait disabled:opacity-60
                  ${node.active ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${node.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{node.active ? 'Đang hoạt động — nhấn để tắt' : 'Đã tắt — nhấn để bật'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Edit */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Chỉnh sửa</p></TooltipContent>
          </Tooltip>

          {/* Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Xóa</p></TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function getDescendantIds(node: TreeNode): Set<number> {
  const ids = new Set<number>();
  function collect(n: TreeNode) {
    n.children.forEach((c) => { ids.add(c.id); collect(c); });
  }
  collect(node);
  return ids;
}

function buildDisplayTree(categories: Category[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  const roots: TreeNode[] = [];
  for (const c of categories) map.set(c.id, { ...c, children: [] });
  for (const c of categories) {
    const node = map.get(c.id)!;
    if (c.parentId == null) roots.push(node);
    else map.get(c.parentId)?.children.push(node);
  }
  return roots;
}

// ── Tree ──────────────────────────────────────────────────────────────────────

export interface CategoryTreeProps {
  nodes: TreeNode[];
  depth: number;
  expandedIds: Set<number>;
  allCategories: Category[];
  onToggleExpand: (id: number) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
  onMoveUp: (id: number, parentId: number | null) => void;
  onMoveDown: (id: number, parentId: number | null) => void;
  onChangeParent: (id: number, newParentId: number | null) => void;
  togglingId: number | null;
}

export const CategoryTree = memo(function CategoryTree({
  nodes, depth, expandedIds, allCategories,
  onToggleExpand, onEdit, onDelete, onToggleActive,
  onMoveUp, onMoveDown, onChangeParent, togglingId,
}: CategoryTreeProps) {
  return (
    <>
      {nodes.map((node, index) => (
        <div key={node.id}>
          <NodeRow
            node={node}
            depth={depth}
            expanded={expandedIds.has(node.id)}
            toggling={togglingId === node.id}
            canMoveUp={index > 0}
            canMoveDown={index < nodes.length - 1}
            allCategories={allCategories}
            onToggleExpand={() => onToggleExpand(node.id)}
            onEdit={() => onEdit(node)}
            onDelete={() => onDelete(node)}
            onToggleActive={() => onToggleActive(node)}
            onMoveUp={() => onMoveUp(node.id, node.parentId)}
            onMoveDown={() => onMoveDown(node.id, node.parentId)}
            onChangeParent={(newParentId) => onChangeParent(node.id, newParentId)}
          />
          {node.children.length > 0 && expandedIds.has(node.id) && (
            <div className="border-l border-slate-100 ml-[29px]">
              <CategoryTree
                nodes={node.children}
                depth={depth + 1}
                expandedIds={expandedIds}
                allCategories={allCategories}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
                onChangeParent={onChangeParent}
                togglingId={togglingId}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
});
