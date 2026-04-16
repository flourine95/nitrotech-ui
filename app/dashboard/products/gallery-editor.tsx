'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical, ImageIcon, Plus, Trash2 } from 'lucide-react';
import MediaPickerDialog from '@/components/media-picker-dialog';

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}

interface SortableImageProps {
  url: string;
  index: number;
  onRemove: () => void;
}

function SortableImage({ url, index, onRemove }: SortableImageProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: url, index });

  return (
    <div
      ref={ref}
      className={`group relative aspect-square overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 transition-all ${isDragging ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
    >
      <Image
        src={url}
        alt="Gallery image"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 25vw"
      />

      <button
        ref={handleRef}
        type="button"
        className="absolute top-1 left-1 cursor-grab rounded-lg bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Kéo để sắp xếp"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 cursor-pointer rounded-lg bg-black/40 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-500"
        aria-label="Xóa ảnh"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
      <span className="absolute bottom-1 left-1 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {index + 1}
      </span>
    </div>
  );
}

interface GalleryEditorProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function GalleryEditor({ images, onChange }: GalleryEditorProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [localImages, setLocalImages] = useState<string[]>(images);

  // Sync when parent resets externally (e.g. after initial load)
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  function handleDragOver(event: DragOverEvent) {
    const sourceId = event.operation.source?.id as string | undefined;
    const targetId = event.operation.target?.id as string | undefined;
    if (!sourceId || !targetId || sourceId === targetId) return;
    const from = localImages.indexOf(sourceId);
    const to = localImages.indexOf(targetId);
    if (from === -1 || to === -1) return;
    setLocalImages(arrayMove(localImages, from, to));
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled) {
      setLocalImages(images);
      return;
    }
    onChange(localImages);
  }

  function removeImage(index: number) {
    const next = localImages.filter((_, i) => i !== index);
    setLocalImages(next);
    onChange(next);
  }

  function addImages(urls: string[]) {
    const newUrls = urls.filter((u) => !localImages.includes(u));
    const next = [...localImages, ...newUrls];
    setLocalImages(next);
    onChange(next);
  }

  return (
    <>
      <DragDropProvider onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-2">
          {localImages.map((url, index) => (
            <SortableImage key={url} url={url} index={index} onRemove={() => removeImage(index)} />
          ))}
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500"
          >
            <Plus className="h-5 w-5" />
            <span className="text-[11px] font-medium">Thêm ảnh</span>
          </button>
        </div>
      </DragDropProvider>

      {localImages.length === 0 && (
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400">
          <ImageIcon className="h-4 w-4 shrink-0" />
          Chưa có ảnh nào. Nhấn {'"Thêm ảnh"'} để chọn từ thư viện.
        </div>
      )}

      {showPicker && (
        <MediaPickerDialog
          folder="products"
          multiple
          onInsert={(urls) => {
            addImages(urls);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
