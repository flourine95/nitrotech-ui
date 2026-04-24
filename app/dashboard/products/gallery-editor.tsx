'use client';
import { type ComponentType, useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MediaPickerProps } from '@/components/media-picker-dialog';

const MediaPickerDialog = dynamic(() => import('@/components/media-picker-dialog'), {
  ssr: false,
}) as ComponentType<MediaPickerProps>;

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
      className={`group relative aspect-square overflow-hidden rounded-lg border bg-muted transition-all ${isDragging ? 'opacity-50 ring-2 ring-ring' : 'border-border'}`}
    >
      <Image
        src={url}
        alt={`Ảnh ${index + 1}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 33vw, 25vw"
      />

      <div className="absolute top-1 left-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          ref={handleRef}
          type="button"
          variant="secondary"
          size="icon"
          className="h-7 w-7 cursor-grab shadow-sm active:cursor-grabbing"
          aria-label="Kéo để sắp xếp"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={onRemove}
          className="hover:text-destructive-foreground h-7 w-7 shadow-sm hover:bg-destructive"
          aria-label="Xóa ảnh"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Badge variant="secondary" className="absolute bottom-1 left-1 text-[10px]">
        {index + 1}
      </Badge>
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

  // Sync when parent resets externally (e.g. after form reset)
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
        {localImages.length === 0 ? (
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-8 text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">Thêm ảnh từ thư viện</span>
          </button>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {localImages.map((url, index) => (
              <SortableImage
                key={url}
                url={url}
                index={index}
                onRemove={() => removeImage(index)}
              />
            ))}
            <button
              type="button"
              onClick={() => setShowPicker(true)}
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-ring hover:text-foreground"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[10px]">Thêm</span>
            </button>
          </div>
        )}
      </DragDropProvider>

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
