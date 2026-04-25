'use client';
import { memo, useMemo, useState } from 'react';
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
  Check,
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';

function getDescendantIds(node: TreeNode): Set<number> {
  const ids = new Set<number>();
  function collect(n: TreeNode) {
    n.children.forEach((c) => { ids.add(c.id); collect(c); });
  }
  collect(node);
  return ids;
}

function collectParentOptions(
  nodes: TreeNode[],
  excludeId: number,
  excludeDescendants: Set<number>,
  currentParentId: number | null | undefined,
  depth = 0,
): Array<{ id: number | null; name: string; depth: number; isCurrent: boolean }> {
  const result: Array<{ id: number | null; name: string; depth: number; isCurrent: boolean }> = [];
  for (const n of nodes) {
    if (n.id === excludeId || excludeDescendants.has(n.id)) continue;
    result.push({ id: n.id, name: n.name, depth, isCurrent: n.id === currentParentId });
    if (n.children.length) {
      result.push(...collectParentOptions(n.children, excludeId, excludeDescendants, currentParentId, depth + 1));
    }
  }
  return result;
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
  const [reparentOpen, setReparentOpen] = useState(false);

  const descendantIds = useMemo(() => getDescendantIds(node), [node]);
  const parentOptions = useMemo(
    () => collectParentOptions(tree, node.id, descendantIds, node.parentId),
    [tree, node.id, node.parentId, descendantIds],
  );

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
          className={cn(
            'flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground',
            !hasChildren && 'invisible',
          )}
        >
          <ChevronRight
            className={cn('h-3.5 w-3.5 transition-transform duration-200', expanded && 'rotate-90')}
          />
        </button>

        {/* Folder icon */}
        <span className={cn('shrink-0', depth === 0 ? 'text-primary' : 'text-muted-foreground/50')} aria-hidden="true">
          {expanded && hasChildren ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
        </span>

        {/* Name + slug */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'truncate text-sm leading-tight font-medium',
                node.active ? 'text-foreground' : 'text-muted-foreground/50 line-through',
              )}
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
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/30 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Thêm thao tác"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp} className="gap-2">
                <ChevronUp className="h-3.5 w-3.5" />
                Di chuyển lên
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown} className="gap-2">
                <ChevronDown className="h-3.5 w-3.5" />
                Di chuyển xuống
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* Reparent — Radix Popover nested inside dropdown item */}
              <Popover open={reparentOpen} onOpenChange={setReparentOpen}>
                <PopoverTrigger asChild>
                  <DropdownMenuItem
                    className="gap-2"
                    onSelect={(e) => {
                      e.preventDefault(); // keep dropdown open while popover opens
                      setReparentOpen(true);
                    }}
                  >
                    <CornerDownRight className="h-3.5 w-3.5" />
                    Di chuyển vào danh mục khác
                  </DropdownMenuItem>
                </PopoverTrigger>
                <PopoverContent side="left" align="start" className="w-56 p-0">
                  <Command>
                    <CommandInput placeholder="Tìm danh mục..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy danh mục nào.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="__root__"
                          onSelect={() => { onChangeParent(null); setReparentOpen(false); }}
                          className="gap-2"
                          disabled={node.parentId === null}
                        >
                          <Check className={cn('h-3.5 w-3.5 shrink-0', node.parentId === null ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                          <Folder className="h-3.5 w-3.5 shrink-0 text-primary/60" aria-hidden="true" />
                          Danh mục gốc
                        </CommandItem>
                        {parentOptions.map((opt) => (
                          <CommandItem
                            key={opt.id}
                            value={opt.name}
                            onSelect={() => { onChangeParent(opt.id as number); setReparentOpen(false); }}
                            className="gap-2"
                            disabled={opt.isCurrent}
                            style={{ paddingLeft: `${8 + opt.depth * 12}px` }}
                          >
                            <Check className={cn('h-3.5 w-3.5 shrink-0', opt.isCurrent ? 'opacity-100' : 'opacity-0')} aria-hidden="true" />
                            {opt.depth > 0 && <CornerDownRight className="h-3 w-3 shrink-0 text-muted-foreground/40" aria-hidden="true" />}
                            <span className="truncate">{opt.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Always-visible: toggle active */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleActive}
                disabled={toggling}
                role="switch"
                aria-checked={node.active}
                aria-label={node.active ? 'Đang hiển thị' : 'Đang ẩn'}
                className={cn(
                  'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  'disabled:cursor-wait disabled:opacity-60',
                  node.active ? 'bg-emerald-500' : 'bg-muted-foreground/30',
                )}
              >
                <span
                  className={cn(
                    'inline-flex h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                    node.active ? 'translate-x-4' : 'translate-x-0.5',
                  )}
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
                aria-label={`Chỉnh sửa ${node.name}`}
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-amber-500/10 hover:text-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top"><p>Chỉnh sửa</p></TooltipContent>
          </Tooltip>

          {/* Always-visible: delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onDelete}
                aria-label={`Xóa ${node.name}`}
                className="cursor-pointer rounded-lg p-1.5 text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
