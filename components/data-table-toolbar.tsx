'use client';
import { memo, type ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowDownUp,
  ArrowUp,
  Check,
  CirclePlus,
  CircleX,
  Plus,
  Search,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
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
  const hasSelection = filter.selected.length > 0;
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const visible = filter.options.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase()),
  );

  function toggle(value: string) {
    const next = filter.selected.includes(value)
      ? filter.selected.filter((v) => v !== value)
      : [...filter.selected, value];
    filter.onChange(next);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setSearch('');
      }}
    >
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
          className={cn(
            'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-dashed bg-background px-3 text-sm font-normal shadow-xs select-none',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none',
            'transition-colors',
          )}
        >
          {hasSelection ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label={`Xóa bộ lọc ${filter.label}`}
              onClick={(e) => {
                e.stopPropagation();
                filter.onChange([]);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.stopPropagation();
                  filter.onChange([]);
                }
              }}
              className="rounded opacity-60 hover:opacity-100 [&_svg]:size-3.5"
            >
              <CircleX />
            </span>
          ) : (
            <CirclePlus className="size-3.5 text-muted-foreground" />
          )}

          {filter.label}

          {hasSelection && (
            <>
              <div className="h-3.5 w-px bg-border" />
              {filter.selected.length > 2 ? (
                <Badge
                  variant="secondary"
                  className="h-4.5 rounded-sm px-1 text-[10px] font-normal"
                >
                  {filter.selected.length} đã chọn
                </Badge>
              ) : (
                filter.selected.map((val) => {
                  const opt = filter.options.find((o) => o.value === val);
                  return (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="h-4.5 rounded-sm px-1.5 text-[10px] font-normal"
                    >
                      {opt?.label ?? val}
                    </Badge>
                  );
                })
              )}
            </>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-52 p-0">
        <div className="flex h-9 items-center gap-2 border-b px-3">
          <Search className="size-3.5 shrink-0 opacity-50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={filter.label}
            className="flex h-full w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {visible.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Không tìm thấy</p>
          ) : (
            visible.map((opt) => {
              const active = filter.selected.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggle(opt.value)}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-sm border',
                      active ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                    )}
                  >
                    {active && <Check className="size-3" />}
                  </span>
                  {opt.icon && <span className="text-muted-foreground">{opt.icon}</span>}
                  <span className="flex-1 truncate text-left">{opt.label}</span>
                  {opt.count !== undefined && (
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {opt.count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
        {hasSelection && (
          <>
            <div className="h-px bg-border" />
            <div className="p-1">
              <button
                type="button"
                onClick={() => filter.onChange([])}
                className="flex w-full items-center justify-center rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-accent"
              >
                Xóa bộ lọc
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
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
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-normal">
          <ArrowDownUp className="size-3.5 text-muted-foreground" />
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
                    <SelectTrigger size="sm" className="h-8 flex-1 rounded font-normal">
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
                    <SelectTrigger size="sm" className="h-8 w-28 shrink-0 rounded">
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
                    className="size-8 shrink-0 rounded"
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
            size="sm"
            className="h-8 gap-1.5 rounded"
            onClick={addRule}
            disabled={rules.length >= options.length || rules.length >= maxRules}
          >
            <Plus className="size-4" />
            Thêm tiêu chí
          </Button>
          {hasRules && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded"
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
          size="sm"
          className="h-8 gap-1.5 font-normal"
          aria-label="Toggle columns"
        >
          <Settings2 className="size-3.5 text-muted-foreground" />
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
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex flex-1 flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={inputVal}
            onChange={(e) => handleChange(e.target.value)}
            className="h-8 w-48 pr-8 pl-8 text-sm lg:w-64"
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
            size="sm"
            onClick={onResetFilters}
            className="h-8 gap-1.5 border-dashed font-normal"
          >
            <X className="size-3.5" />
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
