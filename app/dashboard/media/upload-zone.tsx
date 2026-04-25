'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { CheckIcon, UploadIcon } from 'lucide-react';
import { uploadFile, type AllowedFolder } from '@/lib/api/upload';
import { cn } from '@/lib/utils';

interface Props {
  folder: AllowedFolder;
  onUploaded: () => void;
}

export function UploadZone({ folder, onUploaded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ name: string; done: boolean }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) { toast.error('Chỉ chấp nhận file ảnh'); return; }

    setUploading(true);
    setProgress(list.map((f) => ({ name: f.name, done: false })));
    let ok = 0;

    for (const file of list) {
      try {
        await uploadFile(file, folder);
        ok++;
        setProgress((p) => p.map((x) => (x.name === file.name ? { ...x, done: true } : x)));
      } catch {
        toast.error(`Thất bại: ${file.name}`);
        setProgress((p) => p.filter((x) => x.name !== file.name));
      }
    }

    setUploading(false);
    setProgress([]);
    if (ok) { toast.success(`Đã tải lên ${ok} ảnh`); onUploaded(); }
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}
      onClick={() => !uploading && inputRef.current?.click()}
      role="button"
      tabIndex={0}
      aria-label="Khu vực tải ảnh lên"
      onKeyDown={(e) => e.key === 'Enter' && !uploading && inputRef.current?.click()}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed py-10 transition-all duration-200',
        dragging ? 'border-ring bg-accent' : 'border-border bg-muted/30 hover:border-ring/50 hover:bg-muted/50',
        uploading && 'pointer-events-none',
      )}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <UploadIcon className="h-6 w-6 animate-bounce text-muted-foreground" aria-hidden="true" />
          </div>
          <div className="w-48 space-y-1.5">
            {progress.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className={cn('h-full rounded-full bg-primary transition-all duration-500', p.done ? 'w-full' : 'w-1/2 animate-pulse')} />
                </div>
                <span className="w-3 shrink-0">
                  {p.done && <CheckIcon className="h-3 w-3 text-green-500" aria-hidden="true" />}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Đang tải lên {progress.filter((p) => !p.done).length} file...
          </p>
        </div>
      ) : (
        <>
          <div className={cn(
            'flex h-12 w-12 items-center justify-center rounded-md transition-colors',
            dragging ? 'bg-accent' : 'border bg-card shadow-sm',
          )}>
            <UploadIcon className={cn('h-6 w-6 transition-colors', dragging ? 'text-foreground' : 'text-muted-foreground')} aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">
              {dragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc nhấn để chọn'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              PNG, JPG, WebP, GIF · Tối đa 10MB · Thư mục:{' '}
              <span className="font-medium text-foreground">{folder}</span>
            </p>
          </div>
        </>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && processFiles(e.target.files)}
        aria-hidden="true"
      />
    </div>
  );
}
