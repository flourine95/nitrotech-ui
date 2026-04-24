'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Check, ChevronDown, Loader2, Search, Upload, X } from 'lucide-react';
import {
  getAssets,
  uploadFile,
  getFolders,
  type AllowedFolder,
  type CloudinaryFolder,
} from '@/lib/api/upload';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths, startOfDay } from 'date-fns';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MediaPickerProps {
  folder?: AllowedFolder;
  multiple?: boolean;
  onInsert: (urls: string[]) => void;
  onClose: () => void;
}

interface MediaAsset {
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  createdAt: string;
}

type SortKey = 'newest' | 'oldest' | 'largest' | 'smallest';
type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom';

const ALL_FOLDER = '__all__';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function toThumbnail(url: string, size = 200): string {
  return url.replace('/upload/', `/upload/w_${size},h_${size},c_fill,f_auto,q_auto/`);
}

function presetToStartAt(preset: DatePreset, customDate?: Date): string | undefined {
  if (preset === 'today') return startOfDay(new Date()).toISOString();
  if (preset === 'week') return subDays(new Date(), 7).toISOString();
  if (preset === 'month') return subMonths(new Date(), 1).toISOString();
  if (preset === 'custom' && customDate) return startOfDay(customDate).toISOString();
  return undefined;
}

async function fetchAssets(
  folder: string,
  cursor?: string,
  startAt?: string,
): Promise<{ assets: MediaAsset[]; nextCursor: string | undefined }> {
  const res = await getAssets(folder === ALL_FOLDER ? undefined : folder, cursor, 50, startAt);
  return {
    assets: res.resources.map((r) => ({
      publicId: r.public_id,
      secureUrl: r.secure_url,
      width: r.width,
      height: r.height,
      format: r.format,
      bytes: r.bytes,
      createdAt: r.created_at,
    })),
    nextCursor: res.nextCursor ?? undefined,
  };
}

// ── Upload Tab ────────────────────────────────────────────────────────────────

function UploadTab({
  folder,
  onUploaded,
}: {
  folder: AllowedFolder;
  onUploaded: (asset: MediaAsset) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) {
      toast.error('Chỉ chấp nhận file ảnh');
      return;
    }
    setUploading(true);
    setQueue(list.map((f) => f.name));
    for (const file of list) {
      try {
        const result = await uploadFile(file, folder);
        onUploaded({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: file.size,
          createdAt: new Date().toISOString(),
        });
        setQueue((q) => q.filter((n) => n !== file.name));
      } catch {
        toast.error(`Upload thất bại: ${file.name}`);
        setQueue((q) => q.filter((n) => n !== file.name));
      }
    }
    setUploading(false);
  }

  return (
    <div className="p-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          processFiles(e.dataTransfer.files);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-14 transition-colors',
          dragging ? 'border-ring bg-accent' : 'border-border hover:border-ring hover:bg-accent/50',
          uploading && 'pointer-events-none opacity-60',
        )}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Đang upload {queue.length} file...</p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl border bg-background shadow-sm',
                dragging && 'border-ring',
              )}
            >
              <Upload
                className={cn('h-5 w-5', dragging ? 'text-foreground' : 'text-muted-foreground')}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                {dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc click để chọn'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, WebP · Folder:{' '}
                <span className="font-medium text-foreground">{folder}</span>
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

// ── Library Tab ───────────────────────────────────────────────────────────────

function LibraryTab({
  folder,
  multiple,
  selected,
  onToggle,
  assets,
  loading,
  nextCursor,
  onLoadMore,
  folders,
  onFolderChange,
}: {
  folder: string;
  multiple: boolean;
  selected: Set<string>;
  onToggle: (asset: MediaAsset) => void;
  assets: MediaAsset[];
  loading: boolean;
  nextCursor: string | undefined;
  onLoadMore: () => Promise<void>;
  folders: CloudinaryFolder[];
  onFolderChange: (f: string) => void;
}) {
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Reset filters when folder changes
  useEffect(() => {
    setSearch('');
    setSort('newest');
    setDatePreset('all');
    setCustomDate(undefined);
  }, [folder]);

  async function handleLoadMore() {
    setLoadingMore(true);
    try {
      await onLoadMore();
    } finally {
      setLoadingMore(false);
    }
  }

  const sorted = [...assets].sort((a, b) => {
    if (sort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sort === 'largest') return b.bytes - a.bytes;
    return a.bytes - b.bytes;
  });

  const filtered = sorted.filter(
    (a) => !search || a.publicId.toLowerCase().includes(search.toLowerCase()),
  );

  const dateLabel =
    datePreset === 'today'
      ? 'Hôm nay'
      : datePreset === 'week'
        ? '7 ngày qua'
        : datePreset === 'month'
          ? '30 ngày qua'
          : datePreset === 'custom' && customDate
            ? format(customDate, 'dd/MM/yyyy')
            : 'Tất cả ngày';

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(85vh - 120px)' }}>
      {/* Toolbar */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b px-4 py-2.5">
        <div className="relative min-w-32 flex-1">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ảnh..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        {/* Folder */}
        <Select value={folder} onValueChange={onFolderChange}>
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value={ALL_FOLDER}>Tất cả</SelectItem>
            {folders.map((f) => (
              <SelectItem key={f.path} value={f.path}>
                {f.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date filter */}
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
              {dateLabel}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex flex-col">
              {(['all', 'today', 'week', 'month'] as DatePreset[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setDatePreset(p);
                    setCustomDate(undefined);
                    setCalendarOpen(false);
                  }}
                  className={cn(
                    'px-4 py-2 text-left text-sm hover:bg-accent',
                    datePreset === p && 'bg-accent font-medium',
                  )}
                >
                  {p === 'all'
                    ? 'Tất cả ngày'
                    : p === 'today'
                      ? 'Hôm nay'
                      : p === 'week'
                        ? '7 ngày qua'
                        : '30 ngày qua'}
                </button>
              ))}
              <div className="border-t">
                <p className="px-4 pt-2 pb-1 text-xs text-muted-foreground">Chọn ngày cụ thể</p>
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={(d) => {
                    setCustomDate(d);
                    setDatePreset('custom');
                    setCalendarOpen(false);
                  }}
                  disabled={(d) => d > new Date()}
                  captionLayout="dropdown"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Sort */}
        <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            <SelectItem value="newest">Mới nhất</SelectItem>
            <SelectItem value="oldest">Cũ nhất</SelectItem>
            <SelectItem value="largest">Lớn nhất</SelectItem>
            <SelectItem value="smallest">Nhỏ nhất</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-xs text-muted-foreground">{filtered.length} ảnh</span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {search ? 'Không tìm thấy ảnh nào' : 'Chưa có ảnh nào'}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5">
            {filtered.map((asset) => {
              const isSel = selected.has(asset.secureUrl);
              return (
                <button
                  key={asset.publicId}
                  type="button"
                  onClick={() => onToggle(asset)}
                  className={cn(
                    'group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all',
                    isSel
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-transparent hover:border-border',
                  )}
                >
                  <img
                    src={toThumbnail(asset.secureUrl)}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className={cn(
                      'pointer-events-none absolute inset-0 transition-colors',
                      isSel ? 'bg-primary/15' : 'bg-black/0 group-hover:bg-black/10',
                    )}
                  />
                  {isSel && (
                    <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
                      <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />
                    </div>
                  )}
                  <div className="absolute right-0 bottom-0 left-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-2 pt-3 pb-1.5 transition-transform duration-200 group-hover:translate-y-0">
                    <p className="text-[10px] text-white/80">
                      {asset.width}×{asset.height} · {formatBytes(asset.bytes)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
        {nextCursor && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Tải thêm'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export default function MediaPickerDialog({
  folder: defaultFolder = 'brands',
  multiple = false,
  onInsert,
  onClose,
}: MediaPickerProps) {
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map());
  const [folders, setFolders] = useState<CloudinaryFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string>(ALL_FOLDER);

  // Cache: `${folder}::${startAt}` → { assets, nextCursor, loading }
  type CacheEntry = { assets: MediaAsset[]; nextCursor: string | undefined; loading: boolean };
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  // Date filter lives here so loadFolder can use it
  const [datePreset, setDatePreset] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>(
    'all',
  );
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const startAt = presetToStartAt(datePreset, customDate);
  const cacheKey = `${activeFolder}::${startAt ?? ''}`;

  const currentCache = cache.get(cacheKey) ?? { assets: [], nextCursor: undefined, loading: false };

  const loadFolder = useCallback(
    async (folder: string, startAtParam: string | undefined, force = false) => {
      const key = `${folder}::${startAtParam ?? ''}`;
      if (!force && cacheRef.current.has(key)) return;
      setCache((prev) =>
        new Map(prev).set(key, { assets: [], nextCursor: undefined, loading: true }),
      );
      try {
        const res = await fetchAssets(folder, undefined, startAtParam);
        setCache((prev) =>
          new Map(prev).set(key, {
            assets: res.assets,
            nextCursor: res.nextCursor,
            loading: false,
          }),
        );
      } catch {
        toast.error('Không thể tải danh sách ảnh');
        setCache((prev) =>
          new Map(prev).set(key, { assets: [], nextCursor: undefined, loading: false }),
        );
      }
    },
    [],
  );

  useEffect(() => {
    loadFolder(activeFolder, startAt);
  }, [activeFolder, startAt, loadFolder]);

  useEffect(() => {
    getFolders()
      .then(setFolders)
      .catch(() => {});
  }, []);

  async function loadMore() {
    const cur = cacheRef.current.get(cacheKey);
    if (!cur?.nextCursor) return;
    const res = await fetchAssets(activeFolder, cur.nextCursor, startAt);
    setCache((prev) => {
      const existing = prev.get(cacheKey)!;
      return new Map(prev).set(cacheKey, {
        ...existing,
        assets: [...existing.assets, ...res.assets],
        nextCursor: res.nextCursor,
      });
    });
  }

  function toggleAsset(asset: MediaAsset) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(asset.secureUrl)) {
        next.delete(asset.secureUrl);
      } else {
        if (!multiple) next.clear();
        next.set(asset.secureUrl, asset);
      }
      return next;
    });
  }

  function handleFolderChange(f: string) {
    setActiveFolder(f);
    setSelected(new Map());
  }

  function handleUploaded(asset: MediaAsset) {
    toggleAsset(asset);
    loadFolder(activeFolder, startAt, true);
    setTab('library');
    toast.success('Upload thành công');
  }

  function handleInsert() {
    if (!selected.size) return;
    onInsert(Array.from(selected.keys()));
    onClose();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[85vh] w-full max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl"
      >
        <DialogTitle className="sr-only">Chọn ảnh</DialogTitle>

        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as 'library' | 'upload')}
          className="flex flex-1 flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex shrink-0 items-center gap-3 border-b px-5 py-3">
            <TabsList className="h-8">
              <TabsTrigger value="library" className="text-xs">
                Thư viện
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs">
                Upload
              </TabsTrigger>
            </TabsList>

            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-7 w-7 shrink-0"
              onClick={onClose}
              aria-label="Đóng"
            >
              {' '}
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-hidden">
            <TabsContent value="library" className="mt-0 h-full data-[state=inactive]:hidden">
              <LibraryTab
                folder={activeFolder}
                multiple={multiple}
                selected={new Set(selected.keys())}
                onToggle={toggleAsset}
                assets={currentCache.assets}
                loading={currentCache.loading}
                nextCursor={currentCache.nextCursor}
                onLoadMore={loadMore}
                folders={folders}
                onFolderChange={handleFolderChange}
              />
            </TabsContent>
            <TabsContent value="upload" className="mt-0 h-full data-[state=inactive]:hidden">
              <UploadTab folder={defaultFolder} onUploaded={handleUploaded} />
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t px-5 py-3">
          <span className="text-sm text-muted-foreground">
            {selected.size > 0 ? (
              <span className="font-medium text-foreground">{selected.size} ảnh đã chọn</span>
            ) : (
              'Chưa chọn ảnh nào'
            )}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Hủy
            </Button>
            <Button size="sm" onClick={handleInsert} disabled={!selected.size}>
              Chèn {selected.size > 0 ? `(${selected.size})` : ''}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
