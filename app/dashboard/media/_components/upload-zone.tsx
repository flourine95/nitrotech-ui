'use client';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { uploadFile, type AllowedFolder } from '@/lib/upload-api';

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
    if (!list.length) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }

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
    if (ok) {
      toast.success(`Đã upload ${ok} ảnh`);
      onUploaded();
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        processFiles(e.dataTransfer.files);
      }}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all duration-200 ${
        dragging
          ? 'scale-[1.01] border-indigo-400 bg-indigo-50'
          : 'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/40'
      } ${uploading ? 'pointer-events-none' : ''}`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 animate-spin text-indigo-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".2" />
              <path d="M21 12a9 9 0 00-9-9" />
            </svg>
          </div>
          <div className="w-48 space-y-1.5">
            {progress.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full bg-indigo-500 transition-all duration-500 ${p.done ? 'w-full' : 'w-1/2 animate-pulse'}`}
                  />
                </div>
                <span className="w-3 shrink-0">
                  {p.done && (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-3 w-3 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500">
            Đang upload {progress.filter((p) => !p.done).length} file...
          </p>
        </div>
      ) : (
        <>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${dragging ? 'bg-indigo-100' : 'border border-slate-200 bg-white shadow-sm'}`}
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-6 w-6 transition-colors ${dragging ? 'text-indigo-600' : 'text-slate-400'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              {dragging ? 'Thả ảnh vào đây' : 'Kéo thả ảnh hoặc click để chọn'}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              PNG, JPG, WebP, GIF · Tối đa 10MB · Folder:{' '}
              <span className="font-medium text-slate-600">{folder}</span>
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
      />
    </div>
  );
}
