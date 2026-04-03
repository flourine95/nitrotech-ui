"use client"
import { useCopy } from "@/hooks/use-copy"
import { formatBytes } from "@/lib/utils"
import { type CloudinaryResource } from "@/lib/upload-api"
import { type AssetViewProps } from "./types"

export function AssetGrid({
  assets,
  selected,
  active,
  onToggle,
  onSelect,
}: AssetViewProps) {
  const { copied, copy } = useCopy()

  if (!assets.length)
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <svg
          viewBox="0 0 24 24"
          className="mb-3 h-14 w-14 text-slate-200"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <p className="text-sm font-medium text-slate-500">Chưa có ảnh nào</p>
        <p className="mt-1 text-xs text-slate-400">
          Upload ảnh đầu tiên vào folder này
        </p>
      </div>
    )

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {assets.map((a) => {
        const isSel = selected.has(a.asset_id)
        const isActive = active === a.asset_id
        return (
          <div
            key={a.asset_id}
            onClick={() => onSelect(a)}
            className={`group relative aspect-square cursor-pointer overflow-hidden rounded-xl transition-all duration-150 ${
              isActive
                ? "ring-2 ring-indigo-500 ring-offset-2"
                : isSel
                  ? "ring-2 ring-indigo-400 ring-offset-1"
                  : "hover:ring-2 hover:ring-slate-300 hover:ring-offset-1"
            }`}
          >
            <img
              src={a.secure_url}
              alt={a.display_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/25" />

            {/* Checkbox */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle(a.asset_id)
              }}
              className={`absolute top-2 left-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border-2 transition-all duration-150 ${
                isSel
                  ? "border-indigo-500 bg-indigo-500 opacity-100"
                  : "border-white/80 bg-black/20 opacity-0 group-hover:opacity-100"
              }`}
              aria-label="Chọn ảnh"
            >
              {isSel && (
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
            </button>

            {/* Copy URL */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                copy(a.secure_url, a.asset_id)
              }}
              className="absolute top-2 right-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-black/30 text-white opacity-0 backdrop-blur-sm transition-all duration-150 group-hover:opacity-100 hover:bg-black/50"
              title="Copy URL"
            >
              {copied === a.asset_id ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-3 w-3 text-green-400"
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
            </button>

            {/* Info bar */}
            <div className="absolute right-0 bottom-0 left-0 z-10 translate-y-full bg-gradient-to-t from-black/70 to-transparent px-2 pt-4 pb-2 transition-transform duration-200 group-hover:translate-y-0">
              <p className="truncate text-xs font-medium text-white">
                {a.display_name}
              </p>
              <p className="text-[10px] text-white/70">
                {a.width}×{a.height} · {formatBytes(a.bytes)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
