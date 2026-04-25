'use client';
import { CheckIcon, ClipboardIcon } from 'lucide-react';
import { useCopy } from '@/hooks/use-copy';
import { formatBytes, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { type AssetViewProps } from './media-types';

export function AssetList({ assets, selected, active, onToggle, onSelect }: AssetViewProps) {
  const { copied, copy } = useCopy();

  if (!assets.length)
    return <div className="py-16 text-center text-sm text-muted-foreground">Chưa có ảnh nào</div>;

  return (
    <div className="divide-y">
      {assets.map((a) => {
        const isSel = selected.has(a.asset_id);
        const isActive = active === a.asset_id;
        return (
          <div
            key={a.asset_id}
            onClick={() => onSelect(a)}
            role="button"
            tabIndex={0}
            aria-label={`Xem ${a.display_name}`}
            aria-pressed={isActive}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(a)}
            className={cn(
              'flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors',
              isActive ? 'bg-accent' : isSel ? 'bg-muted/50' : 'hover:bg-muted/50',
            )}
          >
            <Checkbox
              checked={isSel}
              onCheckedChange={() => onToggle(a.asset_id)}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Chọn ${a.display_name}`}
              className="shrink-0"
            />
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
              <img src={a.secure_url} alt={a.display_name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{a.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {a.width}×{a.height} · {formatBytes(a.bytes)} · {formatDate(a.created_at)}
              </p>
            </div>
            <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {a.format}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); copy(a.secure_url, a.asset_id); }}
              aria-label={`Sao chép URL ${a.display_name}`}
              className="shrink-0 cursor-pointer rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {copied === a.asset_id
                ? <CheckIcon className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                : <ClipboardIcon className="h-3.5 w-3.5" aria-hidden="true" />}
            </button>
          </div>
        );
      })}
    </div>
  );
}
