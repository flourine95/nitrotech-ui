'use client';

import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useQueryState, parseAsBoolean } from 'nuqs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CornerDownRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  type CategoriesResponse,
  type Category,
  createCategory,
  deleteCategory,
  getCategories,
  hardDeleteCategory,
  moveCategory,
  moveCategoryDown,
  moveCategoryUp,
  restoreCategory,
  toggleCategory,
  updateCategory,
} from '@/lib/api/categories';
import { categorySchema, type CategoryFormData } from '@/lib/schemas/categories';
import { Label } from '@/components/ui/label';

// Helper function hoisted outside component to enable proper memoization
function getFlatCategoryList(
  cats: Category[],
  exclude?: number,
): Array<{ id: number; name: string; depth: number }> {
  const result: Array<{ id: number; name: string; depth: number }> = [];
  const traverse = (items: Category[], depth: number) => {
    items.forEach((cat) => {
      if (cat.id !== exclude) {
        result.push({ id: cat.id, name: cat.name, depth });
        if (cat.children.length > 0) {
          traverse(cat.children, depth + 1);
        }
      }
    });
  };
  traverse(cats, 0);
  return result;
}

interface CategoryRowProps {
  category: Category;
  depth: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDelete: (category: Category) => void;
  onEdit: (category: Category) => void;
  onChangeParent: (category: Category) => void;
  onAddChild: (category: Category) => void;
  onToggleActive?: (category: Category) => void;
  onMoveUp?: (category: Category) => void;
  onMoveDown?: (category: Category) => void;
}

function CategoryRow({
  category,
  depth,
  isExpanded,
  onToggleExpand,
  canMoveUp,
  canMoveDown,
  onDelete,
  onEdit,
  onChangeParent,
  onAddChild,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: CategoryRowProps) {
  const hasChildren = category.children.length > 0;

  return (
    <div role="treeitem" aria-selected={false} aria-expanded={hasChildren ? isExpanded : undefined}>
      <div
        className={cn(
          'group relative flex items-center gap-2 rounded-xl px-3 py-2 transition-colors',
          'hover:bg-muted/50',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1',
        )}
        style={{ paddingLeft: `${12 + depth * 24}px` }}
      >
        {/* Expand/collapse button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleExpand}
          aria-label={
            hasChildren
              ? isExpanded
                ? `Thu gọn ${category.name}`
                : `Mở rộng ${category.name}`
              : undefined
          }
          className={cn(
            'size-6 shrink-0 text-muted-foreground/60 hover:bg-muted hover:text-foreground',
            !hasChildren && 'invisible',
          )}
        >
          <ChevronRight
            className={cn('transition-transform duration-200', isExpanded && 'rotate-90')}
          />
        </Button>

        {/* Folder icon */}
        <span className={cn('shrink-0', depth === 0 ? 'text-primary' : 'text-muted-foreground/50')}>
          {isExpanded && hasChildren ? <FolderOpen /> : <Folder />}
        </span>

        {/* Category info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'truncate text-sm leading-tight font-medium',
                category.active ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {category.name}
            </span>
            {hasChildren && (
              <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {category.childrenCount || category.children.length}
              </span>
            )}
          </div>
          <p className="font-mono text-[11px] text-muted-foreground/60">{category.slug}</p>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Move up/down buttons */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Di chuyển ${category.name} lên`}
            className="size-7 text-muted-foreground hover:text-foreground"
            disabled={!canMoveUp}
            onClick={() => onMoveUp?.(category)}
          >
            <ChevronUp />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label={`Di chuyển ${category.name} xuống`}
            className="size-7 text-muted-foreground hover:text-foreground"
            disabled={!canMoveDown}
            onClick={() => onMoveDown?.(category)}
          >
            <ChevronDown />
          </Button>

          {/* Divider - hidden on mobile */}
          <div className="mx-1 hidden h-4 w-px bg-border sm:block" />

          {/* Toggle active switch */}
          <Switch
            checked={category.active}
            onCheckedChange={() => onToggleActive?.(category)}
            aria-label={
              category.active
                ? `${category.name} đang hiển thị - nhấn để ẩn`
                : `${category.name} đang ẩn - nhấn để hiển thị`
            }
          />

          {/* Edit button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Chỉnh sửa ${category.name}`}
            onClick={() => onEdit(category)}
            className="size-8 text-muted-foreground"
          >
            <Pencil />
          </Button>

          {/* Delete button */}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Xóa ${category.name}`}
            onClick={() => onDelete(category)}
            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 />
          </Button>

          {/* More actions dropdown - hidden on mobile, shown in ... menu */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                aria-label={`Thêm thao tác cho ${category.name}`}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onChangeParent(category)}>
                <CornerDownRight data-icon="inline-start" />
                Di chuyển vào danh mục khác
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddChild(category)}>
                <Plus data-icon="inline-start" />
                Thêm danh mục con
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

function CategoryTreeNode({
  category,
  depth,
  canMoveUp,
  canMoveDown,
  onDelete,
  onEdit,
  onChangeParent,
  onAddChild,
  expandedIds,
  onToggleExpand,
  onToggleActive,
  onMoveUp,
  onMoveDown,
}: {
  category: Category;
  depth: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onDelete: (category: Category) => void;
  onEdit: (category: Category) => void;
  onChangeParent: (category: Category) => void;
  onAddChild: (category: Category) => void;
  expandedIds: Set<number>;
  onToggleExpand: (id: number) => void;
  onToggleActive?: (category: Category) => void;
  onMoveUp?: (category: Category) => void;
  onMoveDown?: (category: Category) => void;
}) {
  const isExpanded = expandedIds.has(category.id);

  return (
    <>
      <CategoryRow
        category={category}
        depth={depth}
        isExpanded={isExpanded}
        onToggleExpand={() => onToggleExpand(category.id)}
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onDelete={onDelete}
        onEdit={onEdit}
        onChangeParent={onChangeParent}
        onAddChild={onAddChild}
        onToggleActive={onToggleActive}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
      />
      {isExpanded && category.children.length > 0 && (
        <div className="relative ml-7.25 border-l border-border" role="group">
          {category.children.map((child, index) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              depth={depth + 1}
              canMoveUp={index > 0}
              canMoveDown={index < category.children.length - 1}
              onDelete={onDelete}
              onEdit={onEdit}
              onChangeParent={onChangeParent}
              onAddChild={onAddChild}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              onToggleActive={onToggleActive}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          ))}
        </div>
      )}
    </>
  );
}

export default function DashboardCategoriesPage() {
  const queryClient = useQueryClient();
  
  // URL state management with nuqs
  const [showDeleted, setShowDeleted] = useQueryState(
    'deleted',
    parseAsBoolean.withDefault(false)
  );
  
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Category | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Category | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  // Create/Edit dialog state
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [parentForNewChild, setParentForNewChild] = useState<Category | null>(null);

  // React Hook Form
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      parentId: null,
      active: true,
    },
  });

  // Change parent dialog state
  const [changeParentTarget, setChangeParentTarget] = useState<Category | null>(null);
  const [newParentId, setNewParentId] = useState<string>('');

  // Queries
  const { data: treeData, isLoading } = useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const result = await getCategories();
      return result as CategoriesResponse;
    },
    staleTime: 30000, // 30 seconds
  });

  const { data: deletedData } = useQuery({
    queryKey: ['categories', 'deleted'],
    queryFn: async () => {
      const result = await getCategories({ deleted: true });
      return result as Category[];
    },
    staleTime: 30000,
  });

  const categories = useMemo(() => treeData?.data || [], [treeData?.data]);
  const deletedCategories = deletedData || [];

  // Use backend facets instead of calculating on frontend
  const stats = useMemo(() => {
    const facets = treeData?.facets;
    if (facets) {
      return {
        total: (facets.active || 0) + (facets.inactive || 0),
        active: facets.active || 0,
        root: facets.root || 0,
        sub: (facets.active || 0) + (facets.inactive || 0) - (facets.root || 0),
        deleted: facets.deleted || 0,
      };
    }
    // Fallback if facets not available
    return {
      total: 0,
      active: 0,
      root: 0,
      sub: 0,
      deleted: deletedCategories.length,
    };
  }, [treeData?.facets, deletedCategories.length]);

  // Memoize flat category list for Select dropdowns
  const flatCategoryList = useMemo(() => getFlatCategoryList(categories), [categories]);

  const flatCategoryListExcludingTarget = useMemo(
    () => (changeParentTarget ? getFlatCategoryList(categories, changeParentTarget.id) : []),
    [categories, changeParentTarget],
  );

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã xóa danh mục');
      setDeleteTarget(null);
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;
      
      switch (code) {
        case 'CATEGORY_NOT_FOUND':
          toast.error('Danh mục không tồn tại');
          break;
        case 'CATEGORY_HAS_CHILDREN':
          toast.error('Không thể xóa danh mục có danh mục con. Vui lòng xóa hoặc di chuyển danh mục con trước.');
          break;
        case 'CATEGORY_HAS_PRODUCTS':
          toast.error('Không thể xóa danh mục đang có sản phẩm');
          break;
        default:
          toast.error(err?.error?.message || 'Xóa danh mục thất bại');
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã khôi phục danh mục');
      setRestoreTarget(null);
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;
      
      switch (code) {
        case 'CATEGORY_SLUG_CONFLICT':
          toast.error('Không thể khôi phục: slug đã được sử dụng bởi danh mục khác');
          break;
        default:
          toast.error(err?.error?.message || 'Khôi phục thất bại');
      }
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã xóa vĩnh viễn');
      setHardDeleteTarget(null);
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;
      
      switch (code) {
        case 'CATEGORY_HAS_CHILDREN':
          toast.error('Không thể xóa vĩnh viễn danh mục có danh mục con');
          break;
        case 'CATEGORY_HAS_PRODUCTS':
          toast.error('Không thể xóa vĩnh viễn danh mục đang có sản phẩm');
          break;
        default:
          toast.error(err?.error?.message || 'Xóa vĩnh viễn thất bại');
      }
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (id: number) => toggleCategory(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['categories', 'tree'] });
      const previousData = queryClient.getQueryData<CategoriesResponse>(['categories', 'tree']);

      // Optimistic update: toggle active state
      if (previousData) {
        const toggleInTree = (tree: Category[]): Category[] => {
          return tree.map((cat) => {
            if (cat.id === id) {
              return { ...cat, active: !cat.active };
            }
            if (cat.children.length > 0) {
              return { ...cat, children: toggleInTree(cat.children) };
            }
            return cat;
          });
        };

        queryClient.setQueryData<CategoriesResponse>(['categories', 'tree'], {
          ...previousData,
          data: toggleInTree(previousData.data),
        });
      }
      return { previousData };
    },
    onSuccess: () => {
      // Refetch to get updated facets from backend
      void queryClient.invalidateQueries({ queryKey: ['categories', 'tree'] });
      toast.success('Đã cập nhật trạng thái');
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['categories', 'tree'], context.previousData);
      }
      toast.error('Cập nhật thất bại');
    },
  });

  const moveUpMutation = useMutation({
    mutationFn: moveCategoryUp,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', 'tree'] });
      toast.success('Đã di chuyển lên');
    },
    onError: (error: unknown) => {
      const err = error as { error?: { message?: string; code?: string }; message?: string };
      const message = err?.error?.message || err?.message || '';
      if (err?.error?.code === 'ALREADY_FIRST') {
        toast.error('Danh mục đã ở vị trí đầu tiên');
      } else {
        toast.error(`Di chuyển thất bại: ${message || 'Unknown error'}`);
      }
    },
  });

  const moveDownMutation = useMutation({
    mutationFn: moveCategoryDown,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories', 'tree'] });
      toast.success('Đã di chuyển xuống');
    },
    onError: (error: unknown) => {
      const err = error as { error?: { message?: string; code?: string }; message?: string };
      const message = err?.error?.message || err?.message || '';
      if (err?.error?.code === 'ALREADY_LAST') {
        toast.error('Danh mục đã ở vị trí cuối cùng');
      } else {
        toast.error(`Di chuyển thất bại: ${message || 'Unknown error'}`);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã tạo danh mục mới');
      closeFormDialog();
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;
      
      switch (code) {
        case 'CATEGORY_SLUG_EXISTS':
          form.setError('slug', { message: 'Slug này đã được sử dụng' });
          toast.error('Slug đã tồn tại, vui lòng chọn slug khác');
          break;
        case 'CATEGORY_NOT_FOUND':
          toast.error('Danh mục cha không tồn tại');
          break;
        default:
          toast.error(err?.error?.message || 'Tạo danh mục thất bại');
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã cập nhật danh mục');
      closeFormDialog();
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;
      
      switch (code) {
        case 'CATEGORY_SLUG_EXISTS':
          form.setError('slug', { message: 'Slug này đã được sử dụng' });
          toast.error('Slug đã tồn tại, vui lòng chọn slug khác');
          break;
        case 'CATEGORY_NOT_FOUND':
          toast.error('Danh mục không tồn tại');
          break;
        case 'CATEGORY_CIRCULAR_REF':
          toast.error('Không thể tạo tham chiếu vòng (danh mục không thể là cha của chính nó)');
          break;
        default:
          toast.error(err?.error?.message || 'Cập nhật danh mục thất bại');
      }
    },
  });

  const changeParentMutation = useMutation({
    mutationFn: ({ id, newParentId }: { id: number; newParentId: number | null }) =>
      moveCategory(id, { newParentId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Đã di chuyển danh mục');
      closeChangeParentDialog();
    },
    onError: (error: unknown) => {
      const err = error as { error?: { code?: string; message?: string } };
      const code = err?.error?.code;
      
      switch (code) {
        case 'CATEGORY_NOT_FOUND':
          toast.error('Danh mục hoặc danh mục cha không tồn tại');
          break;
        case 'CATEGORY_CIRCULAR_REF':
          toast.error('Không thể di chuyển danh mục vào danh mục con của chính nó');
          break;
        case 'INVALID_AFTER_ID':
          toast.error('Vị trí đích không hợp lệ');
          break;
        default:
          toast.error(err?.error?.message || 'Di chuyển thất bại');
      }
    },
  });

  const handleToggleActive = useCallback(
    (cat: Category) => {
      toggleActiveMutation.mutate(cat.id);
    },
    [toggleActiveMutation],
  );

  const handleMoveUp = useCallback(
    (cat: Category) => {
      moveUpMutation.mutate(cat.id);
    },
    [moveUpMutation],
  );

  const handleMoveDown = useCallback(
    (cat: Category) => {
      moveDownMutation.mutate(cat.id);
    },
    [moveDownMutation],
  );

  const handleDelete = useCallback((cat: Category) => {
    setDeleteTarget(cat);
  }, []);

  function toggleExpand(id: number) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function expandAll() {
    const allIds = new Set<number>();
    const collectIds = (cats: Category[]) => {
      cats.forEach((cat) => {
        if (cat.children.length > 0) {
          allIds.add(cat.id);
          collectIds(cat.children);
        }
      });
    };
    collectIds(categories);
    setExpandedIds(allIds);
  }

  function collapseAll() {
    setExpandedIds(new Set());
  }

  function openCreateDialog(parentCategory?: Category) {
    form.reset({
      name: '',
      slug: '',
      description: '',
      parentId: parentCategory?.id || null,
      active: true,
    });
    setParentForNewChild(parentCategory || null);
    setEditTarget(null);
    setShowCreateDialog(true);
  }

  function openEditDialog(category: Category) {
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId,
      active: category.active,
    });
    setEditTarget(category);
    setParentForNewChild(null);
    setShowCreateDialog(true);
  }

  function closeFormDialog() {
    setShowCreateDialog(false);
    setEditTarget(null);
    setParentForNewChild(null);
    form.reset();
  }

  function handleSaveCategory(data: CategoryFormData) {
    if (editTarget) {
      updateMutation.mutate({
        id: editTarget.id,
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description || undefined,
          active: data.active,
        },
      });
    } else {
      createMutation.mutate({
        name: data.name,
        slug: data.slug,
        description: data.description || undefined,
        parentId: data.parentId,
        active: data.active,
      });
    }
  }

  function openChangeParentDialog(category: Category) {
    setChangeParentTarget(category);
    setNewParentId(category.parentId?.toString() || 'null');
  }

  function closeChangeParentDialog() {
    setChangeParentTarget(null);
    setNewParentId('');
  }

  function handleChangeParent() {
    if (!changeParentTarget) return;
    const parentId = newParentId === 'null' ? null : parseInt(newParentId);
    changeParentMutation.mutate({ id: changeParentTarget.id, newParentId: parentId });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-6 w-96" />
        <div className="rounded-md border">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 border-b p-4 last:border-0">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {showDeleted ? 'Danh Mục Đã Xóa' : 'Danh Mục'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {showDeleted ? 'Khôi phục hoặc xóa vĩnh viễn danh mục' : 'Quản lý danh mục sản phẩm'}
          </p>
        </div>
        {showDeleted ? (
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-full shrink-0 sm:w-auto"
            onClick={() => setShowDeleted(false)}
          >
            Quay lại danh mục
          </Button>
        ) : (
          <Button
            size="sm"
            className="h-9 w-full shrink-0 sm:w-auto"
            onClick={() => openCreateDialog()}
          >
            <Plus data-icon="inline-start" />
            Thêm danh mục
          </Button>
        )}
      </div>

      {/* Stats summary + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm text-muted-foreground">
          {showDeleted ? (
            <>
              <span className="font-medium text-foreground">{stats.deleted}</span> danh mục đã xóa
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{stats.total}</span> danh mục
              {' · '}
              <span className="font-medium text-foreground">{stats.active}</span> hoạt động
              {' · '}
              <span className="font-medium text-primary">{stats.root}</span> gốc
              {' · '}
              <span className="font-medium text-foreground/70">{stats.sub}</span> con
            </>
          )}
        </p>

        <div className="flex items-center gap-2">
          {!showDeleted && (
            <>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={expandAll}>
                Mở tất cả
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={collapseAll}>
                Đóng tất cả
              </Button>
              <div className="mx-1 hidden h-4 w-px bg-border sm:block" />
            </>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowDeleted(!showDeleted)}
          >
            <Trash2 data-icon="inline-start" />
            {showDeleted ? 'Ẩn thùng rác' : `Xem thùng rác (${stats.deleted})`}
          </Button>
        </div>
      </div>

      {/* Category tree or deleted list */}
      <div className="overflow-hidden rounded-md border bg-card">
        {showDeleted ? (
          <div className="divide-y divide-border">
            {/* Empty state for trash */}
            {deletedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Trash2 className="mb-3 size-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  Không có danh mục đã xóa
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  Các danh mục đã xóa sẽ xuất hiện ở đây
                </p>
              </div>
            ) : (
              deletedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex flex-col gap-3 px-4 py-3 hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-3"
                >
                  <Folder className="shrink-0 text-muted-foreground/40" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-muted-foreground line-through">
                      {cat.name}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground/70">{cat.slug}</p>
                  </div>
                  {cat.parentName && (
                    <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[11px] text-muted-foreground/70">
                      {cat.parentName}
                    </span>
                  )}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreTarget(cat)}
                      className="h-8 flex-1 text-xs sm:flex-none"
                    >
                      <RotateCcw data-icon="inline-start" />
                      Khôi phục
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHardDeleteTarget(cat)}
                      className="h-8 flex-1 text-xs text-destructive hover:text-destructive sm:flex-none"
                    >
                      <Trash2 data-icon="inline-start" />
                      <span className="hidden sm:inline">Xóa vĩnh viễn</span>
                      <span className="sm:hidden">Xóa</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-2" role="tree" aria-label="Cây danh mục">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Folder className="mb-3 size-10 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">Chưa có danh mục nào</p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  {'Nhấn "Thêm danh mục" để bắt đầu.'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {categories.map((category, index) => (
                  <CategoryTreeNode
                    key={category.id}
                    category={category}
                    depth={0}
                    canMoveUp={index > 0}
                    canMoveDown={index < categories.length - 1}
                    onDelete={handleDelete}
                    onEdit={openEditDialog}
                    onChangeParent={openChangeParentDialog}
                    onAddChild={openCreateDialog}
                    expandedIds={expandedIds}
                    onToggleExpand={toggleExpand}
                    onToggleActive={handleToggleActive}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục{' '}
              <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?
              {deleteTarget && deleteTarget.childrenCount > 0 && (
                <>
                  {' '}
                  Danh mục này có{' '}
                  <span className="font-semibold text-foreground">
                    {deleteTarget.childrenCount} danh mục con
                  </span>
                  .
                </>
              )}{' '}
              Bạn có thể khôi phục danh mục này từ thùng rác sau khi xóa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa danh mục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore confirmation dialog */}
      <AlertDialog open={!!restoreTarget} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Khôi phục danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khôi phục danh mục{' '}
              <span className="font-semibold text-foreground">{restoreTarget?.name}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreTarget && restoreMutation.mutate(restoreTarget.id)}
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending ? 'Đang khôi phục...' : 'Khôi phục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard delete confirmation dialog */}
      <AlertDialog
        open={!!hardDeleteTarget}
        onOpenChange={(open) => !open && setHardDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa vĩnh viễn danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa vĩnh viễn danh mục{' '}
              <span className="font-semibold text-foreground">{hardDeleteTarget?.name}</span>? Thao
              tác này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
              onClick={() => hardDeleteTarget && hardDeleteMutation.mutate(hardDeleteTarget.id)}
              disabled={hardDeleteMutation.isPending}
            >
              {hardDeleteMutation.isPending ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create/Edit category dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => !open && closeFormDialog()}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>
              {editTarget
                ? 'Chỉnh sửa danh mục'
                : parentForNewChild
                  ? `Thêm danh mục con vào "${parentForNewChild.name}"`
                  : 'Thêm danh mục mới'}
            </DialogTitle>
            <DialogDescription>
              {editTarget ? 'Cập nhật thông tin danh mục' : 'Tạo danh mục mới trong hệ thống'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSaveCategory)} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Áo thun"
                {...form.register('name')}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="Ví dụ: ao-thun"
                {...form.register('slug')}
              />
              <p className="text-xs text-muted-foreground">Chỉ chữ thường, số và gạch ngang</p>
              {form.formState.errors.slug && (
                <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả ngắn về danh mục"
                rows={3}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>

            {!editTarget && !parentForNewChild && (
              <div className="grid gap-2">
                <Label htmlFor="parentId">Danh mục cha</Label>
                <Select
                  value={form.watch('parentId')?.toString() || 'null'}
                  onValueChange={(value) =>
                    form.setValue('parentId', value === 'null' ? null : parseInt(value))
                  }
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="Chọn danh mục cha" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-75">
                    <SelectItem value="null">Không có (danh mục gốc)</SelectItem>
                    {flatCategoryList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        <span className="flex items-center gap-1">
                          {cat.depth > 0 && (
                            <span className="text-muted-foreground">
                              {'└─ '.repeat(cat.depth)}
                            </span>
                          )}
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="active">Hiển thị</Label>
              <Switch
                id="active"
                checked={form.watch('active')}
                onCheckedChange={(checked) => form.setValue('active', checked)}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeFormDialog}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Đang lưu...'
                  : editTarget
                    ? 'Cập nhật'
                    : 'Tạo mới'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change parent dialog */}
      <Dialog
        open={!!changeParentTarget}
        onOpenChange={(open) => !open && closeChangeParentDialog()}
      >
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Di chuyển danh mục</DialogTitle>
            <DialogDescription>
              Chọn danh mục cha mới cho{' '}
              <span className="font-semibold text-foreground">{changeParentTarget?.name}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newParent">Danh mục cha mới</Label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger id="newParent">
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-75">
                  <SelectItem value="null">Không có (danh mục gốc)</SelectItem>
                  {flatCategoryListExcludingTarget.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      <span className="flex items-center gap-1">
                        {cat.depth > 0 && (
                          <span className="text-muted-foreground">{'└─ '.repeat(cat.depth)}</span>
                        )}
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeChangeParentDialog}
              disabled={changeParentMutation.isPending}
            >
              Hủy
            </Button>
            <Button onClick={handleChangeParent} disabled={changeParentMutation.isPending}>
              {changeParentMutation.isPending ? 'Đang di chuyển...' : 'Di chuyển'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
