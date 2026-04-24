'use client';

import * as React from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear } from 'date-fns';
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
  const presets = getPresets();

  const label = value?.from
    ? value.to
      ? `${format(value.from, 'dd/MM/yyyy')} – ${format(value.to, 'dd/MM/yyyy')}`
      : format(value.from, 'dd/MM/yyyy')
    : 'Chọn khoảng ngày';

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(undefined);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start gap-2 font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
          {value && (
            <XIcon
              className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              onClick={clear}
              aria-label="Xóa khoảng ngày"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="flex min-w-32 flex-col gap-0.5 border-r p-2">
            {presets.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="justify-start text-sm font-normal"
                onClick={() => {
                  onChange(p.range);
                  setOpen(false);
                }}
              >
                {p.label}
              </Button>
            ))}
            <Separator className="my-1" />
            <Button
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
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            locale={vi}
            captionLayout="dropdown"
            defaultMonth={value?.from ?? subDays(getToday(), 30)}
            fromYear={2020}
            toYear={new Date().getFullYear() + 1}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
