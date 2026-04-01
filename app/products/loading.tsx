import { SkeletonProductCard } from "@/components/skeleton"

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar placeholder */}
          <div className="hidden w-60 shrink-0 lg:block" aria-hidden="true">
            <div className="sticky top-36 space-y-4">
              <div className="h-4 w-20 animate-pulse rounded-full bg-slate-200" />
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>
          </div>
          {/* Grid */}
          <div className="min-w-0 flex-1">
            <div className="mb-6 h-8 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonProductCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
