'use client';
import { useEffect, useRef, useState } from 'react';
import { vi } from 'date-fns/locale';
import { Calendar, ChevronDown, CircleX } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

const PRESETS = [
  { label: 'Hôm nay', days: 1 },
  { label: '3 ngày', days: 3 },
  { label: '7 ngày', days: 7 },
  { label: '30 ngày', days: 30 },
  { label: '3 tháng', days: 90 },
  { label: '1 năm', days: 365 },
];

const CALENDAR_CLASS_NAMES = {
  month_caption: 'flex h-[--cell-size] w-full items-center justify-start px-1',
  nav: 'flex items-center justify-between gap-1 absolute inset-x-0 top-0 pointer-events-none',
  button_previous: 'pointer-events-auto size-[--cell-size] p-0 inline-flex items-center justify-center rounded-md hover:bg-accent aria-disabled:opacity-50',
  button_next: 'pointer-events-auto size-[--cell-size] p-0 inline-flex items-center justify-center rounded-md hover:bg-accent aria-disabled:opacity-50',
};

interface InlineDropdownProps {
  options: { value: string | number; label: string }[];
  value: string | number;
  onChange: (v: string) => void;
  width?: string;
}

export function InlineDropdown({ options, value, onChange, width = 'w-28' }: InlineDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className={cn('relative', width)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-full items-center justify-between gap-1 rounded-md border bg-background px-2 text-xs font-medium hover:bg-accent"
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-200 mt-1 max-h-52 w-full overflow-auto rounded-md border bg-popover shadow-md">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(String(opt.value)); setOpen(false); }}
              className={cn(
                'flex w-full items-center px-2 py-1.5 text-xs hover:bg-accent',
                String(opt.value) === String(value) && 'font-medium text-primary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface CalendarCaptionProps {
  displayMonth: Date;
  onMonthChange: (d: Date) => void;
  fromYear?: number;
  toYear?: number;
}

export function CalendarCaption({
  displayMonth,
  onMonthChange,
  fromYear = 2020,
  toYear = new Date().getFullYear() + 1,
}: CalendarCaptionProps) {
  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => ({
    value: i + fromYear,
    label: String(i + fromYear),
  }));
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i, 1).toLocaleString('vi-VN', { month: 'long' }),
  }));

  return (
    <div className="flex items-center gap-1.5 px-1">
      <InlineDropdown
        options={months}
        value={displayMonth.getMonth()}
        onChange={(v) => {
          const d = new Date(displayMonth);
          d.setMonth(Number(v));
          onMonthChange(d);
        }}
        width="w-28"
      />
      <InlineDropdown
        options={years}
        value={displayMonth.getFullYear()}
        onChange={(v) => {
          const d = new Date(displayMonth);
          d.setFullYear(Number(v));
          onMonthChange(d);
        }}
        width="w-20"
      />
    </div>
  );
}

interface DateRangePickerProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  label?: string;
  numberOfMonths?: number;
  fromYear?: number;
  toYear?: number;
  align?: 'start' | 'center' | 'end';
}

export function DateRangePicker({
  value,
  onChange,
  label = 'Ngày',
  numberOfMonths = 2,
  fromYear = 2020,
  toYear = new Date().getFullYear() + 1,
  align = 'start',
}: DateRangePickerProps) {
  const hasValue = !!(value?.from || value?.to);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(new Date());

  function formatDate(d: Date) {
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function chipLabel() {
    if (!value?.from) return null;
    if (!value.to) return formatDate(value.from);
    return `${formatDate(value.from)} – ${formatDate(value.to)}`;
  }

  function applyPreset(days: number) {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = new Date();
    from.setDate(from.getDate() - (days - 1));
    from.setHours(0, 0, 0, 0);
    onChange({ from, to });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Enter' && setOpen(true)}
          className={cn(
            'inline-flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md border border-dashed bg-background px-3 text-sm font-normal shadow-xs',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
            'transition-colors',
          )}
        >
          {hasValue ? (
            <span
              role="button"
              tabIndex={-1}
              aria-label={`Xóa ${label}`}
              onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(undefined); } }}
              className="rounded opacity-60 hover:opacity-100 [&_svg]:size-3.5"
            >
              <CircleX />
            </span>
          ) : (
            <Calendar className="size-3.5 text-muted-foreground" />
          )}

          {label}

          {hasValue && (
            <>
              <div className="h-3.5 w-px bg-border" />
              <Badge variant="secondary" className="h-4.5 rounded-sm px-1.5 text-[10px] font-normal">
                {chipLabel()}
              </Badge>
            </>
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-auto overflow-visible p-0">
        <div className="flex flex-wrap gap-1 border-b p-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => applyPreset(p.days)}
              className="rounded-sm border px-2 py-1 text-xs hover:bg-accent"
            >
              {p.label}
            </button>
          ))}
        </div>

        <CalendarComponent
          mode="range"
          selected={value}
          onSelect={onChange}
          month={month}
          onMonthChange={setMonth}
          numberOfMonths={numberOfMonths}
          locale={vi}
          classNames={CALENDAR_CLASS_NAMES}
          components={{
            MonthCaption: ({ calendarMonth }) => (
              <CalendarCaption
                displayMonth={calendarMonth.date}
                onMonthChange={setMonth}
                fromYear={fromYear}
                toYear={toYear}
              />
            ),
          }}
          autoFocus={true}
        />

        {hasValue && (
          <>
            <div className="h-px bg-border" />
            <div className="p-1">
              <button
                type="button"
                onClick={() => { onChange(undefined); setOpen(false); }}
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
