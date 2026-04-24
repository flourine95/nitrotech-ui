'use client';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/dashboard/filter-chip';
import type { SortValue } from './utils';
import { SORT_OPTIONS } from './utils';

interface FilterChipsProps {
  search: string;
  filterStatus: string;
  filterCategoryId: number | null;
  filterBrandId: number | null;
  sortBy: SortValue;
  categoryName?: string;
  brandName?: string;
  totalElements: number;
  onClearSearch: () => void;
  onClearCategory: () => void;
  onClearBrand: () => void;
  onClearSort: () => void;
  onClearAll: () => void;
}

const DEFAULT_SORT: SortValue = 'createdAt,desc';

export function ProductFilterChips({
  search,
  filterCategoryId,
  filterBrandId,
  sortBy,
  categoryName,
  brandName,
  totalElements,
  onClearSearch,
  onClearCategory,
  onClearBrand,
  onClearSort,
  onClearAll,
}: FilterChipsProps) {
  const hasSearch = !!search;
  const hasCategory = !!filterCategoryId;
  const hasBrand = !!filterBrandId;
  const hasSort = sortBy !== DEFAULT_SORT;
  const hasAny = hasSearch || hasCategory || hasBrand || hasSort;

  if (!hasAny) return null;

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">{totalElements} kết quả</span>

      {hasSearch && <FilterChip label={`"${search}"`} onRemove={onClearSearch} />}
      {hasCategory && categoryName && (
        <FilterChip label={categoryName} onRemove={onClearCategory} />
      )}
      {hasBrand && brandName && <FilterChip label={brandName} onRemove={onClearBrand} />}
      {hasSort && sortLabel && <FilterChip label={sortLabel} onRemove={onClearSort} />}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-7 px-2 text-xs text-muted-foreground"
      >
        Xóa tất cả
      </Button>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onRemove}
      className="h-7 gap-1 px-2 text-xs font-normal"
    >
      {label}
      <X className="h-3 w-3" />
    </Button>
  );
}
