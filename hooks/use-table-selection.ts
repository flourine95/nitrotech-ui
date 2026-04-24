import { useCallback, useState } from 'react';

interface UseTableSelectionReturn {
  selectedIds: Set<number>;
  allSelected: boolean;
  someSelected: boolean;
  toggleSelect: (id: number) => void;
  toggleSelectAll: (allIds: number[]) => void;
  clearSelection: () => void;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

export function useTableSelection(currentIds: number[]): UseTableSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const allSelected = currentIds.length > 0 && currentIds.every((id) => selectedIds.has(id));
  const someSelected = currentIds.some((id) => selectedIds.has(id)) && !allSelected;

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback((allIds: number[]) => {
    setSelectedIds((prev) => (prev.size === allIds.length ? new Set() : new Set(allIds)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    selectedIds,
    allSelected,
    someSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    setSelectedIds,
  };
}
