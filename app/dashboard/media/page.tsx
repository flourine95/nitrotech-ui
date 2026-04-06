'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { type AllowedFolder, type CloudinaryResource } from '@/lib/upload-api';
import { useMediaAssets } from '@/hooks/use-media-assets';
import { useCopy } from '@/hooks/use-copy';
import { useFolders } from '@/hooks/use-folders';
import { formatBytes } from '@/lib/utils';
import { UploadZone } from './_components/upload-zone';
import { DetailPanel } from './_components/detail-panel';
import { AssetGrid } from './_components/asset-grid';
import { AssetList } from './_components/asset-list';

export default function MediaPage() {
  const { assets, loading, loadingMore, nextCursor, load } = useMediaAssets();
  const { copied, copy } = useCopy();
  const folders = useFolders(true);

  const [activeFolder, setActiveFolder] = useState<AllowedFolder>('brands');
  const [activeAsset, setActiveAsset] = useState<CloudinaryResource | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Stable keyboard handler via ref — avoids re-subscribing on every render
  const onKeyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  onKeyRef.current = (e: KeyboardEvent) => {
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
      e.preventDefault();
      searchRef.current?.focus();
    }
    if (e.key === 'Escape') {
      setActiveAsset(null);
      setSearch('');
    }
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKeyRef.current(e);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []); // stable — never re-subscribes

  // Load initial assets khi có token
  useEffect(() => {
    if (!accessToken) return;
    load(activeFolder);
  }, [accessToken]); // eslint-disable-line

  // Reload when folder changes (skip initial — handled above)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!accessToken) return;
    setSelected(new Set());
    setActiveAsset(null);
    setSearch('');
    load(activeFolder);
  }, [activeFolder]); // eslint-disable-line

  // Memoized derived state
  const filtered = useMemo(
    () =>
      !search
        ? assets
        : assets.filter((a) => a.display_name.toLowerCase().includes(search.toLowerCase())),
    [assets, search],
  );

  const totalSize = useMemo(() => assets.reduce((s, a) => s + a.bytes, 0), [assets]);

  const folderList = useMemo(
    () => folders.map((f) => ({ name: f.name, path: f.path as AllowedFolder })),
    [folders],
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSelectAsset(a: CloudinaryResource) {
    setActiveAsset((prev) => (prev?.asset_id === a.asset_id ? null : a));
  }

  function copySelected() {
    const urls = filtered
      .filter((a) => selected.has(a.asset_id))
      .map((a) => a.secure_url)
      .join('\n');
    navigator.clipboard.writeText(urls);
    toast.success(`Đã copy ${selected.size} URL`);
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-bold text-slate-900">Thư viện hình ảnh</h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
            {assets.length} ảnh · {formatBytes(totalSize)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm ảnh... (/)"
              className="w-52 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pr-8 pl-8 text-sm text-slate-700 transition-all outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-xl border border-slate-200">
            {(['grid', 'list'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`cursor-pointer px-2.5 py-1.5 transition-colors ${view === v ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
              >
                {v === 'grid' ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="8" y1="6" x2="21" y2="6" />
                    <line x1="8" y1="12" x2="21" y2="12" />
                    <line x1="8" y1="18" x2="21" y2="18" />
                    <line x1="3" y1="6" x2="3.01" y2="6" />
                    <line x1="3" y1="12" x2="3.01" y2="12" />
                    <line x1="3" y1="18" x2="3.01" y2="18" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Upload toggle */}
          <button
            onClick={() => setShowUpload((v) => !v)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors ${showUpload ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {showUpload ? 'Đóng' : 'Upload'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Folder sidebar */}
        <nav className="flex w-48 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-slate-200 bg-white p-2">
          <p className="mb-1 px-2 pt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Folders
          </p>
          {folderList.map((f) => (
            <button
              key={f.path}
              onClick={() => setActiveFolder(f.path)}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                activeFolder === f.path
                  ? 'bg-indigo-50 font-semibold text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 shrink-0 ${activeFolder === f.path ? 'text-indigo-500' : 'text-slate-400'}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              <span className="truncate capitalize">{f.name}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Selection bar */}
          {selected.size > 0 && (
            <div className="flex shrink-0 items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-2">
              <span className="text-sm font-semibold text-indigo-700">
                {selected.size} ảnh đã chọn
              </span>
              <button
                onClick={copySelected}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                {copied ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
                Copy {selected.size} URL
              </button>
              <button
                onClick={() => setSelected(new Set())}
                className="cursor-pointer text-xs text-indigo-500 transition-colors hover:text-indigo-700"
              >
                Bỏ chọn
              </button>
              <button
                onClick={() => setSelected(new Set(filtered.map((a) => a.asset_id)))}
                className="cursor-pointer text-xs text-indigo-500 transition-colors hover:text-indigo-700"
              >
                Chọn tất cả ({filtered.length})
              </button>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex min-h-0 flex-1 overflow-y-auto">
            <div className="flex-1 space-y-4 p-4">
              {showUpload && (
                <UploadZone
                  folder={activeFolder}
                  onUploaded={() => {
                    load(activeFolder);
                    setShowUpload(false);
                  }}
                />
              )}

              {search && (
                <p className="text-xs text-slate-500">
                  {filtered.length} kết quả cho "
                  <span className="font-semibold text-slate-700">{search}</span>"
                </p>
              )}

              {loading ? (
                <div
                  className={
                    view === 'grid'
                      ? 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                      : 'space-y-2'
                  }
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`animate-pulse rounded-xl bg-slate-100 ${view === 'grid' ? 'aspect-square' : 'h-14'}`}
                    />
                  ))}
                </div>
              ) : view === 'grid' ? (
                <AssetGrid
                  assets={filtered}
                  selected={selected}
                  active={activeAsset?.asset_id ?? null}
                  onToggle={toggleSelect}
                  onSelect={handleSelectAsset}
                />
              ) : (
                <AssetList
                  assets={filtered}
                  selected={selected}
                  active={activeAsset?.asset_id ?? null}
                  onToggle={toggleSelect}
                  onSelect={handleSelectAsset}
                />
              )}

              {nextCursor && !search && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => load(activeFolder, false)}
                    disabled={loadingMore}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-6 py-2 text-sm text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
                  >
                    {loadingMore ? 'Đang tải...' : 'Tải thêm ảnh'}
                  </button>
                </div>
              )}
            </div>

            {activeAsset && (
              <div className="shrink-0 border-l border-slate-200 p-3">
                <DetailPanel asset={activeAsset} onClose={() => setActiveAsset(null)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
