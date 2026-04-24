'use client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

export function FilterChip({ label, onRemove }: FilterChipProps) {
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
