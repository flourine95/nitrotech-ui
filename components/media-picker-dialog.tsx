"use client"
import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"
import { getMediaAssets, type MediaAsset } from "@/lib/media-api"
import { uploadFile, getFolders, type AllowedFolder, type CloudinaryFolder } from "@/lib/upload-api"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MediaPickerProps {
  folder?: AllowedFolder
  multiple?: boolean
  onInsert: (urls: string[]) => void
  onClose: () => void
}

type Tab = "library" | "upload"
type SortKey = "newest" | "oldest" | "largest" | "smallest"
type DateFilter = "all" | "today" | "week" | "month"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

function isWithinRange(iso: string, filter: DateFilter): boolean {
  if (filter === "all") return true
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (filter === "today") return diff < 86400000
  if (filter === "week") return diff < 7 * 86400000
  if (filter === "month") return diff < 30 * 86400000
  return true
}

// ── Upload Tab ────────────────────────────────────────────────────────────────

function UploadTab({ folder, onUploaded }: { folder: AllowedFolder; onUploaded: (asset: MediaAsset) => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [queue, setQueue] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(f => f.type.startsWith("image/"))
    if (!list.length) { toast.error("Chỉ chấp nhận file ảnh"); return }
    setUploading(true)
    setQueue(list.map(f => f.name))
    for (const file of list) {
      try {
        const result = await uploadFile(file, folder)
        onUploaded({
          publicId: result.public_id, secureUrl: result.secure_url,
          width: result.width, height: result.height, format: result.format,
          bytes: file.size, createdAt: new Date().toISOString(),
        })
        setQueue(q => q.filter(n => n !== file.name))
      } catch {
        toast.error(`Upload thất bại: ${file.name}`)
        setQueue(q => q.filter(n => n !== file.name))
      }
    }
    setUploading(false)
  }

  return (
    <div className="p-5">
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files) }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-12 transition-all ${
          dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <svg viewBox="0 0 24 24" className="h-8 w-8 animate-spin text-indigo-500" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".2"/><path d="M21 12a9 9 0 00-9-9"/>
            </svg>
            <p className="text-sm text-slate-500">Đang upload {queue.length} file...</p>
            <div className="w-48 space-y-1">
              {queue.map(n => <div key={n} className="h-1 w-full animate-pulse rounded-full bg-indigo-200" />)}
            </div>
          </div>
        ) : (
          <>
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors ${dragging ? "border-indigo-300 bg-indigo-100" : "border-slate-200 bg-white shadow-sm"}`}>
              <svg viewBox="0 0 24 24" className={`h-6 w-6 ${dragging ? "text-indigo-600" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">{dragging ? "Thả ảnh vào đây" : "Kéo thả hoặc click để chọn"}</p>
              <p className="mt-1 text-xs text-slate-400">PNG, JPG, WebP, GIF · Folder: <span className="font-medium text-slate-600">{folder}</span></p>
            </div>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => e.target.files && processFiles(e.target.files)} />
      </div>
    </div>
  )
}

// ── Library Tab ───────────────────────────────────────────────────────────────

function LibraryTab({ folder, multiple, selected, onToggle }: {
  folder: string
  multiple: boolean
  selected: Set<string>
  onToggle: (asset: MediaAsset) => void
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortKey>("newest")
  const [dateFilter, setDateFilter] = useState<DateFilter>("all")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMediaAssets(folder)
      setAssets(res.assets)
      setNextCursor(res.nextCursor)
    } catch {
      toast.error("Không thể tải danh sách ảnh")
    } finally {
      setLoading(false)
    }
  }, [folder])

  useEffect(() => { load() }, [load])

  async function loadMore() {
    if (!nextCursor) return
    setLoadingMore(true)
    try {
      const res = await getMediaAssets(folder, nextCursor)
      setAssets(prev => [...prev, ...res.assets])
      setNextCursor(res.nextCursor)
    } finally {
      setLoadingMore(false)
    }
  }

  const filtered = useMemo(() => {
    let list = assets.filter(a => {
      const matchSearch = !search || a.publicId.toLowerCase().includes(search.toLowerCase())
      const matchDate = isWithinRange(a.createdAt, dateFilter)
      return matchSearch && matchDate
    })
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sort === "oldest") list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    if (sort === "largest") list = [...list].sort((a, b) => b.bytes - a.bytes)
    if (sort === "smallest") list = [...list].sort((a, b) => a.bytes - b.bytes)
    return list
  }, [assets, search, sort, dateFilter])

  return (
    <div className="flex flex-col gap-0">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-2.5">
        {/* Search */}
        <div className="relative flex-1 min-w-32">
          <svg viewBox="0 0 24 24" className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm ảnh..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100" />
        </div>

        {/* Date filter */}
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateFilter)}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-400">
          <option value="all">Tất cả ngày</option>
          <option value="today">Hôm nay</option>
          <option value="week">7 ngày qua</option>
          <option value="month">30 ngày qua</option>
        </select>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-indigo-400">
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="largest">Lớn nhất</option>
          <option value="smallest">Nhỏ nhất</option>
        </select>

        <span className="text-xs text-slate-400">{filtered.length} ảnh</span>
      </div>

      {/* Grid */}
      <div className="overflow-y-auto p-4" style={{ maxHeight: "calc(85vh - 220px)" }}>
        {loading ? (
          <div className="grid grid-cols-4 gap-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : !filtered.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <svg viewBox="0 0 24 24" className="mb-3 h-10 w-10 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <p className="text-sm">{search || dateFilter !== "all" ? "Không tìm thấy ảnh nào" : "Chưa có ảnh nào"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2.5">
            {filtered.map(asset => {
              const isSel = selected.has(asset.secureUrl)
              return (
                <button key={asset.publicId} onClick={() => onToggle(asset)}
                  className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                    isSel ? "border-indigo-500 ring-2 ring-indigo-200" : "border-transparent hover:border-slate-300"
                  }`}>
                  <img src={asset.secureUrl} alt="" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" loading="lazy" />
                  {/* Overlay */}
                  <div className={`pointer-events-none absolute inset-0 transition-colors ${isSel ? "bg-indigo-500/20" : "bg-black/0 group-hover:bg-black/15"}`} />
                  {/* Checkmark */}
                  {isSel && (
                    <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 shadow">
                      <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                  )}
                  {/* Info on hover */}
                  <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-3 transition-transform duration-200 group-hover:translate-y-0">
                    <p className="text-[10px] text-white/80">{asset.width}×{asset.height} · {formatBytes(asset.bytes)}</p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {nextCursor && (
          <div className="mt-4 flex justify-center">
            <button onClick={loadMore} disabled={loadingMore}
              className="cursor-pointer rounded-full border border-slate-200 px-5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors">
              {loadingMore ? "Đang tải..." : "Tải thêm"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export default function MediaPickerDialog({
  folder: defaultFolder = "brands",
  multiple = false,
  onInsert,
  onClose,
}: MediaPickerProps) {
  const [tab, setTab] = useState<Tab>("library")
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map())
  const [libraryKey, setLibraryKey] = useState(0)
  const [folders, setFolders] = useState<CloudinaryFolder[]>([])
  const [activeFolder, setActiveFolder] = useState<string>(defaultFolder)

  useEffect(() => {
    getFolders().then(setFolders).catch(() => {})
  }, [])

  // Esc to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  function toggleAsset(asset: MediaAsset) {
    setSelected(prev => {
      const next = new Map(prev)
      if (next.has(asset.secureUrl)) {
        next.delete(asset.secureUrl)
      } else {
        if (!multiple) next.clear()
        next.set(asset.secureUrl, asset)
      }
      return next
    })
  }

  function handleFolderChange(f: string) {
    setActiveFolder(f)
    setSelected(new Map())
    setLibraryKey(k => k + 1)
  }

  function handleUploaded(asset: MediaAsset) {
    toggleAsset(asset)
    setLibraryKey(k => k + 1)
    setTab("library")
    toast.success("Upload thành công")
  }

  function handleInsert() {
    if (!selected.size) return
    onInsert(Array.from(selected.keys()))
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      onMouseDown={e => e.stopPropagation()}
    >
      <div
        className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-5 py-3.5">
          {/* Tabs */}
          <div className="flex gap-0.5 rounded-xl bg-slate-100 p-1">
            {(["library", "upload"] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}>
                {t === "library" ? "Thư viện" : "Upload"}
              </button>
            ))}
          </div>

          {/* Folder pills — only in library */}
          {tab === "library" && folders.length > 0 && (
            <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
              {folders.map(f => (
                <button key={f.path} onClick={() => handleFolderChange(f.path)}
                  className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeFolder === f.path ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
                  {f.name}
                </button>
              ))}
            </div>
          )}

          <button onClick={onClose}
            className="ml-auto cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
            aria-label="Đóng">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-hidden">
          {tab === "library" ? (
            <LibraryTab key={libraryKey} folder={activeFolder} multiple={multiple}
              selected={new Set(selected.keys())} onToggle={toggleAsset} />
          ) : (
            <UploadTab folder={activeFolder as AllowedFolder} onUploaded={handleUploaded} />
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-100 px-5 py-3.5">
          <span className="text-sm text-slate-400">
            {selected.size > 0
              ? <span className="font-medium text-slate-700">{selected.size} ảnh đã chọn</span>
              : "Chưa chọn ảnh nào"}
          </span>
          <div className="flex gap-2.5">
            <button onClick={onClose}
              className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              Hủy
            </button>
            <button onClick={handleInsert} disabled={!selected.size}
              className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors">
              Chèn {selected.size > 0 ? `(${selected.size})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
