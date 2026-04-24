import { useState } from 'react';

interface UseDialogStateReturn<T> {
  deleteTarget: T | null;
  restoreTarget: T | null;
  hardDeleteTarget: T | null;
  setDeleteTarget: (item: T | null) => void;
  setRestoreTarget: (item: T | null) => void;
  setHardDeleteTarget: (item: T | null) => void;
}

export function useDialogState<T>(): UseDialogStateReturn<T> {
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const [restoreTarget, setRestoreTarget] = useState<T | null>(null);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<T | null>(null);

  return {
    deleteTarget,
    restoreTarget,
    hardDeleteTarget,
    setDeleteTarget,
    setRestoreTarget,
    setHardDeleteTarget,
  };
}
