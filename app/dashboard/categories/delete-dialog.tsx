'use client';
import { Trash2 } from 'lucide-react';
import type { Category } from '@/lib/api/categories';

export function DeleteDialog({ category, onConfirm, onClose, loading }: {
  category: Category;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
          <Trash2 className="h-5 w-5" />
        </div>
        <h3 className="mb-1 text-sm font-bold text-slate-900">Xóa danh mục?</h3>
        <p className="mb-1 text-sm text-slate-500">
          Bạn sắp xóa <span className="font-semibold text-slate-800">"{category.name}"</span>.
        </p>
        {category.children?.length > 0 && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            Có {category.children.length} danh mục con — xóa con trước.
          </p>
        )}
        <p className="mb-5 text-xs text-slate-400">Soft delete, có thể khôi phục sau.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
            Hủy
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 cursor-pointer rounded-xl bg-rose-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60">
            {loading ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
