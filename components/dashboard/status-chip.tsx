import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type StatusChipTone = 'default' | 'danger' | 'success' | 'warning';

export function statusChipClass(tone?: StatusChipTone) {
  if (tone === 'default' || !tone) return 'border-transparent bg-sky-50 text-sky-700 hover:bg-sky-50 dark:bg-sky-950 dark:text-sky-300 dark:hover:bg-sky-950';
  if (tone === 'success') return 'border-transparent bg-green-50 text-green-700 hover:bg-green-50 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-950';
  if (tone === 'warning') return 'border-transparent bg-amber-50 text-amber-700 hover:bg-amber-50 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-950';
  if (tone === 'danger') return 'border-transparent bg-red-50 text-red-700 hover:bg-red-50 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-950';
}

export function StatusChip({ children, tone }: { children: React.ReactNode; tone?: StatusChipTone }) {
  return (
    <Badge className={cn('h-6 rounded-md px-2 font-semibold shadow-sm', statusChipClass(tone))}>
      {children}
    </Badge>
  );
}
