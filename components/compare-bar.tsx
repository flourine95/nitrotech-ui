'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// ── Context ──────────────────────────────────────────────────────────────────
type CompareItem = { slug: string; name: string; cat: string };

type CompareCtx = {
  items: CompareItem[];
  toggle: (item: CompareItem) => void;
  has: (slug: string) => boolean;
  clear: () => void;
};

const CompareContext = createContext<CompareCtx>({
  items: [],
  toggle: () => {},
  has: () => false,
  clear: () => {},
});

export function useCompare() {
  return useContext(CompareContext);
}

const MAX = 3;

// ── Provider ─────────────────────────────────────────────────────────────────
export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);

  const toggle = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.find((p) => p.slug === item.slug)) {
        return prev.filter((p) => p.slug !== item.slug);
      }
      if (prev.length >= MAX) return prev; // đã đủ 3
      return [...prev, item];
    });
  }, []);

  const has = useCallback((slug: string) => items.some((p) => p.slug === slug), [items]);
  const clear = useCallback(() => setItems([]), []);

  return (
    <CompareContext.Provider value={{ items, toggle, has, clear }}>
      {children}
      <CompareBar />
    </CompareContext.Provider>
  );
}

// ── Floating bar ─────────────────────────────────────────────────────────────
function CompareBar() {
  const { items, toggle, clear } = useCompare();
  const router = useRouter();

  if (items.length === 0) return null;

  const slugs = items.map((i) => i.slug);
  const cats = [...new Set(items.map((i) => i.cat))];
  const mixedCategories = cats.length > 1;

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-slate-200 bg-white shadow-2xl"
      role="region"
      aria-label="So sánh sản phẩm"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        {/* Label */}
        <div className="hidden shrink-0 sm:block">
          <div className="text-sm font-semibold text-slate-900">So sánh</div>
          <div className="text-xs text-slate-400">
            {items.length}/{MAX} sản phẩm
          </div>
          {mixedCategories && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-600">
              <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0 fill-current" aria-hidden="true">
                <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
              </svg>
              Khác danh mục
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px shrink-0 bg-slate-200 sm:block" aria-hidden="true" />

        {/* Slots */}
        <div className="flex flex-1 items-center gap-3 overflow-x-auto">
          {Array.from({ length: MAX }).map((_, i) => {
            const item = items[i];
            return (
              <div
                key={i}
                className={`flex min-w-40 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                  item
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-dashed border-slate-200 text-slate-300'
                }`}
              >
                {item ? (
                  <>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-400">{item.cat}</div>
                    </div>
                    <button
                      onClick={() => toggle(item)}
                      className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full bg-slate-200 text-slate-500 transition-colors duration-150 hover:bg-rose-100 hover:text-rose-500"
                      aria-label={`Xóa ${item.name}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <span className="text-xs">Thêm sản phẩm</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={clear}
            className="cursor-pointer rounded-full px-3 py-2 text-sm text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
          >
            Xóa tất cả
          </button>
          <button
            onClick={() => router.push(`/compare?slugs=${slugs}`)}
            disabled={items.length < 2}
            className="cursor-pointer rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            So sánh ngay {items.length >= 2 && `(${items.length})`}
          </button>
        </div>
      </div>
    </div>
  );
}
