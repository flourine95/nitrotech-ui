'use client';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Row {
  id: number;
  key: string;
  value: string;
}

let nextId = 0;
function makeRow(key = '', value = ''): Row {
  return { id: nextId++, key, value };
}

interface KeyValueEditorProps {
  value: Record<string, string>;
  onChange: (val: Record<string, string>) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  value,
  onChange,
  keyPlaceholder = 'Thuộc tính',
  valuePlaceholder = 'Giá trị',
}: KeyValueEditorProps) {
  const [rows, setRows] = useState<Row[]>(() =>
    Object.entries(value).map(([k, v]) => makeRow(k, v)),
  );

  function emit(updated: Row[]) {
    const obj: Record<string, string> = {};
    for (const r of updated) {
      if (r.key.trim()) obj[r.key.trim()] = r.value;
    }
    onChange(obj);
  }

  function updateKey(id: number, newKey: string) {
    const updated = rows.map((r) => (r.id === id ? { ...r, key: newKey } : r));
    setRows(updated);
    emit(updated);
  }

  function updateValue(id: number, newVal: string) {
    const updated = rows.map((r) => (r.id === id ? { ...r, value: newVal } : r));
    setRows(updated);
    emit(updated);
  }

  function removeRow(id: number) {
    const updated = rows.filter((r) => r.id !== id);
    setRows(updated);
    emit(updated);
  }

  function addRow() {
    setRows((prev) => [...prev, makeRow()]);
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2">
          <input
            value={row.key}
            onChange={(e) => updateKey(row.id, e.target.value)}
            placeholder={keyPlaceholder}
            className="w-2/5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-slate-300">:</span>
          <input
            value={row.value}
            onChange={(e) => updateValue(row.id, e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm transition-colors outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => removeRow(row.id)}
            className="rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500"
            aria-label="Xóa dòng"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addRow}
        className="w-full rounded-xl border-dashed text-slate-500 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
      >
        <Plus className="h-3.5 w-3.5" />
        Thêm dòng
      </Button>
    </div>
  );
}
