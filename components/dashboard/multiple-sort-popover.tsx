'use client';

import { useMemo, useState } from 'react';
import {
  ArrowDownIcon,
  ArrowDownUpIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface SortFieldOption {
  value: string;
  label: string;
}

export interface SortRule {
  field: string;
  direction: 'asc' | 'desc';
}

export interface MultipleSortPopoverLabels {
  trigger: (count: number) => string;
  title: string;
  fieldPlaceholder: string;
  descending: string;
  ascending: string;
  addRule: string;
  reset: string;
  moveUp: string;
  moveDown: string;
  removeRule: string;
}

const defaultLabels: MultipleSortPopoverLabels = {
  trigger: (count) => `Sắp xếp (${count})`,
  title: 'Tiêu chí sắp xếp',
  fieldPlaceholder: 'Chọn cột',
  descending: 'Giảm dần',
  ascending: 'Tăng dần',
  addRule: 'Thêm tiêu chí',
  reset: 'Đặt lại',
  moveUp: 'Lên',
  moveDown: 'Xuống',
  removeRule: 'Xóa tiêu chí',
};

export function parseSortParam(param: string, fallback: SortRule = { field: 'createdAt', direction: 'desc' }): SortRule[] {
  if (!param) return [fallback];
  return param.split(';').map((rule) => {
    const [field, dir] = rule.split(',');
    return {
      field: field || fallback.field,
      direction: dir === 'asc' ? 'asc' : dir === 'desc' ? 'desc' : fallback.direction,
    };
  });
}

export function formatSortParam(rules: SortRule[], fallback = 'createdAt,desc'): string {
  if (rules.length === 0) return fallback;
  return rules.map((r) => `${r.field},${r.direction}`).join(';');
}

export function MultipleSortPopover({
  value,
  fields,
  onChange,
  fallback = { field: 'createdAt', direction: 'desc' },
  labels = defaultLabels,
  className,
}: {
  value: string;
  fields: SortFieldOption[];
  onChange: (val: string) => void;
  fallback?: SortRule;
  labels?: MultipleSortPopoverLabels;
  className?: string;
}) {
  const fallbackField = fallback.field;
  const fallbackDirection = fallback.direction;
  const fallbackParam = `${fallbackField},${fallbackDirection}`;
  const rules = useMemo(
    () => parseSortParam(value, { field: fallbackField, direction: fallbackDirection }),
    [value, fallbackField, fallbackDirection],
  );

  const [open, setOpen] = useState(false);
  const [draftRules, setDraftRules] = useState<SortRule[]>([]);


  function handleRulesChange(newRules: SortRule[]) {
    setDraftRules(newRules);
  }

  function addRule() {
    const usedFields = new Set(draftRules.map((r) => r.field));
    const next = fields.find((o) => !usedFields.has(o.value));
    if (!next) return;
    handleRulesChange([...draftRules, { field: next.value, direction: fallbackDirection }]);
  }

  function updateField(index: number, field: string) {
    handleRulesChange(draftRules.map((r, i) => (i === index ? { ...r, field } : r)));
  }

  // When reset clicked, clear state and apply immediately
  function resetRules() {
    const reset = [{ field: fallbackField, direction: fallbackDirection }];
    setDraftRules(reset);
    onChange(formatSortParam(reset, fallbackParam));
  }

  function updateDirection(index: number, direction: 'asc' | 'desc') {
    handleRulesChange(draftRules.map((r, i) => (i === index ? { ...r, direction } : r)));
  }

  function removeRule(index: number) {
    handleRulesChange(draftRules.filter((_, i) => i !== index));
  }

  function moveRule(from: number, to: number) {
    const next = [...draftRules];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    handleRulesChange(next);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setDraftRules(parseSortParam(value, { field: fallbackField, direction: fallbackDirection }));
    } else {
      const nextValue = formatSortParam(draftRules, fallbackParam);
      if (nextValue !== value) {
        onChange(nextValue);
      }
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-fit min-w-0 justify-between gap-1.5 rounded-xl px-3 font-normal shadow-none",
            className
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <ArrowDownUpIcon data-icon="inline-start" />
            {labels.trigger(rules.length)}
          </span>
          <ChevronDownIcon data-icon="inline-end" className="shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="flex w-80 flex-col gap-3 rounded-xl p-3.5 2xl:w-96 2xl:p-4"
      >
        <div className="flex items-center justify-between border-b pb-2">
          <span className="text-sm font-semibold">{labels.title}</span>
        </div>

        <div className="flex max-h-60 flex-col gap-2 overflow-y-auto">
          {draftRules.map((rule, i) => {
            const usedFields = new Set(draftRules.filter((_, j) => j !== i).map((r) => r.field));
            const ruleLabel = fields.find((field) => field.value === rule.field)?.label ?? rule.field;
            return (
              <div key={rule.field} className="flex items-center gap-2">
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    onClick={() => i > 0 && moveRule(i, i - 1)}
                    disabled={i === 0}
                    className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                    aria-label={`${labels.moveUp}: ${ruleLabel}`}
                  >
                    <ArrowUpIcon className="size-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => i < draftRules.length - 1 && moveRule(i, i + 1)}
                    disabled={i === draftRules.length - 1}
                    className="flex h-4 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent disabled:opacity-30"
                    aria-label={`${labels.moveDown}: ${ruleLabel}`}
                  >
                    <ArrowDownIcon className="size-3" />
                  </button>
                </div>

                <div className="min-w-0 flex-1">
                  <Select value={rule.field} onValueChange={(v) => updateField(i, v)}>
                    <SelectTrigger className="w-full font-normal">
                      <SelectValue placeholder={labels.fieldPlaceholder} />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectGroup>
                        {fields.map((field) => (
                          <SelectItem
                            key={field.value}
                            value={field.value}
                            disabled={usedFields.has(field.value)}
                          >
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-28 shrink-0">
                  <Select
                    value={rule.direction}
                    onValueChange={(v) => updateDirection(i, v as 'asc' | 'desc')}
                  >
                    <SelectTrigger className="w-full font-normal">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={4}>
                      <SelectGroup>
                        <SelectItem value="desc">{labels.descending}</SelectItem>
                        <SelectItem value="asc">{labels.ascending}</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0 rounded-lg hover:bg-accent hover:text-destructive"
                  onClick={() => removeRule(i)}
                  aria-label={`${labels.removeRule}: ${ruleLabel}`}
                >
                  <Trash2Icon />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-1">
          <Button
            variant="outline"
            className="h-8 gap-1.5 rounded-lg"
            onClick={addRule}
            disabled={draftRules.length >= fields.length}
          >
            <PlusIcon data-icon="inline-start" />
            {labels.addRule}
          </Button>
          {draftRules.length > 1 && (
            <Button
              variant="ghost"
              className="h-8 rounded-lg text-muted-foreground hover:text-foreground"
              onClick={resetRules}
            >
              {labels.reset}
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
