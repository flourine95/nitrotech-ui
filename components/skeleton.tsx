import { cn } from "@/lib/utils"

// ── Base skeleton ──────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />
  )
}

// ── Product card skeleton ──────────────────────────────────────
export function SkeletonProductCard() {
  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* Image area */}
      <div className="h-44 animate-pulse bg-slate-200" />
      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-3 w-20 rounded-full" />
        <Skeleton className="h-4 w-3/4 rounded-full" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24 rounded-full" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <Skeleton className="h-9 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// ── Text skeleton ──────────────────────────────────────────────
export function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3 rounded-full",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  )
}

// ── Avatar skeleton ────────────────────────────────────────────
export function SkeletonAvatar({ size = 10 }: { size?: number }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-slate-200 w-${size} h-${size} shrink-0`}
    />
  )
}

// ── Banner skeleton ────────────────────────────────────────────
export function SkeletonBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-48 w-full animate-pulse rounded-2xl bg-slate-200 sm:h-64",
        className
      )}
    />
  )
}
