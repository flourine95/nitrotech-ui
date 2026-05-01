'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, MoreHorizontal, Plus, RotateCcw, Trash2 } from 'lucide-react';
import type { Brand } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { DataTableToolbar } from '@/components/data-table-toolbar';
import { BrandPanel } from './brand-panel';
import { useBrands, type FilterStatus } from './use-brands';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên' },
  { value: 'createdAt', label: 'Ngày tạo' },
];

export default function DashboardBrandsPage() {
  const [panel, setPanel] = useState<{ open: boolean; brand: Brand | null }>({
    open: false,
    brand: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Brand | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Brand | null>(null);
  const [acting, setActing] = useState(false);

  const {
    brands,
    totalElements,
    totalPages,
    isLoading,
    isFetching,
    isError,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    page,
    setPage,
    size,
    setSize,
    pageSizeOptions,
    sortRules,
    setSortRules,
    handleToggleActive,
    handleDelete,
    handleRestore,
    handleHardDelete,
    resetFilters,
    reload,
  } = useBrands();

  const isDeleted = filterStatus === 'deleted';

  const columns: DataTableColumn<Brand>[] = [
    {
      key: 'name',
      header: 'Thương hiệu',
      cell: (b) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-xs font-bold text-muted-foreground">
            {b.logo?.startsWith('http') ? (
              <img
                src={b.logo}
                alt={b.name}
                className={cn('h-full w-full object-contain p-1', isDeleted && 'opacity-50')}
              />
            ) : (
              b.name[0].toUpperCase()
            )}
          </div>
          <span
            className={cn(
              'text-sm font-medium',
              isDeleted
                ? 'text-muted-foreground line-through'
                : b.active
                  ? 'text-foreground'
                  : 'text-muted-foreground/70',
            )}
          >
            {b.name}
          </span>
        </div>
      ),
    },
    {
      key: 'slug',
      header: 'Đường dẫn',
      cell: (b) => <span className="font-mono text-xs text-muted-foreground">{b.slug}</span>,
    },
    {
      key: 'description',
      header: 'Mô tả',
      className: 'max-w-xs',
      cell: (b) =>
        b.description ? (
          <span className="truncate text-sm text-muted-foreground">{b.description}</span>
        ) : (
          <span className="text-muted-foreground/40">—</span>
        ),
    },
    {
      key: 'active',
      header: <span className="block text-center">Trạng thái</span>,
      className: 'text-center',
      hidden: isDeleted,
      cell: (b) => (
        <div className="flex justify-center">
          <button
            onClick={() => handleToggleActive(b)}
            role="switch"
            aria-checked={b.active}
            aria-label={b.active ? `Ẩn ${b.name}` : `Hiển thị ${b.name}`}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              b.active ? 'bg-primary' : 'bg-muted-foreground/30',
            )}
          >
            <span
              className={cn(
                'inline-flex h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                b.active ? 'translate-x-4' : 'translate-x-0.5',
              )}
            />
          </button>
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Ngày tạo',
      cell: (b) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {new Date(b.createdAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      cell: (b) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Thao tác</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isDeleted ? (
                <>
                  <DropdownMenuItem onClick={() => setRestoreTarget(b)}>
                    Khôi phục
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setHardDeleteTarget(b)}>
                    Xóa vĩnh viễn
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => setPanel({ open: true, brand: b })}>
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(b)}>
                    Xóa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  async function confirmDelete(brand: Brand) {
    setActing(true);
    try {
      await handleDelete(brand);
    } catch (e) {
      if (!(e instanceof ApiException)) toast.error('Xóa thất bại');
    } finally {
      setActing(false);
      setDeleteTarget(null);
    }
  }

  async function confirmRestore(brand: Brand) {
    setActing(true);
    try {
      await handleRestore(brand);
    } finally {
      setActing(false);
      setRestoreTarget(null);
    }
  }

  async function confirmHardDelete(brand: Brand) {
    setActing(true);
    try {
      await handleHardDelete(brand);
    } finally {
      setActing(false);
      setHardDeleteTarget(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Thương hiệu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Quản lý thương hiệu sản phẩm</p>
      </div>

      <DataTableToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên thương hiệu..."
        filters={[
          {
            key: 'status',
            label: 'Trạng thái',
            options: [
              { value: 'active', label: 'Hiển thị' },
              { value: 'inactive', label: 'Ẩn' },
              { value: 'deleted', label: 'Đã xóa' },
            ],
            selected: filterStatus === 'all' ? [] : [filterStatus],
            onChange: (values) => {
              const val = values[values.length - 1];
              setFilterStatus((val as FilterStatus) ?? 'all');
            },
          },
        ]}
        sortOptions={SORT_OPTIONS}
        sortRules={sortRules}
        onSortChange={setSortRules}
        onResetFilters={resetFilters}
        extra={
          <Button
            size="sm"
            className="h-8 shrink-0"
            onClick={() => setPanel({ open: true, brand: null })}
          >
            <Plus className="h-4 w-4" />
            Thêm thương hiệu
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={brands}
        rowKey={(b) => b.id}
        loading={isLoading}
        isFetching={isFetching}
        isError={isError}
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={size}
        pageSizeOptions={pageSizeOptions}
        onPageChange={setPage}
        onPageSizeChange={setSize}
        rowLabel="thương hiệu"
        emptyIcon={
          isDeleted ? (
            <Trash2 className="h-10 w-10 text-muted-foreground/40" />
          ) : (
            <Building2 className="h-10 w-10 text-muted-foreground/40" />
          )
        }
        emptyTitle={
          search
            ? `Không tìm thấy "${search}"`
            : isDeleted
              ? 'Không có thương hiệu nào trong thùng rác'
              : 'Chưa có thương hiệu nào'
        }
        emptyDescription={
          !search && !isDeleted ? 'Nhấn "Thêm thương hiệu" để bắt đầu.' : undefined
        }
      />

      {panel.open && (
        <BrandPanel
          brand={panel.brand}
          onClose={() => setPanel({ open: false, brand: null })}
          onSaved={() => {
            reload();
            setPanel({ open: false, brand: null });
          }}
        />
      )}

      {/* Delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Xóa &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Thương hiệu sẽ được chuyển vào thùng rác. Bạn có thể khôi phục lại sau.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteTarget && confirmDelete(deleteTarget)}
              disabled={acting}
            >
              {acting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore dialog */}
      <AlertDialog open={!!restoreTarget} onOpenChange={(v) => !v && setRestoreTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-emerald-100 text-emerald-600">
              <RotateCcw className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Khôi phục &ldquo;{restoreTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              Thương hiệu sẽ hiển thị trở lại trên cửa hàng.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreTarget && confirmRestore(restoreTarget)}
              disabled={acting}
            >
              {acting ? 'Đang khôi phục...' : 'Khôi phục'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hard delete dialog */}
      <AlertDialog open={!!hardDeleteTarget} onOpenChange={(v) => !v && setHardDeleteTarget(null)}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>
              Xóa vĩnh viễn &ldquo;{hardDeleteTarget?.name}&rdquo;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này không thể hoàn tác. Thương hiệu sẽ bị xóa hoàn toàn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => hardDeleteTarget && confirmHardDelete(hardDeleteTarget)}
              disabled={acting}
            >
              {acting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
