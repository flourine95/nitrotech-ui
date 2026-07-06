'use client';

import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function PageSizeDropdown({
  value,
  options,
  onChange,
}: {
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-9 min-w-28 justify-between rounded-xl px-3 font-normal shadow-none"
          aria-label={`Số dòng mỗi trang: ${value}`}
          disabled={options.length === 0}
        >
          <span>{value} / trang</span>
          <ChevronDownIcon data-icon="inline-end" className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" sideOffset={6} className="w-32">
        <DropdownMenuRadioGroup value={String(value)} onValueChange={(nextValue) => onChange(Number(nextValue))}>
          {options.map((size) => (
            <DropdownMenuRadioItem key={size} value={String(size)}>
              {size} / trang
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
