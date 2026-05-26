import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRatingProps {
  rating: number;
  reviews?: number;
  showReviews?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'size-3',
  md: 'size-4',
  lg: 'size-5',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function ProductRating({
  rating,
  reviews,
  showReviews = true,
  size = 'sm',
  className,
}: ProductRatingProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              sizeMap[size],
              star <= Math.floor(rating)
                ? 'fill-yellow-500 text-yellow-500'
                : 'fill-muted text-muted'
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      {showReviews && reviews !== undefined && reviews > 0 && (
        <span className={cn('text-muted-foreground', textSizeMap[size])}>({reviews})</span>
      )}
    </div>
  );
}
