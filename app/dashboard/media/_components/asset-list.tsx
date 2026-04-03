"use client"
import { useCopy } from "@/hooks/use-copy"
import { type CloudinaryResource } from "@/lib/upload-api"

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

interface Props {
  assets: CloudinaryResource[]
  selected: Set<string>
  active: string | null
  onToggle: (id: string) => void
  onSelect: (a: CloudinaryResource) => void
}

export function AssetList({ assets, selected, active, onToggle, onSelect }: Props) {
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
            <input
              type="checkbox"
              checked={isSel}
              onChange={e => { e.stopPropagation(); onToggle(a.asset_id) }}
              onClick={e => e.stopPropagation()}
              className="h-4 w-4 shrink-0 cursor-pointer accent-indigo-600"
            />
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              <img src={a.secure_url} alt={a.display_name} className="h-full w-full object-cover" loading="lazy" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{a.display_name}</p>
              <p className="text-xs text-slate-400">{a.width}×{a.height} · {formatBytes(a.bytes)} · {formatDate(a.created_at)}</p>
            </div>
            <span className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
              {a.format}
            </span>
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
