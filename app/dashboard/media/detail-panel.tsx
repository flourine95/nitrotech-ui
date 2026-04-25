'use client';
import { CheckIcon, ClipboardIcon, ExternalLinkIcon, XIcon } from 'lucide-react';
import { useCopy } from '@/hooks/use-copy';
import { formatBytes, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type CloudinaryResource } from '@/lib/api/upload';

const META_ROWS = (asset: CloudinaryResource) => [
  { label: 'Tên file', value: `${asset.display_name}.${asset.format}` },
  { label: 'Kích thước', value: `${asset.width} × ${asset.height}px` },
  { label: 'Dung lượng', value: formatBytes(asset.bytes) },
  { label: 'Định dạng', value: asset.format.toUpperCase() },
  { label: 'Ngày tạo', value: formatDate(asset.created_at) },
  { label: 'Thư mục', value: asset.asset_folder },
];

const COPY_FIELDS = (asset: CloudinaryResource) => [
  { label: 'URL', value: asset.secure_url, key: 'url' },
  { label: 'Public ID', value: asset.public_id, key: 'pid' },
];

interface Props {
  asset: CloudinaryResource;
  onClose: () => void;
}

export function DetailPanel({ asset, onClose }: Props) {
  const { copied, copy } = useCopy();

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-md border bg-card">
      {/* Preview */}
      <div className="relative bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,hsl(var(--background))_0%_50%)] bg-[length:16px_16px]">
        <img src={asset.secure_url} alt={asset.display_name} className="h-52 w-full object-contain" />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Đóng chi tiết"
          className="absolute top-2 right-2 size-7 rounded-full bg-black/40 text-white hover:bg-black/60"
        >
          <XIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
        <a
          href={asset.secure_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Mở ảnh gốc trong tab mới"
          className="absolute top-2 left-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>

      {/* Info */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Thông tin
          </p>
          <div className="space-y-2">
            {META_ROWS(asset).map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2">
                <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
                <span className="max-w-[60%] truncate text-right text-xs font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Sao chép</p>
          {COPY_FIELDS(asset).map(({ label, value, key }) => (
            <div key={key} className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <code className="flex-1 truncate text-xs text-muted-foreground">{value}</code>
              <button
                onClick={() => copy(value, key)}
                aria-label={`Sao chép ${label}`}
                className="shrink-0 cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied === key
                  ? <CheckIcon className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                  : <ClipboardIcon className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
