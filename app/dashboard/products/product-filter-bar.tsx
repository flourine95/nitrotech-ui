'use client';
import { memo, startTransition, useEffect, useRef, useState } from 'react';
import { Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Category } from '@/lib/api/categories';
import type { Brand } from '@/lib/api/brands';
import { SORT_OPTIONS, type SortValue } from './utils';

export const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'Tất cả' },
  { value: 'active', label: 'Hiển thị' },
  { value: 'inactive', label: 'Ẩn' },
  { value: 'deleted', label: 'Đã xóa' },
];

export type FilterStatus = 'all' | 'active' | 'inactive' | 'deleted';

interface ProductFilterBarProps {
  searchValue: string;
  filterStatus: FilterStatus;
  filterCategoryId: number | null;
  filterBrandId: number | null;
  sortBy: SortValue;
  categories: Category[];
  brands: Brand[];
  onSearchCommit: (val: string) => void;
  onStatusChange: (val: FilterStatus) => void;
  onCategoryChange: (val: number | null) => void;
  onBrandChange: (val: number | null) => void;
  onSortChange: (val: SortValue) => void;
}

export const ProductFilterBar = memo(function ProductFilterBar({
  searchValue,
  filterStatus,
  filterCategoryId,
  filterBrandId,
  sortBy,
  categories,
  brands,
  onSearchCommit,
  onStatusChange,
  onCategoryChange,
  onBrandChange,
  onSortChange,
}: ProductFilterBarProps) {
  const [inputVal, setInputVal] = useState(searchValue);
  const [localStatus, setLocalStatus] = useState(filterStatus);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputVal(searchValue);
  }, [searchValue]);
  useEffect(() => {
    setLocalStatus(filterStatus);
  }, [filterStatus]);

  function handleInputChange(val: string) {
    setInputVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchCommit(val), 300);
  }

  function handleStatusChange(val: FilterStatus) {
    setLocalStatus(val);
    startTransition(() => onStatusChange(val));
  }

  const activeFilterCount = [
    filterCategoryId !== null,
    filterBrandId !== null,
    sortBy !== 'createdAt,desc',
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm tên, slug..."
          value={inputVal}
          onChange={(e) => handleInputChange(e.target.value)}
          className="h-9 pr-8 pl-9"
        />
        {inputVal && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Xóa tìm kiếm"
            onClick={() => {
              setInputVal('');
              onSearchCommit('');
              if (debounceRef.current) clearTimeout(debounceRef.current);
            }}
            className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
          >
            <X />
          </Button>
        )}
      </div>

      {/* Status — ToggleGroup */}
      <div className="flex h-9 items-center rounded-md border bg-muted/40 p-0.5">
        <ToggleGroup
          type="single"
          value={localStatus}
          onValueChange={(v) => v && handleStatusChange(v as FilterStatus)}
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

      {/* Advanced filters — popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-9 gap-1.5">
            <Filter />
            Bộ lọc
            {activeFilterCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-3">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Danh mục</span>
              <Select
                value={filterCategoryId ? String(filterCategoryId) : 'all'}
                onValueChange={(v) => onCategoryChange(v === 'all' ? null : Number(v))}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Thương hiệu</span>
              <Select
                value={filterBrandId ? String(filterBrandId) : 'all'}
                onValueChange={(v) => onBrandChange(v === 'all' ? null : Number(v))}
              >
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Tất cả thương hiệu" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  <SelectItem value="all">Tất cả thương hiệu</SelectItem>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Sắp xếp</span>
              <Select value={sortBy} onValueChange={(v) => onSortChange(v as SortValue)}>
                <SelectTrigger className="h-8 w-full text-sm">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={4}>
                  {SORT_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
});
