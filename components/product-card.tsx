'use client';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCompare } from '@/components/compare-bar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProductCardProps {
  slug: string;
  name: string;
  cat: string;
  price: string;
  old: string;
  badge: string;
  badgeColor: string;
  accent?: string;
  rating: number;
  reviews: number;
  specs?: string[];
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          viewBox="0 0 24 24"
          className={`h-3 w-3 ${s <= Math.floor(rating) ? 'text-amber-400' : 'text-slate-200'} fill-current`}
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
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
  reviews,
  specs,
}: ProductCardProps) {
  const { toggle, has } = useCompare();
  const inCompare = has(slug);

  return (
    <Link
      href={`/products/${slug}`}
      className={`group rounded-3xl border border-slate-200 bg-white ${accent} flex cursor-pointer flex-col overflow-hidden shadow-sm transition-all duration-200 hover:shadow-lg`}
    >
      <div className="relative flex h-44 items-center justify-center border-b border-slate-100 bg-slate-50">
        <svg
          viewBox="0 0 80 60"
          className="h-auto w-24 text-slate-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <rect x="5" y="5" width="70" height="50" rx="4" />
          <rect
            x="12"
            y="12"
            width="56"
            height="36"
            rx="2"
            fill="rgba(59,130,246,0.04)"
            stroke="rgba(59,130,246,0.15)"
          />
        </svg>
        <span
          className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}
        >
          {badge}
        </span>
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggle({ slug, name, cat });
                  if (!inCompare) toast.success('Đã thêm vào so sánh', { description: name });
                  else toast('Đã xóa khỏi so sánh', { description: name });
                }}
                className={`cursor-pointer rounded-full border p-1.5 transition-colors duration-200 ${
                  inCompare
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-200 bg-white text-slate-400 hover:border-blue-200 hover:text-blue-500'
                }`}
                aria-label={inCompare ? 'Bỏ so sánh' : 'So sánh sản phẩm này'}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="18" rx="1" />
                  <rect x="14" y="3" width="7" height="18" rx="1" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent>{inCompare ? 'Bỏ so sánh' : 'So sánh'}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toast.success('Đã thêm vào yêu thích', { description: name });
                }}
                className="cursor-pointer rounded-full border border-slate-200 bg-white p-1.5 text-slate-400 transition-colors duration-200 hover:border-rose-200 hover:text-rose-500"
                aria-label="Yêu thích"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">Yêu thích</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-1 text-sm text-slate-400">{cat}</div>
        <div className="mb-2 text-base leading-snug font-semibold text-slate-900">{name}</div>
        {specs && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {specs.map((s) => (
              <span
                key={s}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
              >
                {s}
              </span>
            ))}
          </div>
        )}
        <div className="mb-4 flex items-center gap-1.5">
          <Stars rating={rating} />
          <span className="text-xs text-slate-400">({reviews})</span>
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <div className="text-base font-bold text-slate-900">{price}</div>
            <div className="text-sm text-slate-300 line-through">{old}</div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              toast.success('Đã thêm vào giỏ hàng', { description: name });
            }}
            className="cursor-pointer rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
          >
            Mua
          </button>
        </div>
      </div>
    </Link>
  );
}
