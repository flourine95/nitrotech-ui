'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  CheckIcon,
  ClipboardIcon,
  FolderIcon,
  GridIcon,
  ImageIcon,
  ListIcon,
  RefreshCwIcon,
  SearchIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { type AllowedFolder, type CloudinaryResource } from '@/lib/api/upload';
import { useMediaAssets } from '@/hooks/use-media-assets';
import { useCopy } from '@/hooks/use-copy';
import { useFolders } from '@/hooks/use-folders';
import { formatBytes } from '@/lib/utils/formatting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UploadZone } from './upload-zone';
import { DetailPanel } from './detail-panel';
import { AssetGrid } from './asset-grid';
import { AssetList } from './asset-list';

export default function MediaPage() {
  const { assets, loading, loadingMore, nextCursor, load } = useMediaAssets();
  const { copied } = useCopy();
  const folders = useFolders(true);

  const [activeFolder, setActiveFolder] = useState<AllowedFolder>('brands');
  const [activeAsset, setActiveAsset] = useState<CloudinaryResource | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showUpload, setShowUpload] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setActiveAsset(null);
        setSearch('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    load(activeFolder);
  }, []); // eslint-disable-line

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const timer = setTimeout(() => {
      setSelected(new Set());
      setActiveAsset(null);
      setSearch('');
      load(activeFolder);
    }, 0);
    return () => clearTimeout(timer);
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
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
    <div className="flex h-[calc(100dvh-7.5rem)] w-full max-w-none flex-col gap-3 overflow-hidden">
      {/* Header */}
      <section className="flex flex-col gap-3 border-b border-dashed border-border/70 pb-2.5 lg:flex-row lg:items-center lg:justify-between 2xl:pb-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl border bg-card 2xl:size-11">
            <ImageIcon className="size-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight 2xl:text-2xl">Thư viện hình ảnh</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Quản lý hình ảnh sản phẩm và thư mục media trên Cloudinary.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl shadow-none"
            onClick={() => load(activeFolder)}
            disabled={loading}
          >
            <RefreshCwIcon className={cn('h-4 w-4 shrink-0', loading && 'animate-spin')} />
            Tải lại
          </Button>
          <Button
            variant={showUpload ? 'outline' : 'default'}
            className="h-10 rounded-xl"
            onClick={() => setShowUpload((v) => !v)}
          >
            <UploadIcon className="h-4 w-4" />
            {showUpload ? 'Đóng' : 'Tải lên'}
          </Button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid overflow-hidden rounded-xl border bg-card sm:grid-cols-2 xl:grid-cols-4 shrink-0">
        {[
          { label: 'Tổng số ảnh', value: assets.length, icon: ImageIcon },
          { label: 'Tổng dung lượng', value: formatBytes(totalSize), icon: FolderIcon },
          { label: 'Thư mục hiện tại', value: activeFolder.toUpperCase(), icon: FolderIcon },
          { label: 'Đang chọn', value: `${selected.size} ảnh`, icon: CheckIcon },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 border-b p-4 last:border-b-0 sm:nth-[2n+1]:border-r xl:border-b-0 xl:border-r xl:last:border-r-0"
            >
              <div>
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              </div>
              <Icon className="text-muted-foreground h-5 w-5" />
            </div>
          );
        })}
      </section>

      {/* Main Workspace */}
      <div className="flex min-h-0 flex-1 gap-3 lg:flex-row 2xl:gap-4 min-[1800px]:gap-5 overflow-hidden">
        {/* Folder sidebar */}
        <aside className="min-h-0 w-full shrink-0 overflow-y-auto p-1 pb-2 lg:w-48 xl:w-52 2xl:w-56">
          <p className="mb-2 px-2 text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
            Thư mục
          </p>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-background/70">
            {folderList.map((f) => {
              const active = activeFolder === f.path;
              return (
                <button
                  key={f.path}
                  onClick={() => setActiveFolder(f.path)}
                  className={cn(
                    'flex min-h-10 w-full cursor-pointer items-center justify-between border-b border-border/60 px-3 py-2 text-left text-foreground/80 transition-colors last:border-b-0 hover:bg-muted/20 hover:text-foreground',
                    active && 'bg-foreground/4.5 text-foreground font-semibold',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <FolderIcon className={cn('h-4 w-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground/60')} />
                    <span className="text-[13px] capitalize">{f.name}</span>
                  </span>
                  <span className={cn('size-2 rounded-full border', active ? 'border-foreground/70 bg-foreground/70' : 'border-transparent bg-transparent')} />
                </button>
              );
            })}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-dashed border-border/70 bg-background pb-3 pt-1">
            <div className="relative w-full sm:w-64 xl:w-72 shrink-0">
              <SearchIcon className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm ảnh... (/)"
                className="h-9 w-full rounded-xl pr-8 pl-8 text-sm"
                aria-label="Tìm kiếm ảnh"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearch('')}
                  aria-label="Xóa tìm kiếm"
                  className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex overflow-hidden rounded-xl border bg-background">
              <Button
                variant={view === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-none border-0 shadow-none hover:bg-muted/50"
                onClick={() => setView('grid')}
                aria-label="Xem dạng lưới"
                aria-pressed={view === 'grid'}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-none border-0 shadow-none hover:bg-muted/50"
                onClick={() => setView('list')}
                aria-label="Xem dạng danh sách"
                aria-pressed={view === 'list'}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Card Content */}
          <div className="mt-3 flex min-h-0 flex-1 overflow-hidden gap-3 rounded-xl border bg-card p-4">
            <div className="flex-1 overflow-y-auto pr-1">
              {showUpload && (
                <div className="mb-4">
                  <UploadZone
                    folder={activeFolder}
                    onUploaded={() => { load(activeFolder); setShowUpload(false); }}
                  />
                </div>
              )}

              {search && (
                <p className="text-xs text-muted-foreground mb-3">
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
                <div className="flex justify-center pt-4">
                  <Button variant="outline" size="sm" onClick={() => load(activeFolder, false)} disabled={loadingMore} className="rounded-xl shadow-none">
                    {loadingMore ? 'Đang tải...' : 'Tải thêm ảnh'}
                  </Button>
                </div>
              )}
            </div>

            {activeAsset && (
              <div className="shrink-0 h-full overflow-hidden pl-3">
                <DetailPanel asset={activeAsset} onClose={() => setActiveAsset(null)} />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Selected Bar */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-border/80 bg-background/90 px-6 py-3 shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          <span className="text-sm font-medium">
            Đã chọn <strong className="text-primary">{selected.size}</strong> ảnh
          </span>
          <div className="h-4 w-px bg-border" />
          <Button size="sm" className="h-8 gap-1.5 text-xs rounded-full" onClick={copySelected}>
            {copied ? <CheckIcon className="h-3 w-3" /> : <ClipboardIcon className="h-3 w-3" />}
            Sao chép {selected.size} URL
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-muted-foreground hover:text-foreground rounded-full"
            onClick={() => setSelected(new Set())}
          >
            Hủy
          </Button>
        </div>
      )}
    </div>
  );
}
