'use client';

import * as React from 'react';
import { format, isValid, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import { CalendarIcon, XIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

// Parse 'YYYY-MM-DD' string thành local Date, tránh UTC offset bug
export function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Format Date thành 'YYYY-MM-DD' string
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function getToday() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getPresets() {
  const today = getToday();
  return [
    { label: 'Hôm nay', range: { from: today, to: today } },
    { label: '7 ngày qua', range: { from: subDays(today, 6), to: today } },
    { label: '30 ngày qua', range: { from: subDays(today, 29), to: today } },
    { label: 'Tháng này', range: { from: startOfMonth(today), to: endOfMonth(today) } },
    { label: 'Từ đầu năm', range: { from: startOfYear(today), to: today } },
  ];
}

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const presets = React.useMemo(() => getPresets(), []);

  const label = React.useMemo(() => {
    if (!value?.from) return 'Chọn khoảng ngày';
    if (!isValid(value.from) || (value.to && !isValid(value.to))) return 'Khoảng ngày không hợp lệ';
    const from = format(value.from, 'dd/MM/yyyy');
    return value.to ? `${from} – ${format(value.to, 'dd/MM/yyyy')}` : from;
  }, [value]);

  function clear(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    onChange(undefined);
  }

  function isActive(range: DateRange) {
    return (
      value?.from?.getTime() === range.from?.getTime() &&
      (value?.to?.getTime() ?? null) === (range.to?.getTime() ?? null)
    );
  }

  function selectRange(range: DateRange | undefined) {
    onChange(range);
    if (!range?.from || !range.to) return;
    if (range.from.getTime() !== range.to.getTime()) setOpen(false);
  }

  function selectPreset(range: DateRange) {
    onChange(range);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'justify-start gap-2 font-normal',
              value && 'pr-9',
              !value && 'text-muted-foreground',
              className,
            )}
          >
            <CalendarIcon data-icon="inline-start" />
            <span className="truncate">{label}</span>
          </Button>
        </PopoverTrigger>
        {value && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={clear}
            aria-label="Xóa khoảng ngày"
            className="absolute inset-y-0 right-1 my-auto size-7"
          >
            <XIcon />
          </Button>
        )}
      </div>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="flex min-w-32 flex-col gap-0.5 border-r p-2">
            {presets.map((p) => (
              <Button
                key={p.label}
                type="button"
                variant={isActive(p.range) ? 'secondary' : 'ghost'}
                size="sm"
                className="justify-start text-sm font-normal"
                onClick={() => selectPreset(p.range)}
              >
                {p.label}
              </Button>
            ))}
            <Separator className="my-1" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start text-sm font-normal text-muted-foreground"
              onClick={() => {
                onChange(undefined);
                setOpen(false);
              }}
            >
              Xóa lọc
            </Button>
          </div>

          {/* Calendar — captionLayout dropdown để đổi tháng/năm */}
          <Calendar
            key={open ? 'open' : 'closed'}
            mode="range"
            selected={value}
            onSelect={selectRange}
            numberOfMonths={2}
            locale={vi}
            captionLayout="dropdown"
            defaultMonth={value?.from ?? subDays(getToday(), 30)}
            startMonth={new Date(2020, 0)}
            endMonth={new Date(new Date().getFullYear() + 1, 11)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
