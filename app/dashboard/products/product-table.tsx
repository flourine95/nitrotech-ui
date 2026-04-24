'use client';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Ellipsis, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Product } from '@/lib/api/products';
import { formatPrice, PAGE_SIZE_OPTIONS, type PageSizeOption } from './utils';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  isFetching: boolean;
  isDeleted: boolean;
  selectedIds: Set<number>;
  allSelected: boolean;
  someSelected: boolean;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  toggleActivePending: boolean;
  onToggleSelect: (id: number) => void;
  onToggleSelectAll: () => void;
  onToggleActive: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRestore: (product: Product) => void;
  onHardDelete: (product: Product) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSizeOption) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ProductTable({
  products,
  loading,
  isFetching,
  isDeleted,
  selectedIds,
  allSelected,
  someSelected,
  currentPage,
  totalPages,
  totalElements,
  pageSize,
  toggleActivePending,
  onToggleSelect,
  onToggleSelectAll,
  onToggleActive,
  onDelete,
  onRestore,
  onHardDelete,
  onPageChange,
  onPageSizeChange,
  onClearFilters,
  hasActiveFilters,
}: ProductTableProps) {
  const from = totalElements === 0 ? 0 : currentPage * pageSize + 1;
  const to = Math.min((currentPage + 1) * pageSize, totalElements);
  return (
    <div className="rounded-md border">
      {loading ? (
        <div className="divide-y">
          {Array.from({ length: pageSize }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-10 w-10 animate-pulse rounded-md bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-3 w-32 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-5 w-8 animate-pulse rounded bg-muted" />
              <div className="h-5 w-8 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Package className="mb-3 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">
            {hasActiveFilters
              ? 'Không tìm thấy sản phẩm nào phù hợp'
              : isDeleted
                ? 'Không có sản phẩm nào đã xóa'
                : 'Chưa có sản phẩm nào'}
          </p>
          {hasActiveFilters && (
            <Button
              variant="link"
              size="sm"
              onClick={onClearFilters}
              className="mt-1 h-auto p-0 text-xs"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className={isFetching ? 'pointer-events-none opacity-50 transition-opacity duration-150' : 'transition-opacity duration-150'}>
          <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10 px-4">
                <Checkbox
                  checked={someSelected ? 'indeterminate' : allSelected}
                  onCheckedChange={onToggleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </TableHead>
              <TableHead>Sản phẩm</TableHead>
              <TableHead className="text-right">Giá</TableHead>
              <TableHead className="text-center">Biến thể</TableHead>
              {!isDeleted && <TableHead className="text-center">Trạng thái</TableHead>}
              <TableHead>Ngày tạo</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} data-state={selectedIds.has(p.id) ? 'selected' : undefined}>
                <TableCell className="px-4">
                  <Checkbox
                    checked={selectedIds.has(p.id)}
                    onCheckedChange={() => onToggleSelect(p.id)}
                    aria-label={`Chọn ${p.name}`}
                  />
                </TableCell>

                {/* Product */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                          {p.thumbnail?.startsWith('http') ? (
                            <Image
                              src={p.thumbnail}
                              alt={p.name}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <Package className="absolute inset-0 m-auto h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </TooltipTrigger>
                      {p.thumbnail?.startsWith('http') && (
                        <TooltipContent side="right" className="p-1.5">
                          <Image
                            src={p.thumbnail}
                            alt={p.name}
                            width={160}
                            height={160}
                            className="rounded object-contain"
                          />
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <div className="min-w-0">
                      <span
                        className={`block truncate text-sm font-medium ${!p.active ? 'text-muted-foreground' : ''}`}
                      >
                        {p.name}
                      </span>
                      {(p.categoryName || p.brandName) && (
                        <span className="text-xs text-muted-foreground">
                          {[p.categoryName, p.brandName].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Category / Brand — removed, now inline above */}

                {/* Price */}
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatPrice(p.priceMin, p.priceMax)}
                </TableCell>

                {/* Variants */}
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-normal">
                    {p.variantCount}
                  </Badge>
                </TableCell>

                {/* Status toggle */}
                {!isDeleted && (
                  <TableCell className="text-center">
                    <Switch
                      checked={p.active}
                      onCheckedChange={() => onToggleActive(p)}
                      disabled={toggleActivePending}
                      aria-label={p.active ? 'Đang hiển thị' : 'Đang ẩn'}
                    />
                  </TableCell>
                )}

                {/* Created at */}
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(p.createdAt).toLocaleDateString('vi-VN')}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full text-muted-foreground"
                          aria-label={`Hành động cho ${p.name}`}
                        >
                          <Ellipsis className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {isDeleted ? (
                          <>
                            <DropdownMenuItem onClick={() => onRestore(p)}>
                              Khôi phục
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onHardDelete(p)}>
                              Xóa vĩnh viễn
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/products/${p.id}`}>Xem chi tiết</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/products/${p.id}/edit`}>Chỉnh sửa</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onToggleActive(p)}>
                              {p.active ? 'Ẩn' : 'Hiển thị'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(p)}>
                              Xóa
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          </Table>
        </div>
      )}

      {/* Footer */}
      {!loading && totalElements > 0 && (
        <div className="flex items-center justify-between gap-4 border-t px-4 py-3 text-sm text-muted-foreground">
          {/* Left: range + page size */}
          <div className="flex items-center gap-2">
            <span>{from}–{to} / {totalElements} sản phẩm</span>
            <span className="text-border">|</span>
            <div className="flex items-center gap-1.5">
              <span>Hiển thị</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => onPageSizeChange(Number(v) as PageSizeOption)}
              >
                <SelectTrigger className="h-8 w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: pagination */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(0)}
              disabled={currentPage === 0}
              aria-label="Trang đầu"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const page =
                totalPages <= 5
                  ? i
                  : currentPage < 3
                    ? i
                    : currentPage > totalPages - 3
                      ? totalPages - 5 + i
                      : currentPage - 2 + i;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'outline' : 'ghost'}
                  size="icon"
                  className={`h-8 w-8 text-sm ${currentPage === page ? 'font-medium text-foreground' : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page + 1}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(totalPages - 1)}
              disabled={currentPage >= totalPages - 1}
              aria-label="Trang cuối"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
