'use client';
import { useCopy } from '@/hooks/use-copy';
import { formatBytes, formatDate } from '@/lib/utils';
import { type CloudinaryResource } from '@/lib/upload-api';

const META_ROWS = (asset: CloudinaryResource) => [
  { label: 'Tên file', value: `${asset.display_name}.${asset.format}` },
  { label: 'Kích thước', value: `${asset.width} × ${asset.height}px` },
  { label: 'Dung lượng', value: formatBytes(asset.bytes) },
  { label: 'Định dạng', value: asset.format.toUpperCase() },
  { label: 'Ngày tạo', value: formatDate(asset.created_at) },
  { label: 'Folder', value: asset.asset_folder },
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
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Preview */}
      <div className="relative bg-[repeating-conic-gradient(#f1f5f9_0%_25%,white_0%_50%)] bg-[length:16px_16px]">
        <img
          src={asset.secure_url}
          alt={asset.display_name}
          className="h-52 w-full object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          aria-label="Đóng"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
        <a
          href={asset.secure_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-2 left-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
          title="Mở ảnh gốc"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>

      {/* Info */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Thông tin
          </p>
          <div className="space-y-2">
            {META_ROWS(asset).map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2">
                <span className="shrink-0 text-xs text-slate-400">{label}</span>
                <span className="max-w-[60%] truncate text-right text-xs font-medium text-slate-700">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Sao chép</p>
          {COPY_FIELDS(asset).map(({ label, value, key }) => (
            <div
              key={key}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <code className="flex-1 truncate text-xs text-slate-600">{value}</code>
              <button
                onClick={() => copy(value, key)}
                className="shrink-0 cursor-pointer rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
                title={`Copy ${label}`}
              >
                {copied === key ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
