'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, Pencil, Plus, RotateCcw, Search, Trash2, X } from 'lucide-react';
import type { Brand } from '@/lib/api/brands';
import { ApiException } from '@/lib/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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

const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hiển thị' },
  { value: 'inactive', label: 'Ẩn' },
  { value: 'deleted', label: 'Đã xóa' },
];

export default function DashboardBrandsPage() {
  const [panel, setPanel] = useState<{ open: boolean; brand: Brand | null }>({
    open: false,
    brand: null,
  });
  const [deleteTarget, setDeleteTarget] = useState<Brand | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<Brand | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [hardDeleting, setHardDeleting] = useState(false);

  const {
    loading,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    total,
    activeCount,
    inactiveCount,
    deletedCount,
    visibleBrands,
    visibleDeleted,
    handleToggleActive,
    handleDelete,
    handleRestore,
    handleHardDelete,
    reload,
  } = useBrands();

  async function confirmDelete(brand: Brand) {
    setDeleting(true);
    try {
      await handleDelete(brand);
    } catch (e) {
      if (!(e instanceof ApiException)) toast.error('Xóa thất bại');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function confirmRestore(brand: Brand) {
    setRestoring(true);
    try {
      await handleRestore(brand);
    } finally {
      setRestoring(false);
      setRestoreTarget(null);
    }
  }

  async function confirmHardDelete(brand: Brand) {
    setHardDeleting(true);
    try {
      await handleHardDelete(brand);
    } finally {
      setHardDeleting(false);
      setHardDeleteTarget(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thương hiệu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Quản lý thương hiệu sản phẩm</p>
        </div>
        <Button size="sm" className="h-9 shrink-0" onClick={() => setPanel({ open: true, brand: null })}>
          <Plus className="h-4 w-4" />
          Thêm thương hiệu
        </Button>
      </div>

      {/* Search + filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Tìm theo tên thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pr-8 pl-9"
          />
          {search && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Xóa tìm kiếm"
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
            >
              <X />
            </Button>
          )}
        </div>

        <div className="flex h-9 items-center rounded-md border bg-muted/40 p-0.5">
          <ToggleGroup
            type="single"
            value={filterStatus}
            onValueChange={(v) => v && setFilterStatus(v as FilterStatus)}
            className="gap-0"
          >
            {STATUS_FILTERS.map((f) => (
              <ToggleGroupItem
                key={f.value}
                value={f.value}
                className="h-8 rounded px-3 text-sm data-[state=on]:bg-background data-[state=on]:font-medium data-[state=on]:shadow-sm"
              >
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-md border">
        {loading ? (
          <div className="divide-y">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-9 rounded-md" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-8 rounded-full" />
                <Skeleton className="h-3.5 w-16" />
              </div>
            ))}
          </div>
        ) : filterStatus === 'deleted' ? (
          visibleDeleted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Trash2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">
                {search ? `Không tìm thấy "${search}"` : 'Không có thương hiệu nào trong thùng rác'}
              </p>
              {search && (
                <Button variant="link" size="sm" onClick={() => setSearch('')} className="mt-1 h-auto p-0 text-xs">
                  Xóa tìm kiếm
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {visibleDeleted.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-xs font-bold text-muted-foreground/70">
                    {b.logo && b.logo.startsWith('http') ? (
                      <img src={b.logo} alt={b.name} className="h-full w-full object-contain p-1 opacity-50" />
                    ) : (
                      b.name[0].toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-muted-foreground line-through">{b.name}</p>
                    <p className="font-mono text-[11px] text-muted-foreground/70">{b.slug}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreTarget(b)}
                      aria-label={`Khôi phục ${b.name}`}
                      className="h-8 gap-1.5 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      Khôi phục
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setHardDeleteTarget(b)}
                      aria-label={`Xóa vĩnh viễn ${b.name}`}
                      className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Xóa vĩnh viễn
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : visibleBrands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Building2 className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm font-medium">
              {search ? `Không tìm thấy "${search}"` : 'Chưa có thương hiệu nào'}
            </p>
            {search ? (
              <Button variant="link" size="sm" onClick={() => setSearch('')} className="mt-1 h-auto p-0 text-xs">
                Xóa tìm kiếm
              </Button>
            ) : (
              <p className="mt-1 text-xs">Nhấn "Thêm thương hiệu" để bắt đầu.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Thương hiệu</TableHead>
                <TableHead>Đường dẫn</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="text-center">Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleBrands.map((b) => (
                <TableRow key={b.id}>
                  {/* Brand */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-muted text-xs font-bold text-muted-foreground">
                            {b.logo && b.logo.startsWith('http') ? (
                              <img src={b.logo} alt={b.name} className="h-full w-full object-contain p-1" />
                            ) : (
                              b.name[0].toUpperCase()
                            )}
                          </div>
                        </TooltipTrigger>
                        {b.logo && b.logo.startsWith('http') ? (
                          <TooltipContent side="right" className="p-2">
                            <img src={b.logo} alt={b.name} className="h-40 w-40 rounded-md object-contain" />
                            <p className="mt-1.5 text-center text-xs text-muted-foreground">{b.name}</p>
                          </TooltipContent>
                        ) : (
                          <TooltipContent side="right"><p>Chưa có logo</p></TooltipContent>
                        )}
                      </Tooltip>
                      <span className={cn('text-sm font-medium', b.active ? 'text-foreground' : 'text-muted-foreground/70')}>
                        {b.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Slug */}
                  <TableCell className="font-mono text-xs text-muted-foreground">{b.slug}</TableCell>

                  {/* Description */}
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                    {b.description ?? <span className="text-muted-foreground/40">—</span>}
                  </TableCell>

                  {/* Toggle */}
                  <TableCell className="text-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                          <span className={cn(
                            'inline-flex h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200',
                            b.active ? 'translate-x-4' : 'translate-x-0.5',
                          )} />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{b.active ? 'Đang hiển thị — nhấn để ẩn' : 'Đang ẩn — nhấn để hiển thị'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                    {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600"
                            onClick={() => setPanel({ open: true, brand: b })}
                            aria-label={`Sửa ${b.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Chỉnh sửa</p></TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setDeleteTarget(b)}
                            aria-label={`Xóa ${b.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top"><p>Xóa</p></TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Footer count — chỉ khi search active */}
        {!loading && filterStatus !== 'deleted' && search && visibleBrands.length > 0 && (
          <div className="border-t px-4 py-2.5 text-xs text-muted-foreground/70">
            {visibleBrands.length} kết quả cho &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* Panel */}
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
              disabled={deleting}
            >
              {deleting ? 'Đang xóa...' : 'Xóa'}
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
              disabled={restoring}
            >
              {restoring ? 'Đang khôi phục...' : 'Khôi phục'}
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
            <AlertDialogTitle>Xóa vĩnh viễn &ldquo;{hardDeleteTarget?.name}&rdquo;?</AlertDialogTitle>
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
              disabled={hardDeleting}
            >
              {hardDeleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
