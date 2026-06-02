'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2, Maximize2 } from 'lucide-react';
import { ProductImagePlaceholder } from '@/components/product-image-placeholder';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cloudinaryImage } from '@/lib/utils/cloudinary';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  name: string;
  thumbnail: string | null;
  images: string[];
  preferredImage?: string | null;
}

export function ProductGallery({ name, thumbnail, images, preferredImage }: ProductGalleryProps) {
  const galleryImages = useMemo(() => {
    return Array.from(new Set([thumbnail, ...images, preferredImage].filter((image): image is string => !!image)));
  }, [images, preferredImage, thumbnail]);

  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (!preferredImage) return 0;
    const preferredIndex = galleryImages.indexOf(preferredImage);
    return preferredIndex >= 0 ? preferredIndex : 0;
  });
  const [viewerOpen, setViewerOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [viewerImageLoading, setViewerImageLoading] = useState(false);
  const thumbnailRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const loadedMainImages = useRef(new Set<string>());
  const loadedViewerImages = useRef(new Set<string>());
  const activeIndex = galleryImages[selectedIndex] ? selectedIndex : 0;
  const selectedImage = galleryImages[activeIndex] ?? null;
  const hasMultipleImages = galleryImages.length > 1;
  const nextImage = hasMultipleImages ? galleryImages[(activeIndex + 1) % galleryImages.length] : null;
  const previousImage = hasMultipleImages
    ? galleryImages[activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1]
    : null;

  function selectImage(index: number) {
    if (index === activeIndex) return;
    const next = galleryImages[index];
    setImageLoading(next ? !loadedMainImages.current.has(mainImageSrc(next)) : false);
    if (viewerOpen) {
      setViewerImageLoading(next ? !loadedViewerImages.current.has(viewerImageSrc(next)) : false);
    }
    setSelectedIndex(index);
  }

  function goToPrevious() {
    if (!hasMultipleImages) return;
    selectImage(activeIndex === 0 ? galleryImages.length - 1 : activeIndex - 1);
  }

  function goToNext() {
    if (!hasMultipleImages) return;
    selectImage((activeIndex + 1) % galleryImages.length);
  }

  useEffect(() => {
    thumbnailRefs.current[activeIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeIndex]);

  return (
    <div className="min-w-0">
      <div className="group/gallery relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-3xl border border-border bg-muted/30 shadow-sm">
        {selectedImage ? (
          <Image
            key={selectedImage}
            src={mainImageSrc(selectedImage)}
            alt={name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={cn('object-contain transition-opacity duration-200', imageLoading && 'opacity-40')}
            priority
            onLoad={() => {
              loadedMainImages.current.add(mainImageSrc(selectedImage));
              setImageLoading(false);
            }}
          />
        ) : (
          <ProductImagePlaceholder size="lg" className="w-48" />
        )}

        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/35 backdrop-blur-[1px]">
            <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
        )}

        {nextImage && (
          <Image
            src={mainImageSrc(nextImage)}
            alt=""
            width={1}
            height={1}
            className="pointer-events-none absolute size-px opacity-0"
            aria-hidden="true"
            onLoad={() => loadedMainImages.current.add(mainImageSrc(nextImage))}
          />
        )}
        {previousImage && previousImage !== nextImage && (
          <Image
            src={mainImageSrc(previousImage)}
            alt=""
            width={1}
            height={1}
            className="pointer-events-none absolute size-px opacity-0"
            aria-hidden="true"
            onLoad={() => loadedMainImages.current.add(mainImageSrc(previousImage))}
          />
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
              ref={(node) => {
                thumbnailRefs.current[index] = node;
              }}
              type="button"
              variant="ghost"
              className={cn(
                'relative aspect-square h-auto w-24 shrink-0 overflow-hidden rounded-2xl border p-0 transition-colors',
                index === activeIndex ? 'border-foreground ring-2 ring-ring/20' : 'border-border hover:border-foreground/40',
              )}
              aria-label={`Ảnh ${index + 1}`}
              aria-pressed={index === activeIndex}
              onClick={() => selectImage(index)}
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
                key={selectedImage}
                src={viewerImageSrc(selectedImage)}
                alt={name}
                fill
                sizes="90vw"
                className={cn('object-contain transition-opacity duration-200', viewerImageLoading && 'opacity-40')}
                onLoad={() => {
                  loadedViewerImages.current.add(viewerImageSrc(selectedImage));
                  setViewerImageLoading(false);
                }}
              />
            )}

            {viewerImageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/35 backdrop-blur-[1px]">
                <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            )}

            {nextImage && (
              <Image
                src={viewerImageSrc(nextImage)}
                alt=""
                width={1}
                height={1}
                className="pointer-events-none absolute size-px opacity-0"
                aria-hidden="true"
                onLoad={() => loadedViewerImages.current.add(viewerImageSrc(nextImage))}
              />
            )}
            {previousImage && previousImage !== nextImage && (
              <Image
                src={viewerImageSrc(previousImage)}
                alt=""
                width={1}
                height={1}
                className="pointer-events-none absolute size-px opacity-0"
                aria-hidden="true"
                onLoad={() => loadedViewerImages.current.add(viewerImageSrc(previousImage))}
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

function mainImageSrc(image: string) {
  return cloudinaryImage(image, 'f_auto,q_auto,w_1200');
}

function viewerImageSrc(image: string) {
  return cloudinaryImage(image, 'f_auto,q_auto,w_1600');
}
