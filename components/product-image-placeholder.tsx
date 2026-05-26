import { cn } from '@/lib/utils';

interface ProductImagePlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-12',
  md: 'w-16',
  lg: 'w-20',
};

export function ProductImagePlaceholder({
  className,
  size = 'md',
}: ProductImagePlaceholderProps) {
  return (
    <svg
      viewBox="0 0 60 45"
      className={cn('h-auto text-slate-300', sizeMap[size], className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="54" height="39" rx="3" />
      <rect
        x="8"
        y="8"
        width="44"
        height="29"
        rx="2"
        fill="rgba(59,130,246,0.04)"
        stroke="rgba(59,130,246,0.15)"
      />
    </svg>
  );
}
