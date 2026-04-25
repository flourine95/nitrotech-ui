'use client';
import { memo, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  CornerDownRight,
  MoreHorizontal,
} from 'lucide-react';
import type { Category } from '@/lib/api/categories';
import type { TreeNode } from '@/lib/types/categories';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getDescendantIds(node: TreeNode): Set<number> {
  const ids = new Set<number>();
  function collect(n: TreeNode) {
    n.children.forEach((c) => {
      ids.add(c.id);
      collect(c);
    });
  }
  collect(node);
  return ids;
}

function calcPopoverPos(anchor: HTMLElement): { top: number; left: number; width: number } {
  const rect = anchor.getBoundingClientRect();
  const w = 224;
  const left = rect.right - w < 8 ? rect.left : rect.right - w;
  const top = window.innerHeight - rect.bottom < 220 ? rect.top - 220 : rect.bottom + 4;
  return { top, left, width: w };
}

function ParentPopover({
  node,
  tree,
  pos,
  onSelect,
  onClose,
}: {
  node: TreeNode;
  tree: TreeNode[];
  pos: { top: number; left: number; width: number };
  onSelect: (newParentId: number | null) => void;
  onClose: () => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (popoverRef.current?.contains(e.target as Node)) return;
      onClose();
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('scroll', onClose, true);
    };
  }, [onClose]);

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
  collectOptions(tree, 1);

  return createPortal(
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
      className="overflow-hidden rounded-xl border border-border bg-card shadow-lg"
    >
      <div className="border-b border-border px-3 py-2">
        <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
          Chuyển vào
        </p>
      </div>
      <div className="max-h-52 overflow-y-auto py-1">
        {options.map((opt) => {
          const isCurrent = opt.id === node.parentId;
          return (
            <button
              key={opt.id ?? 'root'}
              onClick={() => {
                onSelect(opt.id);
                onClose();
              }}
              disabled={isCurrent}
              className={`flex w-full cursor-pointer items-center gap-2 py-2 pr-3 text-left text-sm transition-colors ${isCurrent ? 'cursor-default bg-primary/5 font-medium text-primary' : 'text-foreground hover:bg-muted/50'}`}
              style={{ paddingLeft: `${12 + opt.depth * 16}px` }}
            >
              {opt.depth > 0 && <CornerDownRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />}
              <Folder
                className={`h-3.5 w-3.5 shrink-0 ${opt.depth === 0 ? 'text-primary/60' : 'text-muted-foreground/40'}`}
              />
              <span className="truncate">{opt.name}</span>
              {isCurrent && (
                <span className="ml-auto shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
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

interface NodeRowProps {
  node: TreeNode;
  depth: number;
  expanded: boolean;
  toggling: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  tree: TreeNode[];
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChangeParent: (newParentId: number | null) => void;
}

const NodeRow = memo(function NodeRow({
  node,
  depth,
  expanded,
  toggling,
  canMoveUp,
  canMoveDown,
  tree,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onChangeParent,
}: NodeRowProps) {
  const hasChildren = node.children.length > 0;
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );
  const anchorRef = useRef<HTMLButtonElement>(null);

  function handleTogglePopover() {
    if (popoverPos) {
      setPopoverPos(null);
    } else if (anchorRef.current) {
      setPopoverPos(calcPopoverPos(anchorRef.current));
    }
  }

  return (
    <div className="group relative">
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2 transition-colors hover:bg-muted/50"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
          aria-expanded={hasChildren ? expanded : undefined}
          className={`flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground ${!hasChildren ? 'invisible' : ''}`}
        >
          <ChevronRight
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          />
        </button>

        {/* Folder icon */}
        <span className={`shrink-0 ${depth === 0 ? 'text-primary' : 'text-muted-foreground/50'}`}>
          {expanded && hasChildren ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
        </span>

        {/* Name + slug */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={`truncate text-sm leading-tight font-medium ${node.active ? 'text-foreground' : 'text-muted-foreground/50 line-through'}`}
            >
              {node.name}
            </span>
            {hasChildren && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {node.children.length}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/60">{node.slug}</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* More actions — Up / Down / Reparent */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition-all group-hover:opacity-100 hover:bg-muted hover:text-foreground focus-visible:opacity-100"
                aria-label="Thêm thao tác"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="gap-2"
              >
                <ChevronUp className="h-3.5 w-3.5" />
                Di chuyển lên
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="gap-2"
              >
                <ChevronDown className="h-3.5 w-3.5" />
                Di chuyển xuống
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                ref={anchorRef as React.Ref<HTMLDivElement>}
                onClick={handleTogglePopover}
                className="gap-2"
              >
                <CornerDownRight className="h-3.5 w-3.5" />
                Chuyển danh mục cha
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Always-visible: toggle active */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleActive}
                disabled={toggling}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:cursor-wait disabled:opacity-60 ${node.active ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
              >
                <span
                  className={`inline-flex h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${node.active ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{node.active ? 'Đang hiển thị — nhấn để ẩn' : 'Đang ẩn — nhấn để hiển thị'}</p>
            </TooltipContent>
          </Tooltip>

          {/* Always-visible: edit */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onEdit}
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-amber-50 hover:text-amber-600"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Chỉnh sửa</p>
            </TooltipContent>
          </Tooltip>

          {/* Always-visible: delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Xóa</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Parent popover — rendered via portal, triggered from dropdown */}
      {popoverPos && (
        <ParentPopover
          node={node}
          tree={tree}
          pos={popoverPos}
          onSelect={onChangeParent}
          onClose={() => setPopoverPos(null)}
        />
      )}
    </div>
  );
});

export interface CategoryTreeProps {
  nodes: TreeNode[];
  depth: number;
  expandedIds: Set<number>;
  tree: TreeNode[];
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
  nodes,
  depth,
  expandedIds,
  tree,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  onMoveUp,
  onMoveDown,
  onChangeParent,
  togglingId,
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
            tree={tree}
            onToggleExpand={() => onToggleExpand(node.id)}
            onEdit={() => onEdit(node)}
            onDelete={() => onDelete(node)}
            onToggleActive={() => onToggleActive(node)}
            onMoveUp={() => onMoveUp(node.id, node.parentId)}
            onMoveDown={() => onMoveDown(node.id, node.parentId)}
            onChangeParent={(newParentId) => onChangeParent(node.id, newParentId)}
          />
          {node.children.length > 0 && expandedIds.has(node.id) && (
            <div className="ml-7.25 border-l border-border">
              <CategoryTree
                nodes={node.children}
                depth={depth + 1}
                expandedIds={expandedIds}
                tree={tree}
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
