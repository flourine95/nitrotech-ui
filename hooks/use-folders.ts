'use client';
import { useEffect, useState } from 'react';
import { getFolders, type CloudinaryFolder } from '@/lib/api/upload';

const CACHE_KEY = 'media:folders';

const FALLBACK: CloudinaryFolder[] = ['brands', 'products', 'categories', 'avatars', 'banners'].map(
  (f) => ({ name: f, path: f, external_id: '' }),
);

function readCache(): CloudinaryFolder[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as CloudinaryFolder[]) : null;
  } catch {
    return null;
  }
}

function writeCache(data: CloudinaryFolder[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {}
}

export function useFolders(enabled: boolean) {
  const [folders, setFolders] = useState<CloudinaryFolder[]>(FALLBACK);

  useEffect(() => {
    // Đọc cache sau hydration để tránh mismatch
    const cached = readCache();
    if (cached) setFolders(cached);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    getFolders()
      .then((data) => {
        if (!data.length) return;
        writeCache(data);
        setFolders(data);
      })
      .catch(() => {});
  }, [enabled]);

  return folders;
}
