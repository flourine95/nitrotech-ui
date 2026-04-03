'use client';
import { useState, useCallback } from 'react';

export function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }, []);

  return { copied, copy };
}
