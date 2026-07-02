'use client';
import Image from 'next/image';
import Link from 'next/link';
import { GitCompare, Heart } from 'lucide-react';
import { useCompare } from '@/components/compare-bar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ProductImagePlaceholder } from '@/components/product-image-placeholder';
import { ProductRating } from '@/components/product-rating';
import { getProductBadgeLabel } from '@/lib/utils/product-badges';
import { cn } from '@/lib/utils';
import { cloudinaryImage } from '@/lib/utils/cloudinary';

interface ProductCardProps {
  slug: string;
  name: string;
  cat: string;
  price: string;
  old?: string;
  badge?: string;
  badgeColor?: string;
  accent?: string;
  rating: number;
  thumbnail?: string | null;
  reviews?: number;
  specs?: string[];
  onAddToCart?: (product: { slug: string; name: string }) => void;
  onAddToWishlist?: (product: { slug: string; name: string }) => void;
}

export function ProductCard({
  slug,
  name,
  cat,
  price,
  old,
  badge,
  badgeColor,
  accent = '',
  rating,
  thumbnail,
  reviews,
  specs,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const { toggle, has } = useCompare();
  const inCompare = has(slug);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle({ slug, name, cat });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToWishlist?.({ slug, name });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart?.({ slug, name });
  };

  return (
    <Link
      href={`/products/${slug}`}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-lg',
        accent
      )}
    >
      <div className="relative flex h-44 items-center justify-center border-b border-border bg-muted/30">
        {thumbnail ? (
          <Image
            src={cloudinaryImage(thumbnail, 'f_auto,q_auto,w_600,c_fill,ar_4:3')}
            alt={name}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <ProductImagePlaceholder size="lg" />
        )}
        {badge && (
          <span
            className={cn(
              'absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold',
              badgeColor || 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'
            )}
          >
            {getProductBadgeLabel(badge)}
          </span>
        )}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCompareClick}
                variant={inCompare ? 'default' : 'outline'}
                size="icon"
                className={cn(
                  'size-7 rounded-full',
                  inCompare && 'bg-slate-800 hover:bg-slate-700',
                  !inCompare && 'bg-background hover:bg-background hover:text-blue-600'
                )}
                aria-label={inCompare ? 'Bỏ so sánh' : 'So sánh sản phẩm này'}
              >
                <GitCompare className="size-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{inCompare ? 'Bỏ so sánh' : 'So sánh'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleWishlistClick}
                variant="outline"
                size="icon"
                className="size-7 rounded-full bg-background hover:bg-background hover:text-rose-500"
                aria-label="Yêu thích"
              >
                <Heart className="size-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Yêu thích</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="text-sm text-muted-foreground">{cat}</div>
        <div className="text-base font-semibold leading-snug text-foreground">{name}</div>
        {specs && specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specs.map((s) => (
              <span
                key={s}
                className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-950 dark:text-blue-400"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <ProductRating rating={rating} reviews={reviews} />
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <div className="text-base font-bold text-foreground">{price}</div>
            {old && <div className="text-sm text-muted-foreground line-through">{old}</div>}
          </div>
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="h-9 rounded-full bg-slate-800 px-4 hover:bg-slate-700"
          >
            Mua
          </Button>
        </div>
      </div>
    </Link>
  );
}
