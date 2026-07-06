'use client';

import { ChevronDownIcon, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type DashboardFilterOption = {
  value: string;
  label: string;
  count?: number;
};

export function DashboardFilterDropdown({
  label,
  value,
  options,
  onChange,
  icon: Icon,
  className,
}: {
  label: string;
  value: string;
  options: DashboardFilterOption[];
  onChange: (value: string) => void;
  icon?: LucideIcon;
  className?: string;
}) {
  const selected = options.find((option) => option.value === value)?.label ?? label;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={className ?? 'h-9 w-fit min-w-0 justify-between gap-1.5 rounded-xl px-3 font-normal shadow-none'}
        >
          <span className="flex min-w-0 items-center gap-2">
            {Icon ? <Icon data-icon="inline-start" className="text-muted-foreground" /> : null}
            <span className="truncate">{selected}</span>
          </span>
          <ChevronDownIcon data-icon="inline-end" className="shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={6} className="w-(--radix-dropdown-menu-trigger-width) min-w-44">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <span className="flex w-full items-center justify-between gap-3">
                <span>{option.label}</span>
                {option.count !== undefined ? (
                  <span className="text-xs text-muted-foreground">{option.count}</span>
                ) : null}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
