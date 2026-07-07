'use client';
import { memo, type ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Check,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { DashboardFilterDropdown } from '@/components/dashboard/filter-dropdown';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRangePicker } from '@/components/date-range-picker';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface FilterOption {
  value: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export interface FilterChip {
  key: string;
  label: string;
  icon?: ReactNode;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export interface SortOption {
  value: string;
  label: string;
}

export interface SortRule {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ColumnVisibilityItem {
  key: string;
  label: string;
  visible: boolean;
}

export interface DateRangeFilter {
  key: string;
  label: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
}

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterChip[];
  dateFilters?: DateRangeFilter[];
  sortOptions?: SortOption[];
  sortRules?: SortRule[];
  onSortChange?: (rules: SortRule[]) => void;
  maxSortRules?: number;
  columns?: ColumnVisibilityItem[];
  onColumnVisibilityChange?: (key: string, visible: boolean) => void;
  onResetFilters?: () => void;
  extra?: ReactNode;
}

function FilterChipButton({ filter }: { filter: FilterChip }) {
  const allValue = '__all';
  return (
    <DashboardFilterDropdown
      label={filter.label}
      value={filter.selected[0] ?? allValue}
      options={[{ value: allValue, label: `Tất cả ${filter.label.toLowerCase()}` }, ...filter.options]}
      onChange={(value) => filter.onChange(value === allValue ? [] : [value])}
    />
  );
}

function SortButton({
  options,
  rules,
  onChange,
  maxRules = Infinity,
}: {
  options: SortOption[];
  rules: SortRule[];
  onChange: (rules: SortRule[]) => void;
  maxRules?: number;
}) {
  const hasRules = rules.length > 0;

  function addRule() {
    const usedFields = new Set(rules.map((r) => r.field));
    const next = options.find((o) => !usedFields.has(o.value));
    if (!next) return;
    onChange([...rules, { field: next.value, direction: 'desc' }]);
  }

  function updateField(index: number, field: string) {
    onChange(rules.map((r, i) => (i === index ? { ...r, field } : r)));
  }

  function updateDirection(index: number, direction: 'asc' | 'desc') {
    onChange(rules.map((r, i) => (i === index ? { ...r, direction } : r)));
  }

  function removeRule(index: number) {
    onChange(rules.filter((_, i) => i !== index));
  }

  function moveRule(from: number, to: number) {
    const next = [...rules];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-9 rounded-xl px-3 gap-1.5 font-normal shadow-none">
          <ArrowDownUp data-icon="inline-start" className="text-muted-foreground" />
          Sắp xếp
          {hasRules && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4.5 rounded-sm px-1 text-[10px] font-normal"
            >
              {rules.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="flex w-full max-w-sm flex-col gap-3.5 p-4 sm:min-w-95"
      >
        <div className="flex flex-col gap-1">
          <h4 className="leading-none font-medium">Sắp xếp theo</h4>
        </div>

        {rules.length > 0 && (
          <div className="flex flex-col gap-2">
            {rules.map((rule, i) => {
              const usedFields = new Set(rules.filter((_, j) => j !== i).map((r) => r.field));
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => i > 0 && moveRule(i, i - 1)}
                      disabled={i === 0}
                      className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                      aria-label="Lên"
                    >
                      <ArrowUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => i < rules.length - 1 && moveRule(i, i + 1)}
                      disabled={i === rules.length - 1}
                      className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                      aria-label="Xuống"
                    >
                      <ArrowDown className="size-3" />
                    </button>
                  </div>

                  <Select value={rule.field} onValueChange={(v) => updateField(i, v)}>
                    <SelectTrigger className="h-9 flex-1 rounded-xl font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="z-200">
                      {options.map((o) => (
                        <SelectItem
                          key={o.value}
                          value={o.value}
                          disabled={usedFields.has(o.value)}
                        >
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={rule.direction}
                    onValueChange={(v) => updateDirection(i, v as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="h-9 w-28 shrink-0 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4} className="z-200">
                      <SelectItem value="desc">Giảm dần</SelectItem>
                      <SelectItem value="asc">Tăng dần</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0 rounded-lg"
                    onClick={() => removeRule(i)}
                    aria-label="Xóa tiêu chí"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            className="h-9 gap-1.5 rounded-xl px-3"
            onClick={addRule}
            disabled={rules.length >= options.length || rules.length >= maxRules}
          >
            <Plus data-icon="inline-start" />
            Thêm tiêu chí
          </Button>
          {hasRules && (
            <Button
              variant="outline"
              className="h-9 rounded-xl px-3"
              onClick={() => onChange([])}
            >
              Đặt lại
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ViewButton({
  columns,
  onChange,
}: {
  columns: ColumnVisibilityItem[];
  onChange: (key: string, visible: boolean) => void;
}) {
  const hiddenCount = columns.filter((c) => !c.visible).length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 rounded-xl px-3 gap-1.5 font-normal shadow-none"
          aria-label="Toggle columns"
        >
          <Settings2 data-icon="inline-start" className="text-muted-foreground" />
          Hiển thị cột
          {hiddenCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-0.5 h-4.5 rounded-sm px-1 text-[10px] font-normal"
            >
              {hiddenCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 p-0">
        <div className="p-1">
          <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Hiển thị cột</p>
          {columns.map((col) => (
            <button
              key={col.key}
              type="button"
              onClick={() => onChange(col.key, !col.visible)}
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
            >
              <span
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                  col.visible
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-input',
                )}
              >
                {col.visible && <Check className="size-3" />}
              </span>
              <span>{col.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const DataTableToolbar = memo(function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters,
  dateFilters,
  sortOptions,
  sortRules = [],
  onSortChange,
  maxSortRules,
  columns,
  onColumnVisibilityChange,
  onResetFilters,
  extra,
}: DataTableToolbarProps) {
  const [inputVal, setInputVal] = useState(searchValue);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputVal(searchValue);
  }, [searchValue]);

  function handleChange(val: string) {
    setInputVal(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onSearchChange(val), 300);
  }

  function handleClear() {
    setInputVal('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearchChange('');
  }

  const hasActiveFilters =
    !!searchValue ||
    filters?.some((f) => f.selected.length > 0) ||
    dateFilters?.some((f) => f.value?.from || f.value?.to) ||
    (sortRules?.length ?? 0) > 0;

  return (
    <div className="flex w-full flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={inputVal}
            onChange={(e) => handleChange(e.target.value)}
            className="h-9 w-56 rounded-xl pr-8 pl-9 text-sm lg:w-72"
          />
          {inputVal && (
            <button
              type="button"
              aria-label="Xóa tìm kiếm"
              onClick={handleClear}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground opacity-70 hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {filters?.map((filter) => (
          <FilterChipButton key={filter.key} filter={filter} />
        ))}

        {dateFilters?.map((filter) => (
          <DateRangePicker
            key={filter.key}
            label={filter.label}
            value={filter.value}
            onChange={filter.onChange}
          />
        ))}

        {hasActiveFilters && onResetFilters && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="h-9 rounded-xl gap-1.5 border-dashed px-3 font-normal"
          >
            <X data-icon="inline-start" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {sortOptions && sortOptions.length > 0 && onSortChange && (
          <SortButton options={sortOptions} rules={sortRules} onChange={onSortChange} maxRules={maxSortRules} />
        )}
        {columns && columns.length > 0 && onColumnVisibilityChange && (
          <ViewButton columns={columns} onChange={onColumnVisibilityChange} />
        )}
        {extra}
      </div>
    </div>
  );
});
