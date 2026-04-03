"use client"
import { useEffect, useRef, useState, useCallback } from "react"
import { toast } from "sonner"
import { getMediaAssets, type MediaAsset } from "@/lib/media-api"
import { uploadFile, getFolders, type AllowedFolder, type CloudinaryFolder } from "@/lib/upload-api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  /** Default folder to open. Falls back to first available folder. */
  folder?: AllowedFolder
  multiple?: boolean
  /** Called with secure_url list on confirm */
  onInsert: (urls: string[]) => void
  onClose: () => void
}

type Tab = "library" | "upload"

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ── Folder Selector ───────────────────────────────────────────────────────────

function FolderSelector({
  folders,
  value,
  onChange,
}: {
  folders: CloudinaryFolder[]
  value: string
  onChange: (f: string) => void
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 border-b border-slate-100">
      {folders.map((f) => (
        <button
          key={f.path}
          onClick={() => onChange(f.path)}
          className={`shrink-0 cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === f.path
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {f.name}
        </button>
      ))}
    </div>
  )
}

// ── Upload Tab ────────────────────────────────────────────────────────────────

function UploadTab({
  folder,
  onUploaded,
}: {
  folder: AllowedFolder
  onUploaded: (asset: MediaAsset) => void
}) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!list.length) { toast.error("Chỉ chấp nhận file ảnh"); return }

    setUploading(true)
    setProgress(list.map((f) => f.name))

    for (const file of list) {
      try {
        const result = await uploadFile(file, folder)
        onUploaded({
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: file.size,
          createdAt: new Date().toISOString(),
        })
        setProgress((p) => p.filter((n) => n !== file.name))
      } catch (e) {
        toast.error(`Upload thất bại: ${file.name}`)
        setProgress((p) => p.filter((n) => n !== file.name))
      }
    }
    setUploading(false)
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    processFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-14 transition-colors ${
          dragging ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">Kéo thả ảnh vào đây</p>
          <p className="mt-1 text-xs text-slate-400">
            hoặc click để chọn file · PNG, JPG, WebP, GIF · Folder: <span className="font-semibold">{folder}</span>
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && processFiles(e.target.files)}
        />
      </div>

      {progress.length > 0 && (
        <div className="mt-4 w-full space-y-2">
          {progress.map((name) => (
            <div key={name} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 animate-spin text-blue-500" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity=".3"/>
                <path d="M21 12a9 9 0 00-9-9"/>
              </svg>
              <span className="truncate text-xs text-slate-600">{name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Library Tab ───────────────────────────────────────────────────────────────

function LibraryTab({
  folder,
  multiple,
  selected,
  onToggle,
}: {
  folder: string
  multiple: boolean
  selected: Set<string>
  onToggle: (asset: MediaAsset) => void
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [loadingMore, setLoadingMore] = useState(false)

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
      setAssets((prev) => [...prev, ...res.assets])
      setNextCursor(res.nextCursor)
    } finally {
      setLoadingMore(false)
    }
  }

  if (loading) return (
    <div className="grid grid-cols-4 gap-3 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  )

  if (!assets.length) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <svg viewBox="0 0 24 24" className="mb-3 h-10 w-10 text-slate-300" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      <p className="text-sm">Chưa có ảnh nào trong folder này</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-4 gap-3">
        {assets.map((asset) => {
          const isSelected = selected.has(asset.secureUrl)
          return (
            <button
              key={asset.publicId}
              onClick={() => onToggle(asset)}
              className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl border-2 transition-all ${
                isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent hover:border-slate-300"
              }`}
            >
              <img src={asset.secureUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
              <div className={`absolute inset-0 transition-opacity ${
                isSelected ? "bg-blue-500/20 opacity-100" : "bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/10"
              }`} />
              {isSelected && (
                <div className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 translate-y-full bg-black/60 px-2 py-1.5 transition-transform group-hover:translate-y-0">
                <p className="truncate text-xs text-white">{formatBytes(asset.bytes)}</p>
                <p className="text-xs text-slate-300">{asset.width}×{asset.height}</p>
              </div>
            </button>
          )
        })}
      </div>

      {nextCursor && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mx-auto cursor-pointer rounded-full border border-slate-200 px-6 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60 transition-colors"
        >
          {loadingMore ? "Đang tải..." : "Tải thêm"}
        </button>
      )}
    </div>
  )
}

// ── Dialog ────────────────────────────────────────────────────────────────────

export default function MediaPickerDialog({
  folder: defaultFolder = "brands",
  multiple = false,
  onInsert,
  onClose,
}: Props) {
  const [tab, setTab] = useState<Tab>("library")
  const [selected, setSelected] = useState<Map<string, MediaAsset>>(new Map())
  const [libraryKey, setLibraryKey] = useState(0)
  const [folders, setFolders] = useState<CloudinaryFolder[]>([])
  const [activeFolder, setActiveFolder] = useState<string>(defaultFolder)

  // Load folder list once
  useEffect(() => {
    getFolders()
      .then(setFolders)
      .catch(() => {/* silently fallback to defaultFolder */})
  }, [])

  function toggleAsset(asset: MediaAsset) {
    setSelected((prev) => {
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
    setLibraryKey((k) => k + 1)
  }

  function handleUploaded(asset: MediaAsset) {
    toggleAsset(asset)
    setLibraryKey((k) => k + 1)
    setTab("library")
    toast.success("Upload thành công")
  }

  function handleInsert() {
    if (!selected.size) return
    onInsert(Array.from(selected.keys()))
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {(["library", "upload"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t === "library" ? "Thư viện" : "Upload"}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Đóng"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Folder selector (library tab only) */}
        {tab === "library" && folders.length > 0 && (
          <FolderSelector folders={folders} value={activeFolder} onChange={handleFolderChange} />
        )}

        {/* Body */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "library" ? (
            <LibraryTab
              key={libraryKey}
              folder={activeFolder}
              multiple={multiple}
              selected={new Set(selected.keys())}
              onToggle={toggleAsset}
            />
          ) : (
            <UploadTab
              folder={activeFolder as AllowedFolder}
              onUploaded={handleUploaded}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <span className="text-sm text-slate-400">
            {selected.size > 0 ? `Đã chọn ${selected.size} ảnh` : "Chưa chọn ảnh nào"}
          </span>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleInsert}
              disabled={!selected.size}
              className="cursor-pointer rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              Chèn {selected.size > 0 ? `(${selected.size})` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
