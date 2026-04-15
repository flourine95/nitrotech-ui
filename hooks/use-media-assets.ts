'use client';
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getAssets, type CloudinaryResource, type AllowedFolder } from '@/lib/api/upload';

interface UseMediaAssetsReturn {
  assets: CloudinaryResource[];
  loading: boolean;
  loadingMore: boolean;
  nextCursor: string | null;
  load: (folder: string, reset?: boolean) => Promise<void>;
}

export function useMediaAssets(): UseMediaAssetsReturn {
  const [assets, setAssets] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Use ref to always have latest cursor without stale closure
  const cursorRef = useRef<string | null>(null);
  cursorRef.current = nextCursor;

  const load = useCallback(async (folder: string, reset = true) => {
    if (reset) {
      setLoading(true);
      setAssets([]);
      setNextCursor(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await getAssets(folder, reset ? undefined : (cursorRef.current ?? undefined));
      setAssets((prev) => (reset ? res.resources : [...prev, ...res.resources]));
      setNextCursor(res.nextCursor);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không thể tải ảnh');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []); // stable — no deps needed thanks to cursorRef

  return { assets, loading, loadingMore, nextCursor, load };
}
