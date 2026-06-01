'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { ProductImagePlaceholder } from '@/components/product-image-placeholder';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cloudinaryImage } from '@/lib/utils/cloudinary';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  name: string;
  thumbnail: string | null;
  images: string[];
}

export function ProductGallery({ name, thumbnail, images }: ProductGalleryProps) {
  const galleryImages = useMemo(() => {
    return Array.from(new Set([thumbnail, ...images].filter((image): image is string => !!image)));
  }, [images, thumbnail]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const activeIndex = galleryImages[selectedIndex] ? selectedIndex : 0;
  const selectedImage = galleryImages[activeIndex] ?? null;
  const hasMultipleImages = galleryImages.length > 1;

  function goToPrevious() {
    if (!hasMultipleImages) return;
    setSelectedIndex((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  }

  function goToNext() {
    if (!hasMultipleImages) return;
    setSelectedIndex((current) => (current + 1) % galleryImages.length);
  }

  return (
    <div>
      <div className="group/gallery relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-muted/30 shadow-sm">
        {selectedImage ? (
          <Image
            src={cloudinaryImage(selectedImage, 'f_auto,q_auto,w_1200')}
            alt={name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-contain"
            priority
          />
        ) : (
          <ProductImagePlaceholder size="lg" className="w-48" />
        )}

        {selectedImage && (
          <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-3">
            <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
              {activeIndex + 1} / {galleryImages.length}
            </span>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="rounded-full bg-background/90 shadow-sm backdrop-blur hover:bg-background"
              aria-label="Xem ảnh lớn"
              onClick={() => setViewerOpen(true)}
            >
              <Maximize2 />
            </Button>
          </div>
        )}

        {hasMultipleImages && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-4 rounded-full bg-background/90 shadow-sm backdrop-blur transition-opacity sm:opacity-0 sm:group-hover/gallery:opacity-100 sm:focus-visible:opacity-100"
              aria-label="Ảnh trước"
              onClick={goToPrevious}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-4 rounded-full bg-background/90 shadow-sm backdrop-blur transition-opacity sm:opacity-0 sm:group-hover/gallery:opacity-100 sm:focus-visible:opacity-100"
              aria-label="Ảnh tiếp theo"
              onClick={goToNext}
            >
              <ChevronRight />
            </Button>
          </>
        )}
      </div>

      {galleryImages.length > 0 && (
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1">
          {galleryImages.map((image, index) => (
            <Button
              key={image}
              type="button"
              variant="ghost"
              className={cn(
                'relative aspect-square h-auto w-24 shrink-0 overflow-hidden rounded-2xl border p-0 transition-colors',
                index === activeIndex ? 'border-foreground ring-2 ring-ring/20' : 'border-border hover:border-foreground/40',
              )}
              aria-label={`Ảnh ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => setSelectedIndex(index)}
            >
              <Image
                src={cloudinaryImage(image, 'f_auto,q_auto,w_240,c_fill,ar_1:1')}
                alt={`${name} - ảnh ${index + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
            </Button>
          ))}
        </div>
      )}

      <Dialog open={viewerOpen} onOpenChange={setViewerOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-6xl gap-3 p-3 sm:max-w-6xl" showCloseButton>
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="relative flex h-[75vh] min-h-80 items-center justify-center overflow-hidden rounded-lg bg-muted/30">
            {selectedImage && (
              <Image
                src={cloudinaryImage(selectedImage, 'f_auto,q_auto,w_1600')}
                alt={name}
                fill
                sizes="90vw"
                className="object-contain"
              />
            )}

            {hasMultipleImages && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 rounded-full bg-background/90 shadow-sm backdrop-blur"
                  aria-label="Ảnh trước"
                  onClick={goToPrevious}
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 rounded-full bg-background/90 shadow-sm backdrop-blur"
                  aria-label="Ảnh tiếp theo"
                  onClick={goToNext}
                >
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-1">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <span className="shrink-0 text-sm text-muted-foreground">
              {activeIndex + 1} / {galleryImages.length}
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
