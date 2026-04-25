'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckIcon,
  ClipboardIcon,
  FolderIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { type AllowedFolder, type CloudinaryResource } from '@/lib/api/upload';
import { useMediaAssets } from '@/hooks/use-media-assets';
import { useCopy } from '@/hooks/use-copy';
import { useFolders } from '@/hooks/use-folders';
import { formatBytes } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UploadZone } from './upload-zone';
import { DetailPanel } from './detail-panel';
import { AssetGrid } from './asset-grid';
import { AssetList } from './asset-list';

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
  }, []);

  useEffect(() => {
    load(activeFolder);
  }, []); // eslint-disable-line

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    setSelected(new Set());
    setActiveAsset(null);
    setSearch('');
    load(activeFolder);
  }, [activeFolder]); // eslint-disable-line

  const filtered = useMemo(
    () => !search ? assets : assets.filter((a) => a.display_name.toLowerCase().includes(search.toLowerCase())),
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
    const urls = filtered.filter((a) => selected.has(a.asset_id)).map((a) => a.secure_url).join('\n');
    navigator.clipboard.writeText(urls);
    toast.success(`Đã sao chép ${selected.size} URL`);
  }

  return (
    <div className="-m-6 flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b bg-card px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">Thư viện hình ảnh</h1>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {assets.length} ảnh · {formatBytes(totalSize)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <SearchIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm ảnh... (/)"
              className="h-8 w-52 pr-8 pl-8 text-sm"
              aria-label="Tìm kiếm ảnh"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch('')}
                aria-label="Xóa tìm kiếm"
                className="absolute top-1/2 right-1 size-6 -translate-y-1/2"
              >
                <XIcon className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-md border">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => setView('grid')}
              aria-label="Xem dạng lưới"
              aria-pressed={view === 'grid'}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => setView('list')}
              aria-label="Xem dạng danh sách"
              aria-pressed={view === 'list'}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Upload toggle */}
          <Button
            variant={showUpload ? 'outline' : 'default'}
            size="sm"
            className="h-8"
            onClick={() => setShowUpload((v) => !v)}
          >
            <UploadIcon className="h-4 w-4" />
            {showUpload ? 'Đóng' : 'Tải lên'}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Folder sidebar */}
        <nav className="flex w-48 shrink-0 flex-col gap-0.5 overflow-y-auto border-r bg-card p-2" aria-label="Thư mục">
          <p className="mb-1 px-2 pt-1 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Thư mục
          </p>
          {folderList.map((f) => (
            <button
              key={f.path}
              onClick={() => setActiveFolder(f.path)}
              aria-current={activeFolder === f.path ? 'true' : undefined}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                activeFolder === f.path
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <FolderIcon className={cn('h-4 w-4 shrink-0', activeFolder === f.path ? 'text-foreground' : 'text-muted-foreground/60')} aria-hidden="true" />
              <span className="truncate capitalize">{f.name}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Selection bar */}
          {selected.size > 0 && (
            <div className="flex shrink-0 items-center gap-3 border-b bg-muted/50 px-4 py-2">
              <span className="text-sm font-medium text-foreground">
                {selected.size} ảnh đã chọn
              </span>
              <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={copySelected}>
                {copied ? <CheckIcon className="h-3 w-3" /> : <ClipboardIcon className="h-3 w-3" />}
                Sao chép {selected.size} URL
              </Button>
              <button
                onClick={() => setSelected(new Set())}
                className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Bỏ chọn
              </button>
              <button
                onClick={() => setSelected(new Set(filtered.map((a) => a.asset_id)))}
                className="cursor-pointer text-xs text-muted-foreground transition-colors hover:text-foreground"
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
                  onUploaded={() => { load(activeFolder); setShowUpload(false); }}
                />
              )}

              {search && (
                <p className="text-xs text-muted-foreground">
                  {filtered.length} kết quả cho &ldquo;<span className="font-medium text-foreground">{search}</span>&rdquo;
                </p>
              )}

              {loading ? (
                <div className={view === 'grid'
                  ? 'grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
                  : 'space-y-2'
                }>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={cn('animate-pulse rounded-md bg-muted', view === 'grid' ? 'aspect-square' : 'h-14')} />
                  ))}
                </div>
              ) : view === 'grid' ? (
                <AssetGrid assets={filtered} selected={selected} active={activeAsset?.asset_id ?? null} onToggle={toggleSelect} onSelect={handleSelectAsset} />
              ) : (
                <AssetList assets={filtered} selected={selected} active={activeAsset?.asset_id ?? null} onToggle={toggleSelect} onSelect={handleSelectAsset} />
              )}

              {nextCursor && !search && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" size="sm" onClick={() => load(activeFolder, false)} disabled={loadingMore}>
                    {loadingMore ? 'Đang tải...' : 'Tải thêm ảnh'}
                  </Button>
                </div>
              )}
            </div>

            {activeAsset && (
              <div className="shrink-0 border-l p-3">
                <DetailPanel asset={activeAsset} onClose={() => setActiveAsset(null)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
