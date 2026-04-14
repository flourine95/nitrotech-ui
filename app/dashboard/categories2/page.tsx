'use client';

import { DragDropProvider } from '@dnd-kit/react';
import { Folder, Plus, Search, X } from 'lucide-react';
import { CategoryTreeDnd } from '@/components/category-tree-dnd';
import { useCategoryDnd } from '@/hooks/use-category-dnd';

type FilterStatus = 'all' | 'active' | 'inactive';

export default function DashboardCategoriesPage() {
  const {
    visibleTree,
    total,
    activeCount,
    rootCount,
    subCount,
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    expandedIds,
    toggleExpand,
    expandAll,
    collapseAll,
    toggleActive,
    handleDragEnd,
    dragMessage,
  } = useCategoryDnd();

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh mục</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Base local mock data · kéo thả trong cùng danh mục cha
          </p>
        </div>

        <button
          type="button"
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Tổng', value: total, color: 'text-slate-900' },
          { label: 'Hoạt động', value: activeCount, color: 'text-emerald-600' },
          { label: 'Danh mục gốc', value: rootCount, color: 'text-blue-600' },
          { label: 'Danh mục con', value: subCount, color: 'text-violet-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400">
            <Search className="h-4 w-4" />
          </span>

          <input
            type="text"
            placeholder="Tìm tên, slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />

          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600"
              aria-label="Xóa"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {(['all', 'active', 'inactive'] as FilterStatus[]).map((v) => (
            <button
              key={v}
              onClick={() => setFilterStatus(v)}
              className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                filterStatus === v
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {v === 'all' ? 'Tất cả' : v === 'active' ? 'Hoạt động' : 'Đã tắt'}
            </button>
          ))}

          <button
            onClick={expandAll}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Mở tất cả
          </button>

          <button
            onClick={collapseAll}
            className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            Đóng tất cả
          </button>
        </div>
      </div>

      {dragMessage && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {dragMessage}
        </div>
      )}

      <DragDropProvider onDragEnd={handleDragEnd as never}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {visibleTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Folder className="mb-3 h-10 w-10 text-slate-200" />
              <p className="text-sm font-medium">
                {search ? `Không tìm thấy "${search}"` : 'Chưa có danh mục nào'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-2 cursor-pointer text-xs text-blue-500 hover:underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <div className="p-2">
              <CategoryTreeDnd
                nodes={visibleTree}
                depth={0}
                expandedIds={expandedIds}
                onToggleExpand={toggleExpand}
                onToggleActive={toggleActive}
              />
            </div>
          )}

          {visibleTree.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-400">
              {search
                ? `Đang lọc theo "${search}"`
                : `${total} danh mục · ${rootCount} gốc · ${subCount} con`}
            </div>
          )}
        </div>
      </DragDropProvider>
    </div>
  );
}
