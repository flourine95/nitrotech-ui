'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Building2, MoreHorizontal, Plus, RotateCcw, SearchIcon, Trash2, XIcon } from 'lucide-react';
import type { Brand } from '@/lib/api/admin/brands';
import { ApiException } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { DashboardFilterDropdown } from '@/components/dashboard/filter-dropdown';
import { MultipleSortPopover } from '@/components/dashboard/multiple-sort-popover';
import { PageSizeDropdown } from '@/components/dashboard/page-size-dropdown';
import { StatusChip } from '@/components/dashboard/status-chip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { useSimplePagination } from '@/hooks/use-simple-pagination';

const SORT_OPTIONS = [
  { value: 'name', label: 'Tên' },
  { value: 'createdAt', label: 'Ngày tạo' },
];

const STATUS_FILTER_OPTIONS: Array<{ value: FilterStatus; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'active', label: 'Hiển thị' },
  { value: 'inactive', label: 'Ẩn' },
  { value: 'deleted', label: 'Đã xóa' },
];

function BrandLogo({ brand, dimmed }: { brand: Brand; dimmed: boolean }) {
  return (
    <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-xs font-bold text-muted-foreground">
      {brand.logo?.startsWith('http') ? (
        <img
          src={brand.logo}
          alt={brand.name}
          className={cn('size-full object-contain p-1', dimmed && 'opacity-50')}
        />
      ) : (
        brand.name[0].toUpperCase()
      )}
    </div>
  );
}

function BrandRowsSkeleton({ count, isDeleted }: { count: number; isDeleted: boolean }) {
  return Array.from({ length: count }).map((_, index) => (
    <TableRow key={index}>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-lg" />
          <div className="grid gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
      <TableCell><Skeleton className="h-4 w-56" /></TableCell>
      {!isDeleted ? <TableCell><Skeleton className="mx-auto h-5 w-16" /></TableCell> : null}
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell className="pr-4"><Skeleton className="ml-auto size-8 rounded-lg" /></TableCell>
    </TableRow>
  ));
}

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
    displayPage,
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

  const pagination = useSimplePagination({ currentPage: displayPage, totalPages });
  const shownFrom = totalElements > 0 ? displayPage * size + 1 : 0;
  const shownTo = Math.min((displayPage + 1) * size, totalElements);
  const activeFilterCount = (search ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0) + (sortRules.length ? 1 : 0);

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
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] w-auto max-w-none flex-col gap-4 overflow-hidden p-4 lg:-m-5 lg:p-5 2xl:-m-6 2xl:p-6">
      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-card 2xl:size-11">
            <Building2 />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight 2xl:text-2xl">Thương hiệu</h1>
            <p className="mt-1 text-sm text-muted-foreground">Quản lý thương hiệu sản phẩm và trạng thái hiển thị.</p>
          </div>
        </div>
        <Button
          className="h-10 w-full rounded-xl px-4 sm:w-fit"
          onClick={() => setPanel({ open: true, brand: null })}
        >
          <Plus data-icon="inline-start" />
          Thêm thương hiệu
        </Button>
      </section>

      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên thương hiệu..."
              className="h-9 w-56 rounded-xl pr-8 pl-9 lg:w-72"
            />
            {search ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Xóa tìm kiếm"
                className="absolute inset-y-0 right-1 my-auto size-7"
                onClick={() => setSearch('')}
              >
                <XIcon />
              </Button>
            ) : null}
          </div>
          <DashboardFilterDropdown
            label="Trạng thái"
            value={filterStatus}
            options={STATUS_FILTER_OPTIONS}
            onChange={(value) => setFilterStatus(value as FilterStatus)}
          />
          <MultipleSortPopover
            value={sortRules.length ? sortRules.map((rule) => `${rule.field},${rule.direction}`).join(';') : 'createdAt,desc'}
            fields={SORT_OPTIONS}
            onChange={(value) => {
              setSortRules(value.split(';').map((rule) => {
                const [field, direction] = rule.split(',');
                return { field, direction: direction === 'asc' ? 'asc' : 'desc' };
              }));
            }}
          />
          {activeFilterCount > 0 ? (
            <Button variant="ghost" className="h-9 rounded-xl" onClick={resetFilters}>
              <XIcon data-icon="inline-start" />
              Xóa lọc
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip>{totalElements} thương hiệu</StatusChip>
          {activeFilterCount > 0 ? <StatusChip tone="warning">{activeFilterCount} bộ lọc</StatusChip> : null}
        </div>
      </section>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <div className="min-h-0 flex-1 overflow-auto">
          {isError ? (
            <div className="flex h-full min-h-80 flex-col items-center justify-center py-16 text-muted-foreground">
              <Building2 className="mb-3 size-10 text-destructive/40" />
              <p className="text-sm font-medium text-foreground">Không thể tải thương hiệu</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => reload()}>
                Thử lại
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="pl-4">Thương hiệu</TableHead>
                  <TableHead>Đường dẫn</TableHead>
                  <TableHead>Mô tả</TableHead>
                  {!isDeleted ? <TableHead className="text-center">Trạng thái</TableHead> : null}
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <BrandRowsSkeleton count={size} isDeleted={isDeleted} />
                ) : brands.length ? (
                  brands.map((brand) => (
                    <TableRow key={brand.id} className={cn(isFetching && 'pointer-events-none')}>
                      <TableCell className="pl-4">
                        <div className="flex min-w-52 items-center gap-3">
                          <BrandLogo brand={brand} dimmed={isDeleted} />
                          <span
                            className={cn(
                              'truncate text-sm font-medium',
                              isDeleted
                                ? 'text-muted-foreground line-through'
                                : brand.active
                                  ? 'text-foreground'
                                  : 'text-muted-foreground/70',
                            )}
                          >
                            {brand.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-muted-foreground">{brand.slug}</span>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {brand.description ? (
                          <span className="block truncate text-sm text-muted-foreground">{brand.description}</span>
                        ) : (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                      {!isDeleted ? (
                        <TableCell>
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleToggleActive(brand)}
                              role="switch"
                              aria-checked={brand.active}
                              aria-label={brand.active ? `Ẩn ${brand.name}` : `Hiển thị ${brand.name}`}
                              className={cn(
                                'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
                                'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
                                brand.active ? 'bg-primary' : 'bg-muted-foreground/30',
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-flex size-4 transform rounded-full bg-white shadow transition-transform duration-200',
                                  brand.active ? 'translate-x-4' : 'translate-x-0.5',
                                )}
                              />
                            </button>
                          </div>
                        </TableCell>
                      ) : null}
                      <TableCell>
                        <span className="whitespace-nowrap text-sm text-muted-foreground">
                          {new Date(brand.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon-sm" aria-label={`Mở thao tác cho ${brand.name}`}>
                                <MoreHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {isDeleted ? (
                                <>
                                  <DropdownMenuItem onClick={() => setRestoreTarget(brand)}>
                                    Khôi phục
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem variant="destructive" onClick={() => setHardDeleteTarget(brand)}>
                                    Xóa vĩnh viễn
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <>
                                  <DropdownMenuItem onClick={() => setPanel({ open: true, brand })}>
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(brand)}>
                                    Xóa
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isDeleted ? 5 : 6}>
                      <div className="flex min-h-72 flex-col items-center justify-center text-muted-foreground">
                        {isDeleted ? (
                          <Trash2 className="mb-3 size-10 text-muted-foreground/40" />
                        ) : (
                          <Building2 className="mb-3 size-10 text-muted-foreground/40" />
                        )}
                        <p className="text-sm font-medium text-foreground">
                          {search
                            ? `Không tìm thấy "${search}"`
                            : isDeleted
                              ? 'Không có thương hiệu nào trong thùng rác'
                              : 'Chưa có thương hiệu nào'}
                        </p>
                        {!search && !isDeleted ? (
                          <p className="mt-1 text-xs">Nhấn nút thêm thương hiệu để bắt đầu.</p>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
        {!isLoading && totalElements > 0 ? (
          <div className="shrink-0 border-t border-dashed border-border/70 px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Hiển thị {shownFrom}-{shownTo} trong {totalElements} thương hiệu
                </p>
                <PageSizeDropdown value={size} options={pageSizeOptions} onChange={setSize} />
              </div>
              {totalPages > 1 ? (
                <Pagination className="mx-0! ml-auto w-auto justify-end">
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-xl px-3 shadow-none"
                        disabled={!pagination.canGoPrevious}
                        onClick={() => setPage(pagination.previousPage)}
                      >
                        Trước
                      </Button>
                    </PaginationItem>
                    <PaginationItem>
                      <span className="inline-flex h-9 min-w-28 items-center justify-center rounded-xl border border-primary bg-primary px-3 text-sm font-medium text-primary-foreground">
                        Trang {pagination.currentPageLabel} / {pagination.totalPages}
                      </span>
                    </PaginationItem>
                    <PaginationItem>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-xl px-3 shadow-none"
                        disabled={!pagination.canGoNext}
                        onClick={() => setPage(pagination.nextPage)}
                      >
                        Sau
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              ) : null}
            </div>
          </div>
        ) : null}
      </main>

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
