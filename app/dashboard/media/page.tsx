"use client"
import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"
import {
  getAssets, getFolders, uploadFile,
  type CloudinaryResource, type CloudinaryFolder, type AllowedFolder,
} from "@/lib/upload-api"
import { useAuthStore } from "@/store/auth"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}
function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 1800)
    })
  }
  return { copied, copy }
}

// ── Upload Zone (inline drag-drop) ────────────────────────────────────────────

function UploadZone({ folder, onUploaded }: { folder: AllowedFolder; onUploaded: () => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ name: string; done: boolean }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files).filter(f => f.type.startsWith("image/"))
    if (!list.length) { toast.error("Chỉ chấp nhận file ảnh"); return }
    setUploading(true)
    setProgress(list.map(f => ({ name: f.name, done: false })))
    let ok = 0
    for (const file of list) {
      try {
        await uploadFile(file, folder)
        ok++
        setProgress(p => p.map(x => x.name === file.name ? { ...x, done: true } : x))
      } catch {
        toast.error(`Thất bại: ${file.name}`)
        setProgress(p => p.filter(x => x.name !== file.name))
      }
    }
    setUploading(false)
    setProgress([])
    if (ok) { toast.success(`Đã upload ${ok} ảnh`); onUploaded() }
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true) }}
      onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false) }}
      onDrop={e => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files) }}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 transition-all duration-200 ${
        dragging ? "border-indigo-400 bg-indigo-50 scale-[1.01]" : "border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/40"
      } ${uploading ? "pointer-events-none" : ""}`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <svg viewBox="0 0 24 24" className="h-6 w-6 animate-spin text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".2"/><path d="M21 12a9 9 0 00-9-9"/>
            </svg>
          </div>
          <div className="space-y-1.5 w-48">
            {progress.map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full bg-indigo-500 transition-all duration-500 ${p.done ? "w-full" : "w-1/2 animate-pulse"}`} />
                </div>
                <span className="w-3 shrink-0">{p.done && <svg viewBox="0 0 24 24" className="h-3 w-3 text-green-500" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500">Đang upload {progress.filter(p => !p.done).length} file...</p>
        </div>
      ) : (
        <>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-colors ${dragging ? "bg-indigo-100" : "bg-white shadow-sm border border-slate-200"}`}>
            <svg viewBox="0 0 24 24" className={`h-6 w-6 transition-colors ${dragging ? "text-indigo-600" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">{dragging ? "Thả ảnh vào đây" : "Kéo thả ảnh hoặc click để chọn"}</p>
            <p className="mt-0.5 text-xs text-slate-400">PNG, JPG, WebP, GIF · Tối đa 10MB · Folder: <span className="font-medium text-slate-600">{folder}</span></p>
          </div>
        </>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={e => e.target.files && processFiles(e.target.files)} />
    </div>
  )
}

// ── Detail Panel ──────────────────────────────────────────────────────────────

function DetailPanel({ asset, onClose }: { asset: CloudinaryResource; onClose: () => void }) {
  const { copied, copy } = useCopy()

  return (
    <aside className="flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Preview */}
      <div className="relative bg-[repeating-conic-gradient(#f1f5f9_0%_25%,white_0%_50%)] bg-[length:16px_16px]">
        <img src={asset.secure_url} alt={asset.display_name}
          className="h-52 w-full object-contain" />
        <button onClick={onClose}
          className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          aria-label="Đóng">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <a href={asset.secure_url} target="_blank" rel="noopener noreferrer"
          className="absolute top-2 left-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          title="Mở ảnh gốc">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        </a>
      </div>

      {/* Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Thông tin</p>
          <div className="space-y-2">
            {[
              { label: "Tên file", value: `${asset.display_name}.${asset.format}` },
              { label: "Kích thước", value: `${asset.width} × ${asset.height}px` },
              { label: "Dung lượng", value: formatBytes(asset.bytes) },
              { label: "Định dạng", value: asset.format.toUpperCase() },
              { label: "Ngày tạo", value: formatDate(asset.created_at) },
              { label: "Folder", value: asset.asset_folder },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2">
                <span className="text-xs text-slate-400 shrink-0">{label}</span>
                <span className="text-xs font-medium text-slate-700 text-right truncate max-w-[60%]">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copy fields */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sao chép</p>
          {[
            { label: "URL", value: asset.secure_url, key: "url" },
            { label: "Public ID", value: asset.public_id, key: "pid" },
          ].map(({ label, value, key }) => (
            <div key={key} className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <code className="flex-1 truncate text-xs text-slate-600">{value}</code>
              <button onClick={() => copy(value, key)}
                className="cursor-pointer shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                title={`Copy ${label}`}>
                {copied === key
                  ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                  : <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                }
              </button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

// ── Asset Grid ────────────────────────────────────────────────────────────────

function AssetGrid({ assets, selected, active, onToggle, onSelect }: {
  assets: CloudinaryResource[]
  selected: Set<string>
  active: string | null
  onToggle: (id: string) => void
  onSelect: (a: CloudinaryResource) => void
}) {
  const { copied, copy } = useCopy()

  if (!assets.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <svg viewBox="0 0 24 24" className="mb-3 h-14 w-14 text-slate-200" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
      <p className="text-sm font-medium text-slate-500">Chưa có ảnh nào</p>
      <p className="mt-1 text-xs text-slate-400">Upload ảnh đầu tiên vào folder này</p>
    </div>
  )

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {assets.map(a => {
        const isSel = selected.has(a.asset_id)
        const isActive = active === a.asset_id
        return (
          <div
            key={a.asset_id}
            onClick={() => onSelect(a)}
            className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl transition-all duration-150 ${
              isActive ? "ring-2 ring-indigo-500 ring-offset-2" :
              isSel ? "ring-2 ring-indigo-400 ring-offset-1" :
              "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"
            }`}
          >
            {/* Image */}
            <img src={a.secure_url} alt={a.display_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy" />

            {/* Dark overlay on hover */}
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/25" />

            {/* Checkbox — top left */}
            <button
              onClick={e => { e.stopPropagation(); onToggle(a.asset_id) }}
              className={`absolute top-2 left-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-150 ${
                isSel
                  ? "border-indigo-500 bg-indigo-500 opacity-100"
                  : "border-white/80 bg-black/20 opacity-0 group-hover:opacity-100"
              }`}
              aria-label="Chọn ảnh"
            >
              {isSel && <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}
            </button>

            {/* Copy URL button — top right */}
            <button
              onClick={e => { e.stopPropagation(); copy(a.secure_url, a.asset_id) }}
              className="absolute top-2 right-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-black/30 text-white opacity-0 backdrop-blur-sm transition-all duration-150 hover:bg-black/50 group-hover:opacity-100"
              title="Copy URL"
            >
              {copied === a.asset_id
                ? <svg viewBox="0 0 24 24" className="h-3 w-3 text-green-400" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              }
            </button>

            {/* Bottom info bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-4 transition-transform duration-200 group-hover:translate-y-0">
              <p className="truncate text-xs font-medium text-white">{a.display_name}</p>
              <p className="text-[10px] text-white/70">{a.width}×{a.height} · {formatBytes(a.bytes)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Asset List ────────────────────────────────────────────────────────────────

function AssetList({ assets, selected, active, onToggle, onSelect }: {
  assets: CloudinaryResource[]
  selected: Set<string>
  active: string | null
  onToggle: (id: string) => void
  onSelect: (a: CloudinaryResource) => void
}) {
  const { copied, copy } = useCopy()

  if (!assets.length) return (
    <div className="py-16 text-center text-sm text-slate-400">Chưa có ảnh nào</div>
  )

  return (
    <div className="divide-y divide-slate-100">
      {assets.map(a => {
        const isSel = selected.has(a.asset_id)
        const isActive = active === a.asset_id
        return (
          <div
            key={a.asset_id}
            onClick={() => onSelect(a)}
            className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors ${
              isActive ? "bg-indigo-50" : isSel ? "bg-indigo-50/50" : "hover:bg-slate-50"
            }`}
          >
            <input type="checkbox" checked={isSel}
              onChange={e => { e.stopPropagation(); onToggle(a.asset_id) }}
              onClick={e => e.stopPropagation()}
              className="h-4 w-4 shrink-0 cursor-pointer accent-indigo-600" />
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <img src={a.secure_url} alt={a.display_name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{a.display_name}</p>
              <p className="text-xs text-slate-400">{a.width}×{a.height} · {formatBytes(a.bytes)} · {formatDate(a.created_at)}</p>
            </div>
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">{a.format}</span>
            <button
              onClick={e => { e.stopPropagation(); copy(a.secure_url, a.asset_id) }}
              className="cursor-pointer shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
              title="Copy URL"
            >
              {copied === a.asset_id
                ? <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                : <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
              }
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

const FALLBACK_FOLDERS: AllowedFolder[] = ["brands", "products", "categories", "avatars", "banners"]

export default function MediaPage() {
  const accessToken = useAuthStore(s => s.accessToken)
  const [folders, setFolders] = useState<CloudinaryFolder[]>([])
  const [activeFolder, setActiveFolder] = useState<AllowedFolder>("brands")
  const [assets, setAssets] = useState<CloudinaryResource[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [activeAsset, setActiveAsset] = useState<CloudinaryResource | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const { copied, copy } = useCopy()
  const searchRef = useRef<HTMLInputElement>(null)

  // Keyboard shortcut: / to focus search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault()
        searchRef.current?.focus()
      }
      if (e.key === "Escape") {
        setActiveAsset(null)
        setSearch("")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!accessToken) return
    getFolders().then(data => {
      setFolders(data)
      if (data.length) setActiveFolder(data[0].path as AllowedFolder)
    }).catch(() => {})
  }, [accessToken])

  const loadAssets = useCallback(async (folder: string, reset = true) => {
    if (reset) { setLoading(true); setAssets([]); setNextCursor(null); setSelected(new Set()); setActiveAsset(null) }
    else setLoadingMore(true)
    try {
      const res = await getAssets(folder, reset ? undefined : nextCursor ?? undefined)
      setAssets(prev => reset ? res.resources : [...prev, ...res.resources])
      setNextCursor(res.nextCursor)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Không thể tải ảnh")
    } finally {
      setLoading(false); setLoadingMore(false)
    }
  }, [nextCursor])

  useEffect(() => {
    if (!accessToken) return
    loadAssets(activeFolder)
  }, [activeFolder, accessToken]) // eslint-disable-line

  function switchFolder(folder: AllowedFolder) {
    if (folder === activeFolder) return
    setActiveFolder(folder); setSearch(""); setShowUpload(false)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleSelectAsset(a: CloudinaryResource) {
    setActiveAsset(prev => prev?.asset_id === a.asset_id ? null : a)
  }

  function copySelected() {
    const urls = filtered.filter(a => selected.has(a.asset_id)).map(a => a.secure_url).join("\n")
    navigator.clipboard.writeText(urls)
    toast.success(`Đã copy ${selected.size} URL`)
  }

  const filtered = assets.filter(a =>
    !search || a.display_name.toLowerCase().includes(search.toLowerCase())
  )

  const folderList = folders.length
    ? folders.map(f => ({ name: f.name, path: f.path as AllowedFolder }))
    : FALLBACK_FOLDERS.map(f => ({ name: f, path: f }))

  const totalSize = assets.reduce((s, a) => s + a.bytes, 0)

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-0 overflow-hidden -m-6">

      {/* ── Top bar ── */}
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
            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm ảnh... (/)"
              className="w-52 rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-8 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-700">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex overflow-hidden rounded-xl border border-slate-200">
            {(["grid", "list"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`cursor-pointer px-2.5 py-1.5 transition-colors ${view === v ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
                {v === "grid"
                  ? <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  : <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                }
              </button>
            ))}
          </div>

          {/* Upload toggle */}
          <button onClick={() => setShowUpload(v => !v)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-semibold transition-colors ${showUpload ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            {showUpload ? "Đóng" : "Upload"}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1">

        {/* Folder sidebar */}
        <nav className="flex w-48 shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-slate-200 bg-white p-2">
          <p className="mb-1 px-2 pt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Folders</p>
          {folderList.map(f => (
            <button key={f.path} onClick={() => switchFolder(f.path)}
              className={`flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                activeFolder === f.path
                  ? "bg-indigo-50 font-semibold text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}>
              <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 ${activeFolder === f.path ? "text-indigo-500" : "text-slate-400"}`} fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              <span className="truncate capitalize">{f.name}</span>
            </button>
          ))}
        </nav>

        {/* Content area */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* Selection bar */}
          {selected.size > 0 && (
            <div className="flex shrink-0 items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-4 py-2">
              <span className="text-sm font-semibold text-indigo-700">{selected.size} ảnh đã chọn</span>
              <button onClick={copySelected}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
                {copied ? <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                  : <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>}
                Copy {selected.size} URL
              </button>
              <button onClick={() => setSelected(new Set())}
                className="cursor-pointer text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                Bỏ chọn
              </button>
              <button onClick={() => setSelected(new Set(filtered.map(a => a.asset_id)))}
                className="cursor-pointer text-xs text-indigo-500 hover:text-indigo-700 transition-colors">
                Chọn tất cả ({filtered.length})
              </button>
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex min-h-0 flex-1 overflow-y-auto">
            <div className="flex-1 p-4 space-y-4">
              {/* Upload zone */}
              {showUpload && (
                <UploadZone folder={activeFolder}
                  onUploaded={() => { loadAssets(activeFolder); setShowUpload(false) }} />
              )}

              {/* Search result hint */}
              {search && (
                <p className="text-xs text-slate-500">
                  {filtered.length} kết quả cho "<span className="font-semibold text-slate-700">{search}</span>"
                </p>
              )}

              {/* Grid / List */}
              {loading ? (
                <div className={view === "grid"
                  ? "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  : "space-y-2"}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={`animate-pulse rounded-xl bg-slate-100 ${view === "grid" ? "aspect-square" : "h-14"}`} />
                  ))}
                </div>
              ) : view === "grid" ? (
                <AssetGrid assets={filtered} selected={selected} active={activeAsset?.asset_id ?? null}
                  onToggle={toggleSelect} onSelect={handleSelectAsset} />
              ) : (
                <AssetList assets={filtered} selected={selected} active={activeAsset?.asset_id ?? null}
                  onToggle={toggleSelect} onSelect={handleSelectAsset} />
              )}

              {/* Load more */}
              {nextCursor && !search && (
                <div className="flex justify-center pt-2">
                  <button onClick={() => loadAssets(activeFolder, false)} disabled={loadingMore}
                    className="cursor-pointer rounded-full border border-slate-200 bg-white px-6 py-2 text-sm text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors">
                    {loadingMore ? "Đang tải..." : "Tải thêm ảnh"}
                  </button>
                </div>
              )}
            </div>

            {/* Detail panel — slide in */}
            {activeAsset && (
              <div className="shrink-0 border-l border-slate-200 p-3">
                <DetailPanel asset={activeAsset} onClose={() => setActiveAsset(null)} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
