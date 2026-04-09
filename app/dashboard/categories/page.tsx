'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  moveCategories,
  type Category,
} from '@/lib/categories-api';
import { ApiException } from '@/lib/client';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TreeNode extends Category {
  children: TreeNode[];
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(1, 'Bắt buộc'),
  slug: z.string().min(1, 'Bắt buộc').regex(/^[a-z0-9-]+$/, 'Chỉ chữ thường, số, gạch ngang'),
  description: z.string().optional(),
  parentId: z.number().nullable(),
  active: z.boolean(),
});
type FormData = z.infer<typeof schema>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildTree(flat: Category[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }));
  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder);
    nodes.forEach((n) => sort(n.children));
  };
  sort(roots);
  return roots;
}

// Flatten nested tree → flat array (for stats, form selects, search)
function flattenTree(nodes: TreeNode[]): Category[] {
  return nodes.flatMap((n) => [n, ...flattenTree(n.children)]);
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconFolder = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
  </svg>
);
const IconFolderOpen = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1" />
    <path d="M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const IconEdit = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);
const IconChevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const IconGrip = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="9" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="7" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="17" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="17" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const IconX = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ── Sortable Tree Node ────────────────────────────────────────────────────────

function TreeNodeRow({
  node,
  depth,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  flatList,
  onMoved,
}: {
  node: TreeNode;
  depth: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
  flatList: Category[];
  onMoved: (updated: Category[]) => void;
}) {
  const { ref, isDragging } = useSortable({ id: node.id, data: node });
  const hasChildren = node.children.length > 0;

  return (
    <div
      ref={ref}
      className={`transition-opacity duration-150 ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
      <div
        className="group flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {/* Drag handle */}
        <span className="cursor-grab touch-none text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing">
          <IconGrip />
        </span>

        {/* Expand toggle */}
        <button
          onClick={onToggleExpand}
          className={`flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded text-slate-400 transition-colors hover:text-slate-700 ${!hasChildren ? 'invisible' : ''}`}
          aria-label={expanded ? 'Thu gọn' : 'Mở rộng'}
        >
          <IconChevron open={expanded} />
        </button>

        {/* Folder icon */}
        <span className={`shrink-0 ${depth === 0 ? 'text-blue-500' : 'text-slate-400'}`}>
          {expanded && hasChildren
            ? <IconFolderOpen className="h-4 w-4" />
            : <IconFolder className="h-4 w-4" />}
        </span>

        {/* Name + meta */}
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

        {/* Status toggle */}
        <button
          onClick={onToggleActive}
          title={node.active ? 'Đang hoạt động — nhấn để tắt' : 'Đã tắt — nhấn để bật'}
          className={`relative shrink-0 inline-flex h-5 w-9 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${node.active ? 'bg-emerald-500 focus:ring-emerald-400' : 'bg-slate-300 focus:ring-slate-400'}`}
        >
          <span className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${node.active ? 'translate-x-4' : 'translate-x-0.5'}`}>
            {node.active ? (
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="2 6 5 9 10 3" />
              </svg>
            ) : (
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="3" y1="3" x2="9" y2="9" /><line x1="9" y1="3" x2="3" y2="9" />
              </svg>
            )}
          </span>
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={onEdit} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-600" aria-label="Sửa">
            <IconEdit />
          </button>
          <button onClick={onDelete} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label="Xóa">
            <IconTrash />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Panel (slide-over) ───────────────────────────────────────────────

function CategoryPanel({
  category,
  allCategories,
  onClose,
  onSaved,
}: {
  category: Category | null;
  allCategories: Category[];
  onClose: () => void;
  onSaved: (c: Category) => void;
}) {
  const isEdit = !!category;
  const slugTouched = useRef(isEdit);
  const { register, handleSubmit, setValue, watch, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: category
      ? { name: category.name, slug: category.slug, description: category.description ?? '', parentId: category.parentId, active: category.active }
      : { name: '', slug: '', description: '', parentId: null, active: true },
  });

  const name = watch('name');
  const parentId = watch('parentId');
  const active = watch('active');

  useEffect(() => {
    if (!slugTouched.current && name) {
      setValue('slug', name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
    }
  }, [name, setValue]);

  const parentOptions = allCategories.filter((c) => c.id !== category?.id);
  const selectedParent = parentOptions.find((c) => c.id === parentId);

  async function onSubmit(data: FormData) {
    try {
      const payload = { name: data.name, slug: data.slug, description: data.description || undefined, parentId: data.parentId ?? null, active: data.active };
      const saved = isEdit ? await updateCategory(category!.id, payload) : await createCategory(payload);
      toast.success(isEdit ? 'Đã cập nhật danh mục' : 'Đã tạo danh mục');
      onSaved(saved);
    } catch (e) {
      if (e instanceof ApiException) {
        if (e.error.code === 'CATEGORY_SLUG_EXISTS') setError('slug', { message: 'Slug đã tồn tại' });
        else if (e.error.code === 'CATEGORY_CIRCULAR_REF') setError('parentId', { message: 'Tham chiếu vòng tròn' });
        else if (e.error.errors) Object.entries(e.error.errors).forEach(([f, m]) => setError(f as keyof FormData, { message: m }));
        else toast.error(e.error.message);
      }
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />
      <aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl" role="dialog" aria-modal="true">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <IconFolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
              {isEdit && <p className="text-xs text-slate-400">ID #{category!.id}</p>}
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng">
            <IconX />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-y-auto" noValidate>
          <div className="flex-1 space-y-5 px-6 py-5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Tên danh mục <span className="text-rose-500">*</span></label>
              <input {...register('name')} placeholder="VD: Điện tử, Thời trang..." autoFocus
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 ${errors.name ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'}`} />
              {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Slug <span className="text-rose-500">*</span></label>
              <div className="relative">
                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 select-none text-xs text-slate-400">/</span>
                <input {...register('slug')} placeholder="dien-tu" onFocus={() => { slugTouched.current = true; }}
                  className={`w-full rounded-xl border py-2.5 pr-3.5 pl-6 font-mono text-sm outline-none transition-colors focus:ring-2 ${errors.slug ? 'border-rose-300 bg-rose-50 focus:ring-rose-100' : 'border-slate-200 bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-100'}`} />
              </div>
              {errors.slug && <p className="mt-1 text-xs text-rose-500">{errors.slug.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Danh mục cha</label>
              <select value={parentId ?? ''} onChange={(e) => setValue('parentId', e.target.value ? Number(e.target.value) : null)}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100">
                <option value="">— Danh mục gốc —</option>
                {parentOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {selectedParent && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                  <IconFolder className="h-3 w-3" />
                  Nằm trong: <span className="font-medium text-slate-600">{selectedParent.name}</span>
                </p>
              )}
              {errors.parentId && <p className="mt-1 text-xs text-rose-500">{errors.parentId.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Mô tả</label>
              <textarea {...register('description')} rows={3} placeholder="Mô tả ngắn..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100" />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Kích hoạt</p>
                <p className="text-xs text-slate-400">Hiển thị trên cửa hàng</p>
              </div>
              <button type="button" role="switch" aria-checked={active} onClick={() => setValue('active', !active)}
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${active ? 'bg-blue-600' : 'bg-slate-300'}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${active ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 cursor-pointer rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60">
                {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo danh mục'}
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}

// ── Delete Dialog ─────────────────────────────────────────────────────────────

function DeleteDialog({ category, onConfirm, onClose, loading }: { category: Category; onConfirm: () => void; onClose: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600"><IconTrash /></div>
        <h3 className="mb-1 text-sm font-bold text-slate-900">Xóa danh mục?</h3>
        <p className="mb-1 text-sm text-slate-500">Bạn sắp xóa <span className="font-semibold text-slate-800">"{category.name}"</span>.</p>
        {category.children?.length > 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">Có {category.children.length} danh mục con — xóa con trước.</p>
        )}
        <p className="mb-5 text-xs text-slate-400">Soft delete, có thể khôi phục sau.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">Hủy</button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 cursor-pointer rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60">
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Recursive Tree ────────────────────────────────────────────────────────────

function CategoryTree({
  nodes,
  depth,
  expandedIds,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  flatList,
  onMoved,
}: {
  nodes: TreeNode[];
  depth: number;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggleActive: (c: Category) => void;
  flatList: Category[];
  onMoved: (updated: Category[]) => void;
}) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.id}>
          <TreeNodeRow
            node={node}
            depth={depth}
            expanded={expandedIds.has(node.id)}
            onToggleExpand={() => onToggleExpand(node.id)}
            onEdit={() => onEdit(node)}
            onDelete={() => onDelete(node)}
            onToggleActive={() => onToggleActive(node)}
            flatList={flatList}
            onMoved={onMoved}
          />
          {/* Children — shown only when expanded */}
          {node.children.length > 0 && expandedIds.has(node.id) && (
            <div className="border-l border-slate-100 ml-8">
              <CategoryTree
                nodes={node.children}
                depth={depth + 1}
                expandedIds={expandedIds}
                onToggleExpand={onToggleExpand}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleActive={onToggleActive}
                flatList={flatList}
                onMoved={onMoved}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardCategoriesPage() {
  const [flatList, setFlatList] = useState<Category[]>([]);
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [panel, setPanel] = useState<{ open: boolean; category: Category | null }>({ open: false, category: null });
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // tree=true → server trả nested, bỏ qua pagination
      const treeData = await getCategories({ tree: true }) as Category[];
      setTree(treeData as TreeNode[]);

      // flat list để dùng cho form select, stats, search
      const flat = flattenTree(treeData as TreeNode[]);
      setFlatList(flat);
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

  // Search: flatten matching nodes
  const searchLower = search.toLowerCase();
  const matchedIds = search
    ? new Set(flatList.filter((c) => c.name.toLowerCase().includes(searchLower) || c.slug.includes(searchLower)).map((c) => c.id))
    : null;

  // Filter tree to only show matching nodes + their ancestors
  function filterTree(nodes: TreeNode[]): TreeNode[] {
    if (!matchedIds) return nodes;
    return nodes.reduce<TreeNode[]>((acc, node) => {
      const filteredChildren = filterTree(node.children);
      if (matchedIds.has(node.id) || filteredChildren.length > 0) {
        acc.push({ ...node, children: filteredChildren });
      }
      return acc;
    }, []);
  }
  const visibleTree = filterTree(tree);

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function expandAll() {
    setExpandedIds(new Set(flatList.filter((c) => !c.parentId).map((c) => c.id)));
  }

  function collapseAll() {
    setExpandedIds(new Set());
  }

  async function handleToggleActive(cat: Category) {
    try {
      const updated = await updateCategory(cat.id, { active: !cat.active });
      setFlatList((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      // sync tree
      function patchTree(nodes: TreeNode[]): TreeNode[] {
        return nodes.map((n) => n.id === updated.id ? { ...n, ...updated } : { ...n, children: patchTree(n.children) });
      }
      setTree((prev) => patchTree(prev));
      toast.success(updated.active ? 'Đã kích hoạt' : 'Đã tắt');
    } catch {
      toast.error('Cập nhật thất bại');
    }
  }

  async function handleDelete(cat: Category) {
    setDeleting(true);
    try {
      await deleteCategory(cat.id);
      await load(); // reload tree from server
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

  function handleMoved(updated: Category[]) {
    // Reload tree to get correct structure from server
    load();
    void updated; // suppress unused warning
  }

  // DnD: handle drag end for reorder/move
  function handleDragEnd(event: { operation: { source?: { data?: unknown }; target?: { data?: unknown } }; canceled: boolean }) {
    if (event.canceled) return;
    const dragged = event.operation.source?.data as TreeNode | undefined;
    const target = event.operation.target?.data as TreeNode | undefined;
    if (!dragged || !target || dragged.id === target.id) return;

    const fromParentId = dragged.parentId;
    const toParentId = target.parentId; // drop into same level as target

    // siblings at destination
    const destSiblings = flatList
      .filter((c) => c.parentId === toParentId && c.id !== dragged.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const targetIdx = destSiblings.findIndex((c) => c.id === target.id);
    const newDestOrder = [...destSiblings.map((c) => c.id)];
    newDestOrder.splice(targetIdx >= 0 ? targetIdx : newDestOrder.length, 0, dragged.id);

    const payload: Parameters<typeof moveCategories>[0] = {
      movedId: dragged.id,
      fromParentId,
      toParentId,
      targetOrderedIds: newDestOrder,
    };

    if (fromParentId !== toParentId) {
      const srcSiblings = flatList
        .filter((c) => c.parentId === fromParentId && c.id !== dragged.id)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.id);
      payload.sourceOrderedIds = srcSiblings;
    }

    // Optimistic update
    const optimistic = flatList.map((c) => {
      const idx = newDestOrder.indexOf(c.id);
      if (idx !== -1) return { ...c, parentId: toParentId, sortOrder: idx };
      return c;
    });
    setFlatList(optimistic);

    moveCategories(payload)
      .then(handleMoved)
      .catch(() => {
        toast.error('Sắp xếp thất bại');
        load();
      });
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh mục</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kéo thả để sắp xếp · Click mũi tên để mở rộng</p>
        </div>
        <button onClick={() => setPanel({ open: true, category: null })}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
          <IconPlus />
          Thêm danh mục
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
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"><IconSearch /></span>
          <input type="search" placeholder="Tìm tên, slug..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          {search && (
            <button onClick={() => setSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600" aria-label="Xóa">
              <IconX className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={expandAll} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Mở tất cả
          </button>
          <button onClick={collapseAll} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
            Đóng tất cả
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        ) : visibleTree.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <IconFolder className="mb-3 h-10 w-10 text-slate-200" />
            <p className="text-sm font-medium">{search ? `Không tìm thấy "${search}"` : 'Chưa có danh mục nào'}</p>
            {search && <button onClick={() => setSearch('')} className="mt-2 cursor-pointer text-xs text-blue-500 hover:underline">Xóa bộ lọc</button>}
          </div>
        ) : (
          <DragDropProvider onDragEnd={handleDragEnd as never}>
            <div className="p-2">
              <CategoryTree
                nodes={visibleTree}
                depth={0}
                expandedIds={search ? new Set(flatList.map((c) => c.id)) : expandedIds}
                onToggleExpand={toggleExpand}
                onEdit={(c) => setPanel({ open: true, category: c })}
                onDelete={setDeleteTarget}
                onToggleActive={handleToggleActive}
                flatList={flatList}
                onMoved={handleMoved}
              />
            </div>
          </DragDropProvider>
        )}

        {!loading && visibleTree.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
            {search ? `${flatList.filter((c) => c.name.toLowerCase().includes(searchLower) || c.slug.includes(searchLower)).length} kết quả cho "${search}"` : `${total} danh mục · ${rootCount} gốc · ${subCount} con`}
          </div>
        )}
      </div>

      {/* Panel */}
      {panel.open && (
        <CategoryPanel category={panel.category} allCategories={flatList}
          onClose={() => setPanel({ open: false, category: null })}
          onSaved={(saved) => {
            load(); // reload tree to reflect new/updated category
            setPanel({ open: false, category: null });
          }} />
      )}

      {/* Delete */}
      {deleteTarget && (
        <DeleteDialog category={deleteTarget} loading={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)} />
      )}
    </div>
  );
}
